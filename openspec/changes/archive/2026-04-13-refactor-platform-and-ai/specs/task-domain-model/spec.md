## ADDED Requirements

### Requirement: User Model
The system SHALL define a `User` model in the Prisma schema that represents authenticated users managed by Clerk. The `id` field SHALL store the Clerk user ID as a string.

#### Scenario: User record creation
- **WHEN** a new authenticated user performs their first action
- **THEN** a `User` record is created with the Clerk `userId` as the `id`

### Requirement: Task-User Relationship
Each `Task` SHALL have a required foreign key relationship to a `User` via `userId`. When a `User` is deleted, all their associated `Task` records SHALL be cascade-deleted.

#### Scenario: Task creation with user
- **WHEN** a task is created
- **THEN** it is associated with the authenticated user's `userId`

#### Scenario: User deletion cascades to tasks
- **WHEN** a `User` record is deleted (e.g., via Clerk webhook or admin action)
- **THEN** all `Task` records belonging to that user are automatically deleted

### Requirement: Composite Unique Constraint
The system SHALL enforce a composite unique constraint on `Task` such that a user cannot have two non-deleted tasks with the same title. The constraint is `@@unique([userId, title, deletedAt])`.

#### Scenario: Duplicate task prevention
- **WHEN** a user creates a task with title "Review report" and another task with the same title already exists (and is not soft-deleted)
- **THEN** the database rejects the insert with a unique constraint violation

#### Scenario: Deleted task allows reuse of title
- **WHEN** a user soft-deletes a task titled "Review report"
- **THEN** the user can create a new task with the same title

### Requirement: Soft Delete Support
The `Task` model SHALL include a `deletedAt DateTime?` field. Deleted tasks SHALL be excluded from all standard queries (list, get by ID, update) unless explicitly requested.

#### Scenario: Soft delete a task
- **WHEN** a user deletes a task
- **THEN** `deletedAt` is set to the current timestamp (task is not removed from database)

#### Scenario: List tasks excludes soft-deleted
- **WHEN** a user requests their task list
- **THEN** only tasks with `deletedAt: null` are returned

#### Scenario: Get task excludes soft-deleted
- **WHEN** a user requests a specific task by ID
- **THEN** the query returns the task only if `deletedAt: null`; otherwise returns not found

### Requirement: Prisma Migration
All schema changes (User model, Task-User relation, composite unique constraint, soft delete) SHALL be applied in a single Prisma migration.

#### Scenario: Migration applies cleanly
- **WHEN** `prisma migrate dev` is run on a clean database
- **THEN** all new tables, relations, and constraints are created successfully
