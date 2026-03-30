# Prisma Studio 修复说明

## 问题
Prisma Studio 启动时出错：
```
Error in Prisma Client request: Invalid STUDIO_EMBED_BUILD...
Cannot fetch data from service: fetch failed
```

## 根本原因
1. 数据库未初始化 - 没有迁移文件和数据库文件
2. 数据库配置冲突 - `.env` 中配置的 PostgreSQL 与 `.env.local` 中的 SQLite 不一致
3. Prisma 配置不完整 - 缺少环境变量加载和迁移初始化

## 修复步骤

### 1. 修改 `prisma.config.ts`
- 添加 `.env.local` 优先加载逻辑
- 使用 `dotenv` 库正确加载环境变量

### 2. 更新 `prisma/schema.prisma`
- 改为使用 SQLite 作为本地开发数据库
- 注释说明生产环境需要改为 PostgreSQL

### 3. 更新 `.env.local`
- 添加 `DATABASE_PROVIDER="sqlite"`
- 配置 `DATABASE_URL="file:./prisma/dev.db"`

### 4. 初始化数据库
```bash
npm run db:migrate -- --name init
```

## 验证
运行以下命令验证修复：
```bash
npm run db:studio
```

Prisma Studio 现在应该在 `http://localhost:5556` 成功启动。

## 为生产环境转换到 PostgreSQL

编辑 `prisma/schema.prisma`：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

然后更新 `.env` 或部署环境中的 `DATABASE_URL` 为 PostgreSQL 连接字符串。

## 相关命令

| 命令 | 描述 |
|------|------|
| `npm run db:studio` | 打开 Prisma Studio 可视化管理器 |
| `npm run db:migrate` | 创建并应用新的迁移 |
| `npm run db:generate` | 重新生成 Prisma 客户端 |
| `npm run db:reset` | 重置数据库（删除所有数据并重新应用迁移） |
