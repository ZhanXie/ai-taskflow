# Proposal: Core Task CRUD with AI Suggestions

## 需求
- 用户通过 Clerk 登录
- 任务实体：id, title, description, status (todo/in-progress/done), priority (low/medium/high), dueDate, createdAt
- 页面：/login, /tasks (列表 + 新增/编辑/删除)
- AI 功能：在新建/编辑任务时，输入标题/描述后点击“AI Suggest”，自动生成 priority 和 dueDate（使用 Vercel AI SDK + OpenAI）

## 验收标准
- TypeScript 严格模式，无 any
- 所有操作使用 Server Actions
- AI 响应流式显示
- 移动端响应式（Tailwind）
- 部署后可正常登录和使用 AI 功能

## 技术决策
- 数据库：Prisma + SQLite（开发）→ Vercel Postgres（生产）
- 认证：Clerk
- AI：@ai-sdk/openai streamText