# 部署前检查清单

此文档列出部署到 Vercel 生产环境之前需要完成的所有步骤。

## 环境配置

### 数据库

- [ ] 创建或获取 Vercel Postgres 实例
- [ ] 复制数据库连接字符串
- [ ] 在 Vercel 项目中设置 DATABASE_URL 环境变量
- [ ] 运行 Prisma 迁移: `npx prisma migrate deploy`

### Clerk 认证

- [ ] 在 Clerk 仪表板创建或获取 API 密钥
- [ ] 在 Vercel 中设置 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] 在 Vercel 中设置 CLERK_SECRET_KEY
- [ ] 在 Clerk 中配置生产域名

### OpenAI

- [ ] 获取 OpenAI API 密钥
- [ ] 在 Vercel 中设置 OPENAI_API_KEY

## 代码检查

- [x] 所有 TypeScript 类型都已定义（无 any）
- [x] 所有 Server Actions 都有适当的错误处理
- [x] 用户隔离已实现（userId 检查）
- [x] 环境变量已在代码中正确使用

## 本地测试

运行以下命令进行本地测试：

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma 客户端
npx prisma generate

# 3. 运行迁移（开发环境）
npx prisma migrate dev --name init

# 4. 启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

### 测试场景

- 登录和登出
- 创建新任务
- 编辑任务
- 删除任务
- 使用 AI 建议功能
- 更新任务状态和优先级
- 验证用户只能看到自己的任务

## 部署

1. 推送代码到 GitHub
2. 在 Vercel 中连接仓库
3. 设置环境变量
4. 部署应用

## 部署后验证

- [ ] 验证应用可访问
- [ ] 测试登录功能（使用 Clerk）
- [ ] 测试任务创建和管理
- [ ] 测试 AI 建议功能
- [ ] 检查数据库迁移成功
- [ ] 监控应用日志是否有错误
- [ ] 进行性能测试

## 监控和维护

- 定期检查应用日志
- 监控数据库连接和性能
- 跟踪 OpenAI API 使用情况和成本
- 定期备份数据库
