## ADDED Requirements

### Requirement: AI Suggestion API Endpoint
The system SHALL provide a POST API endpoint at `/api/ai/suggest` that accepts a task title and optional description, and returns AI-generated priority, due date, and reasoning suggestions via Server-Sent Events (SSE) streaming.

#### Scenario: Successful suggestion generation
- **WHEN** authenticated user POSTs `{ title: "Review Q2 report", description: "Due end of month" }` to `/api/ai/suggest`
- **THEN** the system returns an SSE stream containing a valid `AISuggestion` object with `priority`, `dueDate`, and `reasoning` fields

#### Scenario: Missing task title
- **WHEN** user POSTs `{ title: "" }` to `/api/ai/suggest`
- **THEN** the system returns HTTP 400 with error message "Title is required"

#### Scenario: Unauthenticated request
- **WHEN** unauthenticated user POSTs to `/api/ai/suggest`
- **THEN** the system returns HTTP 401 (enforced by Clerk middleware)

### Requirement: Vercel AI SDK streamObject Integration
The API endpoint SHALL use `streamObject` from Vercel AI SDK with a Zod schema to produce type-safe, structured JSON responses. The model SHALL be configured via `@ai-sdk/openai` with `baseURL` pointing to Tencent Hunyuan's OpenAI-compatible endpoint.

#### Scenario: streamObject returns validated object
- **WHEN** the AI model returns a response
- **THEN** `streamObject` validates it against the `AISuggestionSchema` Zod schema before streaming to client

#### Scenario: Model returns invalid JSON
- **WHEN** the AI model returns malformed JSON
- **THEN** the system returns HTTP 500 with error message (no silent fallback)

### Requirement: Environment-Based AI Configuration
The AI model SHALL be configured using environment variables `HUNYUAN_API_KEY`, `HUNYUAN_BASE_URL`, and `HUNYUAN_MODEL`. Missing credentials SHALL cause a startup error, not a runtime silent fallback.

#### Scenario: Missing API key
- **WHEN** `HUNYUAN_API_KEY` is not set
- **THEN** the application throws an error on first AI request (fail-fast)

#### Scenario: All credentials configured
- **WHEN** `HUNYUAN_API_KEY`, `HUNYUAN_BASE_URL`, and `HUNYUAN_MODEL` are all set
- **THEN** the AI model connects successfully

### Requirement: Client-Side Partial JSON Streaming
The client SHALL use `parsePartialJson` from the `ai` package to progressively parse the SSE stream, enabling UI fields to appear as they arrive (priority before reasoning). Partial objects are displayed to the user; only complete validated objects are applied to form state.

#### Scenario: Progressive field display
- **WHEN** the SSE stream is being consumed
- **THEN** `parsePartialJson` extracts completed fields (e.g., `priority`) and updates the UI incrementally

#### Scenario: Complete object received
- **WHEN** the SSE stream is fully consumed and a valid `AISuggestion` object is parsed
- **THEN** the complete suggestion is available for the user to apply

### Requirement: Error Propagation (No Silent Fallback)
AI errors (network failure, rate limits, invalid credentials, model errors) SHALL propagate to the client as meaningful error messages. The system SHALL NOT return fake default suggestions on error.

#### Scenario: AI service unavailable
- **WHEN** the Hunyuan API returns an error
- **THEN** the client receives a descriptive error message (e.g., "AI service unavailable") and NO suggestion object

#### Scenario: Network timeout
- **WHEN** the request to Hunyuan times out
- **THEN** the client receives a timeout error message
