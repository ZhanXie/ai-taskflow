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

**Decision 1: Server Actions for all operations**
- **Choice**: Use Next.js Server Actions for task CRUD and AI suggestions
- **Rationale**: Type-safe, reduces API boilerplate, handles authentication naturally, supports streaming for AI responses
- **Alternative considered**: REST API endpoints - would require more boilerplate and additional authentication layer

**Decision 2: Prisma ORM with database abstraction**
- **Choice**: Use Prisma as the data layer with SQLite for dev, Vercel Postgres for production
- **Rationale**: Type-safe queries, easy schema management, simple local development with SQLite, scales to production database
- **Alternative considered**: Direct database queries - less type safety and more SQL to maintain

**Decision 3: Streaming AI responses**
- **Choice**: Use @ai-sdk/openai with streamText for real-time AI suggestion display
- **Rationale**: Better UX - users see results progressively rather than waiting for complete response
- **Alternative considered**: Standard completions API - simpler but worse UX for latency

**Decision 4: Client components for interactive UI**
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
