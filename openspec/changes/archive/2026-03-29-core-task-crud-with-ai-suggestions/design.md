# Design Document

## Context

The application requires a core task management system with:

- User authentication via Clerk
- CRUD operations for tasks with fields: id, title, description, status (todo/in-progress/done), priority (low/medium/high), dueDate, createdAt
- UI for task management at /tasks page (list view + create/edit/delete)
- AI-powered suggestions to automatically generate priority levels and due dates based on task title and description
- Support for streaming AI responses for improved UX

The project is built with Next.js, uses Prisma for ORM, and has TypeScript with strict mode requirements.

## Goals / Non-Goals

**Goals:**

- Provide full task CRUD functionality with Clerk authentication
- Implement AI suggestions using @ai-sdk/openai with streaming responses
- Build a responsive, accessible UI using Next.js and Tailwind CSS
- Use Server Actions for all data operations
- Support development with SQLite and production with Vercel Postgres
- Ensure strict TypeScript typing throughout

**Non-Goals:**

- Complex task hierarchies or subtasks (out of scope for core)
- Bulk operations or batch processing
- Advanced filtering or saved searches
- Collaborative/shared task lists
- Offline functionality

## Decisions

### Decision 1: Server Actions for all operations

- **Choice**: Use Next.js Server Actions for task CRUD and AI suggestions
- **Rationale**: Type-safe, reduces API boilerplate, handles authentication naturally, supports streaming for AI responses
- **Alternative considered**: REST API endpoints - would require more boilerplate and additional authentication layer

### Decision 2: Prisma ORM with database abstraction

- **Choice**: Use Prisma as the data layer with SQLite for dev, Vercel Postgres for production
- **Rationale**: Type-safe queries, easy schema management, simple local development with SQLite, scales to production database
- **Alternative considered**: Direct database queries - less type safety and more SQL to maintain

### Decision 3: Streaming AI responses

- **Choice**: Use @ai-sdk/openai with streamText for real-time AI suggestion display
- **Rationale**: Better UX - users see results progressively rather than waiting for complete response
- **Alternative considered**: Standard completions API - simpler but worse UX for latency

### Decision 4: Client components for interactive UI

- **Choice**: Use React client components for task form and AI suggestion display
- **Rationale**: Interactive form handling, real-time validation, streaming response display
- **Alternative considered**: Full server-rendered forms - would limit interactivity and streaming capability

## Risks / Trade-offs

[Risk: API Rate Limiting] → Implement client-side debouncing on AI suggestion requests and user-friendly error messages for rate limits

[Risk: Data Consistency] → Use Prisma transactions for create/update operations, handle race conditions with optimistic UI updates

[Risk: AI Quality] → Provide manual override capability for AI-generated suggestions; start with good prompts and iterate based on user feedback

[Risk: Cold Starts] → Streaming responses help mitigate perception of latency; consider caching or optimization if performance issues arise

[Trade-off: SQLite in dev vs Postgres in prod] → Different database behavior could cause subtle bugs; use extensive testing and schema migrations

## Migration Plan

1. Create Prisma schema with Task model on main database
2. Deploy database migration or update SQLite locally
3. Implement Server Actions for task operations
4. Build authenticated task list page (/tasks)
5. Add task form with client-side validation
6. Integrate AI suggestion feature with streaming responses
7. Deploy to production and test authentication + AI with Vercel Postgres
8. Monitor for issues and iterate

## Open Questions

- Should we cache AI suggestions or generate fresh each time?
- How should we handle conflicts if user modifies a task while AI suggests changes?
- Do we need audit logging for task changes?

# 项目背景与技术规划（中文翻译）
## 项目背景
该应用需要实现一套核心任务管理系统，具备以下能力：
- 通过 **Clerk** 实现用户身份认证
- 任务的增删改查（CRUD）功能，包含字段：唯一标识、标题、描述、状态（待办/进行中/已完成）、优先级（低/中/高）、截止日期、创建时间
- 任务管理页面（`/tasks`）用户界面，支持列表展示、创建、编辑、删除操作
- 基于任务标题和描述，通过 **AI 自动生成任务优先级与截止日期建议**
- 支持 **AI 响应流式传输**，提升用户体验

项目技术栈：**Next.js** 框架、**Prisma** ORM、**TypeScript（严格模式）**

---

## 目标与非目标
### 目标
- 基于 Clerk 认证实现完整的任务增删改查功能
- 使用 `@ai-sdk/openai` 实现带流式响应的 AI 建议功能
- 基于 Next.js 和 Tailwind CSS 构建响应式、可访问的用户界面
- 所有数据操作均使用**服务端动作（Server Actions）**实现
- 开发环境使用 SQLite，生产环境使用 Vercel Postgres
- 全程保证 TypeScript 严格类型校验

### 非目标
- 复杂的任务层级或子任务功能（核心范围外）
- 批量操作或批量处理功能
- 高级筛选或保存搜索条件功能
- 协作/共享任务清单
- 离线使用功能

---

## 技术决策
### 决策1：所有操作使用服务端动作
- **方案**：采用 Next.js 服务端动作处理任务增删改查与 AI 建议请求
- **理由**：类型安全、减少接口样板代码、天然支持身份认证、兼容 AI 响应流式传输
- **备选方案**：REST API 接口 —— 需编写更多样板代码，且需额外实现身份认证层

### 决策2：Prisma ORM + 数据库抽象层
- **方案**：使用 Prisma 作为数据层，开发环境用 SQLite，生产环境用 Vercel Postgres
- **理由**：查询类型安全、数据库模型管理便捷、本地开发简单、可平滑扩展至生产数据库
- **备选方案**：原生数据库查询 —— 类型安全性低，需维护大量原生 SQL

### 决策3：AI 响应流式传输
- **方案**：使用 `@ai-sdk/openai` 配合 `streamText` 实现 AI 建议实时展示
- **理由**：提升用户体验 —— 用户可逐步看到结果，无需等待完整响应
- **备选方案**：标准补全 API —— 实现更简单，但延迟带来的体验更差

### 决策4：客户端组件实现交互界面
- **方案**：使用 React 客户端组件开发任务表单与 AI 建议展示模块
- **理由**：支持表单交互处理、实时校验、流式响应动态展示
- **备选方案**：纯服务端渲染表单 —— 会限制交互性与流式传输能力

---

## 风险与权衡
### 风险：API 调用频率限制
→ 解决方案：对 AI 建议请求做客户端防抖处理，为频率限制提供友好的错误提示

### 风险：数据一致性问题
→ 解决方案：创建/更新操作使用 Prisma 事务，通过乐观 UI 更新处理竞态条件

### 风险：AI 建议质量不稳定
→ 解决方案：支持用户手动覆盖 AI 生成的建议；使用优质提示词，根据用户反馈持续迭代优化

### 风险：服务冷启动延迟
→ 解决方案：流式响应可降低用户对延迟的感知；若出现性能问题，考虑增加缓存或优化

### 权衡：开发用 SQLite / 生产用 Postgres
→ 风险：数据库行为差异可能导致隐性 Bug；解决方案：全面测试 + 规范的数据库迁移流程

---

## 迁移/实施计划
1. 在主数据库创建包含任务模型的 Prisma 数据模型
2. 执行数据库迁移（本地更新 SQLite / 生产部署迁移）
3. 实现任务操作的服务端动作
4. 开发需要身份认证的任务列表页面（`/tasks`）
5. 添加带客户端校验的任务表单
6. 集成带流式响应的 AI 建议功能
7. 部署至生产环境，测试身份认证与 AI 功能（搭配 Vercel Postgres）
8. 监控问题并持续迭代优化

---

## 待解决问题
- 是否需要缓存 AI 建议，还是每次都重新生成？
- 如果用户在 AI 生成建议时修改了任务，该如何处理冲突？
- 是否需要为任务修改操作添加审计日志？