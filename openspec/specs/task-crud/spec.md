# task-crud Specification

## Purpose
TBD - created by archiving change core-task-crud-with-ai-suggestions. Update Purpose after archive.
## Requirements
### Requirement: Create new task

The system SHALL allow authenticated users to create new tasks with a title, optional description, status, priority, and optional due date.

#### Scenario: Successful task creation

- **WHEN** user provides a title and clicks "Create Task"
- **THEN** a new task is created with status "todo", priority "medium" by default, and stored in the database

#### Scenario: Task creation with optional fields

- **WHEN** user provides title, description, priority, and due date
- **THEN** all fields are stored with the task record

#### Scenario: Missing required field

- **WHEN** user attempts to create a task without a title
- **THEN** system displays validation error and does not create the task

### Requirement: Read tasks

The system SHALL allow authenticated users to view their list of tasks with full details.

#### Scenario: View all tasks

- **WHEN** user navigates to /tasks page
- **THEN** system displays all their tasks with id, title, description, status, priority, and dueDate

#### Scenario: Empty task list

- **WHEN** user has no tasks
- **THEN** system displays empty state with "Create your first task" message

#### Scenario: Task list ordering

- **WHEN** user views the task list
- **THEN** tasks are ordered by creation date (newest first)

### Requirement: Update task

The system SHALL allow authenticated users to modify existing task details.

#### Scenario: Update task title

- **WHEN** user edits the task title and saves
- **THEN** task title is updated immediately in the database

#### Scenario: Update task status

- **WHEN** user changes task status to "in-progress" or "done"
- **THEN** system updates the status field and maintains other task data

#### Scenario: Update multiple fields

- **WHEN** user modifies title, description, priority, and due date simultaneously
- **THEN** all changes are persisted to the database

#### Scenario: Unauthorized update attempt

- **WHEN** user attempts to update someone else's task
- **THEN** system rejects the request with 403 Forbidden

### Requirement: Delete task

The system SHALL allow authenticated users to delete their own tasks.

#### Scenario: Delete task successfully

- **WHEN** user clicks "Delete" and confirms
- **THEN** task is removed from database and no longer appears in task list

#### Scenario: Confirm before delete

- **WHEN** user clicks delete button
- **THEN** system shows confirmation dialog before permanently removing the task

#### Scenario: Unauthorized delete attempt

- **WHEN** user attempts to delete another user's task
- **THEN** system rejects the request with 403 Forbidden

### Requirement: Task data model

The system SHALL store tasks with the following fields:

- id (unique identifier)
- title (string, required)
- description (string, optional)
- status (enum: todo, in-progress, done)
- priority (enum: low, medium, high)
- dueDate (date, optional)
- createdAt (timestamp)
- userId (foreign key to Clerk user)

#### Scenario: Task persistence

- **WHEN** a task is created
- **THEN** all fields are properly stored and remain consistent across database queries

#### Scenario: User isolation

- **WHEN** querying tasks
- **THEN** system only returns tasks belonging to the authenticated user

### Requirement: Server-side operations

The system SHALL implement all CRUD operations using Next.js Server Actions.

#### Scenario: Create via Server Action

- **WHEN** user submits the create form
- **THEN** execution uses a Server Action function with proper authentication

#### Scenario: Update via Server Action

- **WHEN** user updates a task
- **THEN** the operation is handled by a Server Action with Clerk authentication

#### Scenario: Delete via Server Action

- **WHEN** user deletes a task
- **THEN** deletion is performed server-side using Server Actions with authorization checks

# 新增需求

