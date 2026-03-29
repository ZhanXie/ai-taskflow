# AI Suggestions Specification

## ADDED Requirements

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
## 需求1：生成AI建议
系统应基于任务标题和描述，通过OpenAI模型生成**AI智能建议**，用于推荐任务优先级与截止日期。

### 场景：在创建表单触发建议
- 当用户输入任务标题并点击「AI建议」按钮时
- 系统调用AI接口，生成优先级与截止日期建议

### 场景：仅通过标题生成AI建议
- 当用户仅提供任务标题时
- 系统仅根据标题生成对应建议

### 场景：通过标题+描述生成AI建议
- 当用户同时提供任务标题和描述时
- 当用户点击「AI建议」时
- 系统结合两项内容，生成更贴合上下文的建议

### 场景：无效的建议请求
- 当用户未输入标题就点击建议按钮时
- 系统显示错误提示：**“请先输入任务标题”**

---

## 需求2：流式返回AI响应
系统应使用**流式响应**，将AI建议**实时流式推送**至客户端。

### 场景：流式响应展示
- 当发起AI建议请求时
- 推荐的优先级与截止日期会随AI生成过程逐步显示

### 场景：用户实时看到更新
- 当AI响应正在流式传输时
- 表单字段会随建议内容实时更新，无需等待完整响应返回

---

## 需求3：处理AI建议结果
系统应正确解析AI生成的建议，并将其应用到任务表单中。

### 场景：应用推荐的优先级
- 当AI为紧急任务建议「高优先级（high）」时
- 优先级字段自动填充为「高」

### 场景：应用推荐的截止日期
- 当AI根据任务内容推荐截止日期时
- 截止日期字段按正确格式显示该日期

### 场景：用户可覆盖建议内容
- 当AI建议显示后
- 用户可在保存前修改或拒绝推荐值

### 场景：接受建议
- 当用户点击「使用这些建议」接受AI推荐时
- 推荐的优先级与截止日期自动填入对应表单字段

---

## 需求4：AI操作异常处理
系统应优雅处理AI接口调用失败与超时问题。

### 场景：接口调用频率超限
- 当触发OpenAI API调用频率限制时
- 系统显示提示：**“建议请求过于频繁，请稍后再试。”**

### 场景：AI服务超时
- 当AI请求超过30秒未响应时
- 系统显示超时错误，并允许用户手动填写

### 场景：无效的API响应
- 当AI返回格式错误或不符合预期的响应时
- 系统记录错误日志，并显示：**“无法生成建议，请手动输入。”**

---

## 需求5：AI建议与任务创建流程集成
系统应将AI建议完整集成到任务创建工作流中。

### 场景：建议影响任务创建结果
- 当用户接受AI建议并保存任务时
- 任务将使用AI推荐的优先级与截止日期创建

### 场景：保存时覆盖AI建议
- 当用户在保存前修改了AI推荐的字段时
- 系统保存用户修改后的值，而非AI建议值

---

## 需求6：使用OpenAI服务提供商
系统应使用 `@ai-sdk/openai` 与 `streamText` 实现建议生成。

### 场景：OpenAI API集成
- 当触发AI建议时
- 系统通过 `streamText` API向OpenAI发送请求

### 场景：结构化输出格式
- 当AI生成建议时
- 系统解析响应，提取优先级（低/中/高）与截止日期（YYYY-MM-DD格式）

### 场景：安全的API凭证
- 当访问OpenAI API时
- API密钥以环境变量形式安全存储，**绝不暴露给客户端**