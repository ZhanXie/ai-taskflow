# 部署前准备指南

本文档详细列出从本地开发到生产部署所需的所有步骤。

## 1. 代码审查和优化

### 代码质量检查
```bash
# 运行 TypeScript 类型检查
npm run type-check

# 运行 ESLint 检查
npm run lint

# 格式化代码
npm run format
```

### 必要的改进（优先级：高）
- [x] 所有 TypeScript 类型已定义（无 any）
- [x] Server Actions 有错误处理
- [x] 用户隔离已实现
- [ ] **添加 Sentry 错误监控**（生产重要）
- [ ] **添加请求日志中间件**
- [ ] **添加安全 Headers**

### 推荐的改进（优先级：中）
- [ ] 添加数据库连接池配置
- [ ] 添加缓存策略
- [ ] 添加性能监控
- [ ] 添加速率限制

---

## 2. 环境变量配置

### 必需的环境变量
1. **数据库配置**
   - `DATABASE_URL`: Vercel Postgres 连接字符串

2. **Clerk 认证**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: 公开密钥
   - `CLERK_SECRET_KEY`: 密钥

3. **Tencent Hunyuan AI**
   - `TENCENT_SECRET_ID`: Tencent API ID
   - `TENCENT_SECRET_KEY`: Tencent API 密钥
   - `TENCENT_REGION`: 例如 `ap-beijing`

参考 `.env.example` 文件获取完整列表。

---

## 3. 数据库准备

### 步骤 1: 选择数据库方案

**推荐方案：Vercel Postgres**
- 与 Vercel 无缝集成
- 自动备份
- 内置监控

**替代方案：**
- AWS RDS for PostgreSQL
- Supabase
- Azure Database for PostgreSQL

### 步骤 2: 创建数据库实例
1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 Storage 选项卡
4. 创建 PostgreSQL 数据库
5. 复制连接字符串

### 步骤 3: 配置 Prisma
当前 `prisma/schema.prisma` 使用 SQLite。生产使用 PostgreSQL：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 步骤 4: 运行迁移
```bash
# 在本地测试迁移（可选）
DATABASE_URL="your_test_db_url" npx prisma migrate deploy

# 或让 Vercel 自动运行（部署时）
```

---

## 4. Clerk 认证配置

### 步骤 1: 创建 Clerk 应用
1. 访问 https://clerk.com
2. 创建新应用
3. 选择首选的登录方式（Email, Google, GitHub 等）

### 步骤 2: 获取 API 密钥
1. 进入 Project Settings → API Keys
2. 复制 `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. 复制 `Secret Key` → `CLERK_SECRET_KEY`

### 步骤 3: 配置生产域名
1. 进入 Settings → Domains
2. 添加你的生产域名：`https://yourdomain.com`
3. 配置允许的重定向 URI

### 步骤 4: 验证中间件配置
已在 `middleware.ts` 中配置：
- `/tasks` 路由受保护
- 其他路由公开访问

---

## 5. Tencent Hunyuan AI 配置

### 步骤 1: 获取 Tencent Cloud 凭证
1. 登录 https://console.cloud.tencent.com
2. 进入 Security Credentials
3. 创建 API 密钥
4. 记下 `SecretId` 和 `SecretKey`

### 步骤 2: 启用 Hunyuan 服务
1. 进入 Hunyuan 服务页面
2. 开通服务（可能需要支付）
3. 查看配额和定价

### 步骤 3: 配置环境变量
```
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_REGION=ap-beijing  # 或其他地区
```

### 步骤 4: 测试连接
```bash
node test-hunyuan.js
```

**成本控制：**
- 设置 API 调用限额
- 在生产前监控使用量
- 考虑缓存常见建议

---

## 6. 安全加固

### 必需的安全措施

#### 1. 环境变量保护
- 使用 `.env.local` 本地存储敏感信息
- 不提交 `.env.local` 到版本控制
- 确保 `.gitignore` 包含所有 `.env*` 文件

#### 2. 生产 Headers
需要添加到 `next.config.ts`：
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ]
}
```

#### 3. CSP (Content Security Policy) Header
- 防止 XSS 攻击
- 限制加载外部资源

#### 4. 速率限制
添加 API 速率限制以防止滥用：
```typescript
// 在 app/lib/middleware/rate-limit.ts 中实现
```

#### 5. 请求验证
- 所有 Server Action 已验证用户
- 所有数据库操作已检查所有权（userId）
- Zod 用于类型验证

---

## 7. 构建和性能优化

### 优化静态资源
```bash
# 在 next.config.ts 中配置
export const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
}
```

### 启用 gzip 压缩
Vercel 自动启用。

### 数据库优化
当前 Prisma schema 已有索引：
```prisma
@@index([userId])  // 任务按用户快速查询
```

---

## 8. 本地完整测试

### Pre-deployment 检查清单

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma 客户端
npm run db:generate

# 3. 运行类型检查
npm run type-check

# 4. 运行 lint
npm run lint

# 5. 构建
npm run build

# 6. 验证构建成功
echo $?  # 应该输出 0
```

### 功能测试
- [ ] 访问首页（重定向到 /tasks）
- [ ] 点击登录（Clerk 认证流程）
- [ ] 创建新任务
- [ ] 编辑任务
- [ ] 删除任务
- [ ] 点击"AI 建议"
  - 验证流式响应
  - 检查建议格式
  - 应用建议到表单
- [ ] 登出
- [ ] 以不同用户身份登录
- [ ] 验证用户只能看到自己的任务

---

## 9. Vercel 部署

### 前置条件
- [ ] 代码推送到 GitHub
- [ ] 所有测试通过
- [ ] 环境变量清单已准备

### 部署步骤

#### 1. 连接 GitHub 仓库
1. 登录 vercel.com
2. 点击"New Project"
3. 导入 GitHub 仓库

#### 2. 配置环境变量
在 Vercel 项目设置中添加：
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `TENCENT_REGION`

#### 3. 配置自定义域名（可选）
- 进入 Settings → Domains
- 添加你的域名
- 更新 DNS 记录

#### 4. 触发部署
- 点击"Deploy"
- 等待构建完成

### 部署后验证

```bash
# 检查构建日志
# 在 Vercel 控制台查看实时日志

# 测试生产 URL
curl https://your-vercel-domain.vercel.app

# 验证功能
# 在浏览器中访问生产 URL
```

---

## 10. 部署后监控

### 必需的监控
- [ ] 应用可访问性
- [ ] 错误日志（Sentry）
- [ ] API 调用成功率
- [ ] 数据库连接
- [ ] Tencent API 配额使用

### 日志检查
```bash
# 查看 Vercel 日志
# 在 Vercel 控制台的 Logs 选项卡中查看

# 查看 Tencent API 使用
# 在 Tencent Cloud 控制台中检查
```

### 性能监控
- 监控首页加载时间
- 监控 API 响应时间
- 监控数据库查询性能

---

## 11. 故障排查

### 常见问题

#### 问题 1: 连接超时
**症状：** 数据库连接错误
**解决方案：**
1. 验证 DATABASE_URL 环境变量
2. 确保 IP 白名单配置正确
3. 检查网络连接

#### 问题 2: 认证失败
**症状：** Clerk 登录不工作
**解决方案：**
1. 验证 Clerk API 密钥正确
2. 确保生产域名已在 Clerk 中配置
3. 检查浏览器 cookie 设置

#### 问题 3: AI 建议无响应
**症状：** 建议按钮失效
**解决方案：**
1. 验证 Tencent 凭证
2. 检查 API 配额
3. 查看错误日志

---

## 12. 成本估算

### 月度成本例子（中等使用量）
- **Vercel**: $20-100/月
- **Vercel Postgres**: $15-30/月
- **Clerk**: 前 10k 用户免费
- **Tencent Hunyuan**: ~$0.06 per 1k tokens

**总计**: ~$35-130/月

### 成本优化
- 使用 caching 减少 API 调用
- 监控 Tencent API 使用量
- 设置使用预警

---

## 13. 持续部署

### GitHub Actions CI/CD（推荐）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
```

---

## 14. 部署检查清单 ✓

### 发布前
- [ ] 所有代码已 review
- [ ] 所有测试通过
- [ ] 没有 console.log 调试语句
- [ ] 环境变量已配置
- [ ] 数据库迁移已准备
- [ ] SSL 证书已配置

### 发布中
- [ ] 构建成功
- [ ] 没有部署错误
- [ ] 所有环境变量已设置

### 发布后
- [ ] 功能测试通过
- [ ] 监控告警已设置
- [ ] 备份已启用
- [ ] 团队已通知

---

## 15. 联系和支持

### 重要链接
- [Vercel 文档](https://vercel.com/docs)
- [Clerk 文档](https://clerk.com/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tencent Cloud 文档](https://cloud.tencent.com/document)

### 技术支持
- Vercel Support: support@vercel.com
- Clerk Support: support@clerk.dev
- Tencent Support: 通过 Tencent Cloud 控制台

---

**最后更新：2026-03-30**
