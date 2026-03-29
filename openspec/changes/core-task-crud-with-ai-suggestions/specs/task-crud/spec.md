# Task CRUD Specification

## ADDED Requirements

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
## 需求1：创建任务
系统应允许已认证用户创建新任务，任务包含**标题**、**可选描述**、**状态**、**优先级**及**可选截止日期**。

### 场景：任务创建成功
- 当用户填写标题并点击「创建任务」时
- 系统将创建一条新任务，默认状态为「待办（todo）」、优先级为「中等（medium）」，并将任务存入数据库

### 场景：填写可选字段创建任务
- 当用户填写标题、描述、优先级和截止日期时
- 系统将所有字段与任务记录一并保存

### 场景：缺少必填字段
- 当用户未填写标题便尝试创建任务时
- 系统显示校验错误提示，且不创建该任务

---

## 需求2：查看任务
系统应允许已认证用户查看自己的任务列表及完整详情。

### 场景：查看全部任务
- 当用户访问 `/tasks` 页面时
- 系统展示该用户所有任务，包含ID、标题、描述、状态、优先级和截止日期

### 场景：任务列表为空
- 当用户暂无任何任务时
- 系统显示空状态，并提示「创建你的第一个任务」

### 场景：任务列表排序
- 当用户查看任务列表时
- 任务按创建时间排序（最新创建的排在最前）

---

## 需求3：更新任务
系统应允许已认证用户修改已有任务的详情。

### 场景：更新任务标题
- 当用户编辑任务标题并保存时
- 系统立即在数据库中更新该任务标题

### 场景：更新任务状态
- 当用户将任务状态修改为「进行中（in-progress）」或「已完成（done）」时
- 系统更新状态字段，同时保留任务其他数据

### 场景：同时更新多个字段
- 当用户同时修改标题、描述、优先级和截止日期时
- 所有修改内容均持久化保存至数据库

### 场景：未授权尝试更新任务
- 当用户尝试更新他人任务时
- 系统拒绝该请求并返回 **403 禁止访问** 状态码

---

## 需求4：删除任务
系统应允许已认证用户删除自己的任务。

### 场景：任务删除成功
- 当用户点击「删除」并确认时
- 该任务从数据库移除，并不再显示在任务列表中

### 场景：删除前确认
- 当用户点击删除按钮时
- 系统弹出确认对话框，再执行永久删除操作

### 场景：未授权尝试删除任务
- 当用户尝试删除他人任务时
- 系统拒绝该请求并返回 **403 禁止访问** 状态码

---

## 需求5：任务数据模型
系统应按以下字段存储任务：
- ID（唯一标识）
- 标题（字符串，必填）
- 描述（字符串，可选）
- 状态（枚举值：待办、进行中、已完成）
- 优先级（枚举值：低、中、高）
- 截止日期（日期类型，可选）
- 创建时间（时间戳）
- 用户ID（关联Clerk用户的外键）

### 场景：任务持久化
- 当任务创建完成时
- 所有字段均正确存储，且在多次数据库查询中保持数据一致

### 场景：用户数据隔离
- 当查询任务时
- 系统仅返回属于当前已认证用户的任务

---

## 需求6：服务端操作
系统所有增删改查（CRUD）操作均需通过 **Next.js 服务端动作（Server Actions）** 实现。

### 场景：通过服务端动作创建任务
- 当用户提交创建表单时
- 执行服务端动作函数，并完成正确的身份校验

### 场景：通过服务端动作更新任务
- 当用户更新任务时
- 该操作由服务端动作处理，并通过Clerk完成身份认证

### 场景：通过服务端动作删除任务
- 当用户删除任务时
- 由服务端执行删除操作，并通过服务端动作完成权限校验