## ADDED Requirements

### Requirement: Unified Type Source
All TypeScript type definitions for `Task`, `TaskStatus`, and `Priority` SHALL be imported from `@prisma/client`. No manual type definitions SHALL exist in component files or action files.

#### Scenario: Component uses Prisma type
- **WHEN** `TaskCard.tsx` imports `Task`
- **THEN** it imports from `@prisma/client`, not a local type definition

#### Scenario: No duplicate types in codebase
- **WHEN** searching the codebase for `type Task =` or `type TaskStatus =`
- **THEN** no local definitions are found (all come from `@prisma/client`)

### Requirement: Atomic Ownership Queries
The `getTask` Server Action SHALL filter by both `id` and `userId` in a single Prisma query (`where: { id, userId }`). The system SHALL NOT fetch by ID alone and then verify ownership.

#### Scenario: User accesses own task
- **WHEN** user A requests task with ID that belongs to user A
- **THEN** the task is returned in a single query

#### Scenario: User accesses another user's task
- **WHEN** user A requests task with ID that belongs to user B
- **THEN** the query returns `null` (because `where: { id, userId }` fails) and an unauthorized error is thrown

### Requirement: Zod Schema Synchronized with Prisma Enums
Zod validation schemas in Server Actions SHALL derive enum values from Prisma-generated types, not hardcoded arrays. If Prisma enums change, Zod schemas automatically reflect the change.

#### Scenario: Task creation validation
- **WHEN** `createTask` receives `{ status: "INVALID_STATUS" }`
- **THEN** Zod validation fails with a type error

### Requirement: Type-Safe Task CRUD
All task CRUD Server Actions (`createTask`, `updateTask`, `deleteTask`, `getTask`, `listTasks`) SHALL use Prisma-generated types for input and return values. The `type Task = any` definition SHALL be removed.

#### Scenario: createTask returns typed result
- **WHEN** `createTask` is called
- **THEN** it returns a `Task` type from `@prisma/client` with all fields properly typed

#### Scenario: updateTask validates input
- **WHEN** `updateTask` is called with `{ priority: "CRITICAL" }`
- **THEN** Zod validation rejects the input (only `LOW`, `MEDIUM`, `HIGH` are valid)
