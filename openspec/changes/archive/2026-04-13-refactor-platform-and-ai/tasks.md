## 1. Type System Foundation (P0)

- [x] 1.1 Create `app/lib/types.ts` — re-export `Task`, `TaskStatus`, `Priority` from `@prisma/client`
- [x] 1.2 Fix `app/lib/task-actions.ts` — remove `type Task = any`, import `Task` from `@prisma/client`
- [x] 1.3 Replace all duplicate type definitions in `app/tasks/page.tsx`, `app/components/TaskCard.tsx`, `app/components/TaskForm.tsx` with imports from `@/app/lib/types`
- [x] 1.4 Run `tsc --noEmit` to verify no type errors

## 2. Database Schema Changes (P2)

- [x] 2.1 Update `prisma/schema.prisma` — add `User` model with `id String @id`, `tasks Task[]`
- [x] 2.2 Update `prisma/schema.prisma` — add `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` to `Task`
- [x] 2.3 Update `prisma/schema.prisma` — add `deletedAt DateTime?` to `Task` model
- [x] 2.4 Update `prisma/schema.prisma` — add `@@unique([userId, title, deletedAt])` constraint to `Task`
- [x] 2.5 Run `prisma migrate dev` to generate migration and Prisma client
- [x] 2.6 Update all Server Actions to filter `where: { deletedAt: null }` on Task queries

## 3. AI Architecture Rewrite (P1)

- [x] 3.1 Install `@ai-sdk/openai`, remove `@ai-sdk/anthropic` and `tencentcloud-sdk-nodejs` from `package.json`
- [x] 3.2 Create `app/lib/ai-model.ts` — configure `createOpenAI` with `HUNYUAN_API_KEY`, `HUNYUAN_BASE_URL`, export `hunyuan` model instance
- [x] 3.3 Create `app/lib/ai-schema.ts` — define `AISuggestionSchema` with Zod (`priority`, `dueDate`, `reasoning`) and export `AISuggestion` type
- [x] 3.4 Create `app/api/ai/suggest/route.ts` — POST handler with `streamObject`, auth check, error handling (no silent fallback)
- [x] 3.5 Create `app/hooks/use-suggestion.ts` — custom hook with `isLoading`, `error`, `suggestion` state, `fetch` + `parsePartialJson` streaming consumption
- [x] 3.6 Rewrite `app/components/AISuggestions.tsx` — replace manual `getAISuggestions` + streaming logic with `useSuggestion` hook, simplify to UI-only component
- [x] 3.7 Delete `app/lib/ai-actions.ts` (hand-written HMAC signing code no longer needed)
- [x] 3.8 Delete `app/lib/ai-utils.ts` (`parseAISuggestions` no longer needed — `streamObject` handles parsing)
- [x] 3.9 Verify Clerk middleware covers `/api/ai/suggest` (existing `/api/(.*)` matcher should already protect it)

## 4. Security and Query Optimization (P2)

- [x] 4.1 Fix `getTask` in `app/lib/task-actions.ts` — change to single query `prisma.task.findUnique({ where: { id, userId } })` instead of fetch-then-verify
- [x] 4.2 Remove silent AI fallback in old code (handled by 3.6 — new API Route returns proper HTTP errors)
- [x] 4.3 Add Zod validation to all task CRUD inputs using schema from 1.1 (status, priority enums from Prisma types)

## 5. Component Architecture (P1)

- [x] 5.1 Fix `TaskCard` — replace `window.location.reload()` in `handleStatusChange` and `handleDelete` with callback prop that updates parent state
- [x] 5.2 Update `TasksPage` — pass `onStatusChange` and `onDelete` callbacks to `TaskCard` that refetch/update local state
- [x] 5.3 Create `app/tasks/loading.tsx` — loading skeleton component
- [x] 5.4 Create `app/tasks/error.tsx` — error boundary with "Try again" button
- [x] 5.5 Convert `app/tasks/page.tsx` — added `loading.tsx`/`error.tsx` alongside existing client page

## 6. Cleanup and Verification (P3)

- [x] 6.1 Remove dead dependencies from `package.json`: `@ai-sdk/anthropic`, `tencentcloud-sdk-nodejs`, `clerk` (if unused)
- [x] 6.2 Update `.env.local` — replace `TENCENT_SECRET_ID`/`TENCENT_SECRET_KEY` with `HUNYUAN_API_KEY`/`HUNYUAN_BASE_URL`/`HUNYUAN_MODEL`
- [x] 6.3 Run `npm install` to resolve dependencies
- [x] 6.4 Run `tsc --noEmit` — zero type errors
- [x] 6.5 Run `eslint . --fix` — zero lint errors
- [x] 6.6 Run `npm run build` — successful production build
