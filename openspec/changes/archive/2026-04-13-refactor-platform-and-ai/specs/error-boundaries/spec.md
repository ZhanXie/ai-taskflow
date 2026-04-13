## ADDED Requirements

### Requirement: Task Page Error Boundary
The tasks page SHALL have an `error.tsx` file that catches rendering errors and displays a user-friendly error message with a retry button. Users SHALL NOT see a blank screen when a component throws.

#### Scenario: Component render error
- **WHEN** a component in the tasks page throws during rendering
- **THEN** the error boundary displays a "Something went wrong" message with a "Try again" button

#### Scenario: Retry after error
- **WHEN** user clicks "Try again"
- **THEN** the page attempts to re-render

### Requirement: Task Page Loading Boundary
The tasks page SHALL have a `loading.tsx` file that displays a loading indicator while tasks are being fetched. This enables Next.js streaming/partial rendering.

#### Scenario: Initial page load
- **WHEN** user navigates to `/tasks`
- **THEN** a loading skeleton is displayed while server data is fetched

### Requirement: No Full Page Reloads
Client components SHALL NOT use `window.location.reload()` for state updates. State changes SHALL be handled through React state callbacks and re-renders.

#### Scenario: Task status change
- **WHEN** user changes a task's status via `TaskCard`
- **THEN** the server action completes and the parent component's state updates without a full page reload

#### Scenario: Task deletion
- **WHEN** user deletes a task via `TaskCard`
- **THEN** the task is removed from the UI state without a full page reload
