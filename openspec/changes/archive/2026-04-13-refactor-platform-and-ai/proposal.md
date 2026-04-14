## Why

The codebase has accumulated several structural issues that compound each other: duplicate type definitions across 4 files, `type Task = any` defeating TypeScript, ~200 lines of hand-written HMAC-SHA256 signing code for the Tencent Hunyuan AI API, dead dependencies, and missing error boundaries. These issues make the code harder to maintain, less type-safe, and the AI integration unreliable (silent fallbacks on errors, fake "streaming"). This change consolidates the type system, rewrites the AI layer using Vercel AI SDK, fixes security and data integrity issues, and improves the component architecture — all in a bottom-up refactoring approach.

## What Changes

- **Type System**: Consolidate all duplicate `Task`, `TaskStatus`, `TaskPriority` definitions into a single source of truth using Prisma-generated types. Remove `type Task = any`.
- **AI Architecture**: Replace the hand-written Tencent Hunyuan API integration (~200 lines of TC3-HMAC-SHA256 signing + manual fetch) with `@ai-sdk/openai` pointing to Hunyuan's OpenAI-compatible endpoint. Switch from Server Action `ReadableStream` to API Route + `streamObject` with `parsePartialJson` for true streaming structured responses. Add Zod schema for type-safe AI output.
- **Database Model**: Add `User` model with Clerk userId relation, task-to-user foreign key with cascade delete, composite unique constraint on `[userId, title]`, and optional soft delete.
- **Security**: Fix `getTask` to filter by userId in a single query instead of fetch-then-verify. Remove silent AI fallbacks — errors propagate correctly.
- **Component Architecture**: Replace `window.location.reload()` in `TaskCard` with state callback. Convert `TasksPage` to Server Component + Client Component split with `loading.tsx` and `error.tsx` boundaries.
- **Dependencies**: Remove dead dependencies (`@ai-sdk/anthropic`, `tencentcloud-sdk-nodejs`). Add `@ai-sdk/openai`.

## Capabilities

### New Capabilities
- `ai-suggestion-api`: API Route-based AI suggestion generation using Vercel AI SDK `streamObject` with Tencent Hunyuan OpenAI-compatible endpoint. Supports true streaming with `parsePartialJson` for progressive UI updates, Zod-validated structured responses, and proper error propagation.
- `task-domain-model`: Prisma schema with `Task` and `User` models, foreign key relations, cascade delete on user removal, composite unique constraint `[userId, title]`, and soft delete support (`deletedAt`).
- `task-api`: Server Actions for task CRUD with proper TypeScript typing, userId-filtered queries, and Zod validation schemas synchronized with Prisma enums.
- `error-boundaries`: Next.js `error.tsx` and `loading.tsx` boundaries for the tasks page, providing graceful error recovery and streaming UI during data fetches.

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Affected code**: `app/lib/ai-actions.ts` (deleted), `app/lib/ai-utils.ts` (deleted), `app/components/AISuggestions.tsx` (rewritten), `app/components/TaskCard.tsx` (reload removed), `app/tasks/page.tsx` (SSR split), `app/lib/task-actions.ts` (types fixed), `prisma/schema.prisma` (User model added)
- **New files**: `app/lib/ai-model.ts`, `app/lib/ai-schema.ts`, `app/api/ai/suggest/route.ts`, `app/hooks/use-suggestion.ts`, `app/lib/types.ts`
- **Dependencies**: Remove `@ai-sdk/anthropic`, `tencentcloud-sdk-nodejs`. Add `@ai-sdk/openai`.
- **Environment variables**: `TENCENT_SECRET_ID`/`TENCENT_SECRET_KEY` → `HUNYUAN_API_KEY`/`HUNYUAN_BASE_URL`/`HUNYUAN_MODEL`
- **Database**: New migration required (User model, relations, constraints)
