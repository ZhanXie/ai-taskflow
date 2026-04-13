## Context

The project is a Next.js 16 (App Router) task management app with AI-powered suggestions. It uses Clerk for authentication, PostgreSQL/Prisma for data, and currently integrates Tencent Hunyuan AI via hand-written HTTP calls with TC3-HMAC-SHA256 signing (~200 lines of custom crypto code). The AI response is wrapped in a fake `ReadableStream` (non-streaming API call + single-chunk wrapper) and parsed client-side with manual JSON extraction.

Key issues in the current codebase:
- Types (`Task`, `TaskStatus`, `TaskPriority`) are duplicated in 4 files, with `type Task = any` in `task-actions.ts` defeating TypeScript
- Dead dependencies: `@ai-sdk/anthropic`, `ai`, `tencentcloud-sdk-nodejs` are installed but unused
- `window.location.reload()` used for state updates in `TaskCard`
- No error/loading boundaries — component errors produce blank screens
- `getTask` fetches then verifies ownership (two-step) instead of single atomic query
- No `User` model — `userId` is an orphan string with no foreign key

## Goals / Non-Goals

**Goals:**
- Replace hand-written AI integration with Vercel AI SDK (`@ai-sdk/openai` + `streamObject` + `parsePartialJson`)
- Consolidate all type definitions to single source of truth (Prisma-generated types)
- Add `User` model with proper Task relations, cascade delete, and composite unique constraints
- Fix security issue in `getTask` (atomic userId-filtered query)
- Replace `window.location.reload()` with proper state callbacks
- Add `error.tsx` and `loading.tsx` boundaries
- Remove dead dependencies
- Proper error propagation — no silent AI fallbacks

**Non-Goals:**
- Multi-turn chat / conversation UI (the `useChat` hook is not used — we use `streamText` + custom hook for single-shot suggestions)
- Rate limiting middleware (noted as future work)
- Real-time collaboration features
- REST/JSON API for external consumers

## Decisions

### D1: API Route over Server Action for AI

**Decision:** Use `app/api/ai/suggest/route.ts` (API Route) instead of Server Action.

**Rationale:**
- `streamObject` from Vercel AI SDK works natively with API Routes for SSE streaming
- Clerk middleware already protects `/api/(.*)` via existing matcher — no additional auth wiring needed
- Cleaner separation: AI logic is independent from task CRUD logic

**Alternatives considered:**
- Server Action + `useChat({ use: serverAction })` — viable but less flexible for custom streaming
- Server Action + manual `ReadableStream` — this is what we're replacing

### D2: `streamObject` + `parsePartialJson` for Structured Streaming

**Decision:** Use `streamObject` (not `streamText`) on server, and `parsePartialJson` on client for progressive UI updates.

**Rationale:**
- `streamObject` returns Zod-validated, type-safe JSON objects — no manual parsing needed
- `parsePartialJson` enables the client to show fields as they arrive (e.g., priority appears before reasoning is complete)
- Current code shows raw JSON text to users during streaming — this is a poor UX

### D3: Custom `useSuggestion` Hook over `useChat`

**Decision:** Build a custom `useSuggestion` hook instead of using `useChat`.

**Rationale:**
- The interaction is single-shot: user clicks "AI Suggest" → get one response → apply/dismiss
- `useChat` is designed for multi-turn conversations with message history — overkill for this use case
- Custom hook gives us full control over the streaming consumption and state shape

**Future:** If multi-turn AI assistant is needed, migrate to `useChat` at that point.

### D4: Hunyuan via OpenAI Compatible API

**Decision:** Use `@ai-sdk/openai` with `baseURL: https://api.hunyuan.cloud.tencent.com/v1` instead of native Hunyuan API.

**Rationale:**
- Tencent Hunyuan provides full OpenAI-compatible endpoints
- Zero custom signing code needed — standard OpenAI auth (`Bearer` token)
- `@ai-sdk/openai` handles streaming, retries, and error handling out of the box

**Environment variables:**
```
HUNYUAN_API_KEY=sk-xxx
HUNYUAN_BASE_URL=https://api.hunyuan.cloud.tencent.com/v1
HUNYUAN_MODEL=hunyuan-lite
```

### D5: Single Migration for Database Changes

**Decision:** Apply all Prisma schema changes (User model, relations, constraints) in one migration rather than incremental migrations.

**Rationale:**
- Project is in early development (only one `init` migration exists)
- Single migration is cleaner and easier to reason about
- No production data to worry about incremental migration safety

### D6: Soft Delete via `deletedAt`

**Decision:** Add `deletedAt DateTime?` field to Task model for soft delete capability.

**Rationale:**
- Enables undo for accidental deletions
- Maintains audit trail
- All queries filter `where: { deletedAt: null }` by default

### D7: Remove Dead Dependencies

**Decision:** Remove `@ai-sdk/anthropic`, `tencentcloud-sdk-nodejs`. Keep `ai` package (needed for `parsePartialJson` on client). Add `@ai-sdk/openai`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `parsePartialJson` may produce partial objects that change between chunks | Client validates complete object before applying to form state; partial updates only for display |
| Switching from Server Action to API Route adds network round-trip | Negligible in practice; Server Actions are also network calls under the hood |
| Prisma migration adding `userId` foreign key could fail if orphan tasks exist | Early stage project — no production data. If needed, manually clean up before migration |
| `streamObject` requires LLM to output valid JSON — model may produce malformed output | Zod schema validation catches this; error propagates to client as HTTP 500 |
| Custom hook means we can't use `useChat`'s built-in message management | Not needed for single-shot use case; the hook is ~50 lines |
| Environment variable change (`TENCENT_SECRET_*` → `HUNYUAN_*`) | Breaking change — documented in proposal impact section |

## Migration Plan

1. **Phase 1-2 (Foundation):** Fix types, update Prisma schema, run single migration
2. **Phase 3 (AI Rewrite):** Add new AI files, switch `AISuggestions.tsx` to use new hook, delete old AI files
3. **Phase 4-5 (Security + UI):** Fix `getTask` ownership query, add error/loading boundaries, fix `TaskCard` reload
4. **Phase 6 (Cleanup):** Remove dead dependencies, update `.env.local`

**Rollback:** Since this is a significant refactor with database changes, rollback would require:
- Reverting git commit
- Running `prisma migrate reset` (destructive)
- Restoring `TENCENT_SECRET_*` env vars

For a production system, this would warrant feature flags and gradual rollout. For current early-stage project, full revert is acceptable.

## Open Questions

- None at this time. All decisions have been resolved through exploration.
