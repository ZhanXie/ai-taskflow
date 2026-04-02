# AI Taskflow

Task management application with AI suggestions built with Next.js 16, Prisma, and PostgreSQL.

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start local PostgreSQL database**
   ```bash
   # Start database container
   docker compose up -d
   
   # Or use the convenience script
   npm run dev:db
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Database Configuration

- **Local Database URL**: `postgresql://postgres:postgres@localhost:5432/ai_taskflow`
- **Database Schema**: `public`
- **Docker Container**: `ai-taskflow-postgres`

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_taskflow?schema=public

# Authentication (required for Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Providers (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Available Scripts

- `npm run dev`: Start development server (Webpack mode)
- `npm run dev:local`: Start database + migrations + dev server
- `npm run dev:db`: Start database and run migrations
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open Prisma Studio
- `npm run build`: Build for production
- `npm run start`: Start production server

### Production Deployment

For production, set the `DATABASE_URL` environment variable to your PostgreSQL database URL.

The application uses the same PostgreSQL provider for both development and production environments.