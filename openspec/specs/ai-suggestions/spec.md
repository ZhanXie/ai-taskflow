# ai-suggestions Specification

## Purpose
TBD - created by archiving change core-task-crud-with-ai-suggestions. Update Purpose after archive.
## Requirements
### Requirement: Generate AI suggestions

The system SHALL generate AI-powered suggestions for task priority and due date based on task title and description using OpenAI models.

#### Scenario: Trigger suggestion on create form

- **WHEN** user enters task title and clicks "AI Suggest" button
- **THEN** system calls AI to suggest priority and due date

#### Scenario: AI suggestion with only title

- **WHEN** user provides only a task title
- **THEN** system generates suggestions based on the title alone

#### Scenario: AI suggestion with title and description

- **WHEN** user provides both title and description
- **WHEN** user clicks "AI Suggest"
- **THEN** system generates more contextual suggestions using both inputs

#### Scenario: Invalid suggestion request

- **WHEN** user clicks suggest without entering a title
- **THEN** system displays error message "Please enter a task title first"

### Requirement: Stream AI responses

The system SHALL stream AI suggestions to the client in real-time using streaming responses.

#### Scenario: Streaming response display

- **WHEN** AI suggestion is requested
- **THEN** suggested priority and due date appear progressively as the AI generates them

#### Scenario: User sees updates in real-time

- **WHEN** AI response is streaming
- **THEN** form fields update as suggestions arrive without waiting for complete response

### Requirement: Handle AI suggestion results

The system SHALL properly parse and apply AI-generated suggestions to the task form.

#### Scenario: Apply suggested priority

- **WHEN** AI suggests "high" priority for an urgent task
- **THEN** priority field is populated with "high" suggestion

#### Scenario: Apply suggested due date

- **WHEN** AI suggests a due date based on task content
- **THEN** due date field displays the suggested date in the correct format

#### Scenario: User can override suggestions

- **WHEN** AI suggestions are displayed
- **THEN** user can modify or reject suggested values before saving

#### Scenario: Accept suggestions

- **WHEN** user accepts the AI suggestions by clicking "Use these suggestions"
- **THEN** the suggested priority and due date are populated in the form

### Requirement: Error handling for AI operations

The system SHALL gracefully handle AI API failures and timeouts.

#### Scenario: API rate limit exceeded

- **WHEN** OpenAI API rate limit is hit
- **THEN** system displays "Too many suggestions. Please try again in a moment."

#### Scenario: AI service timeout

- **WHEN** AI request takes longer than 30 seconds
- **THEN** system displays timeout error and allows manual entry

#### Scenario: Invalid API response

- **WHEN** AI returns malformed or unexpected response
- **THEN** system logs error and displays "Could not generate suggestions. Please enter manually."

### Requirement: AI suggestion integration with task creation

The system SHALL integrate AI suggestions into the task creation workflow.

#### Scenario: Suggestion affects task creation

- **WHEN** user accepts AI suggestions and saves the task
- **THEN** the task is created with the suggested priority and due date

#### Scenario: Override suggestions on save

- **WHEN** user modifies suggested fields before saving
- **THEN** modified values are saved instead of the AI suggestions

### Requirement: Use OpenAI provider

The system SHALL use @ai-sdk/openai and streamText for generating suggestions.

#### Scenario: OpenAI API integration

- **WHEN** AI suggestion is triggered
- **THEN** request is sent to OpenAI using the streamText API

#### Scenario: Structured output format

- **WHEN** AI generates suggestions
- **THEN** response is parsed to extract priority (low/medium/high) and due date (YYYY-MM-DD)

#### Scenario: Secure API credentials

- **WHEN** accessing OpenAI API
- **THEN** API key is stored securely as environment variable and never exposed to client

# 新增需求

