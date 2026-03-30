# 故障排查和运维指南

此文档帮助快速诊断和修复生产环境问题。

## 🚨 紧急故障处理

### 应用完全不可用

#### 症状
- 无法访问 URL
- 返回 502/503 错误
- 白屏或加载超时

#### 诊断步骤

1. **检查 Vercel 部署状态**
   ```
   Dashboard -> Deployments -> Recent
   查看是否有部署失败或构建错误
   ```

2. **检查应用日志**
   ```
   Vercel -> Logs -> Runtime Logs
   查看错误消息
   ```

3. **检查状态页面**
   ```
   https://www.vercelstatus.com
   https://status.clerk.dev
   https://www.tencentcloudstatus.com
   ```

#### 快速修复

```bash
# 选项 1: 回滚到上一版本
# Vercel Dashboard -> Deployments -> Previous -> Promote

# 选项 2: 清除缓存并重新部署
git push origin main

# 选项 3: 手动触发构建
# Vercel Dashboard -> Deployments -> Redeploy
```

---

## 🔴 常见问题诊断

### 1. 数据库连接错误

#### 症状
```
Error: connect ECONNREFUSED (or timeout)
Error: Database connection failed
```

#### 诊断

```bash
# 1. 验证环境变量
echo $DATABASE_URL
# 应该看到 postgresql://... 连接字符串

# 2. 在本地测试连接
psql $DATABASE_URL -c "SELECT 1"

# 3. 检查 firewall/IP 白名单
# Vercel Postgres -> Settings -> IP Whitelist
```

#### 修复

```bash
# 1. 重新生成连接字符串
# Vercel -> Storage -> Postgres -> .env.local
# 复制新的 DATABASE_URL

# 2. 更新 Vercel 环境变量
# Vercel -> Project Settings -> Environment Variables

# 3. 重新部署
git push origin main
```

---

### 2. Clerk 认证失败

#### 症状
```
Error: Missing Clerk API keys
Clerk authentication failed
"Unauthorized" 页面
```

#### 诊断

```bash
# 1. 验证环境变量
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# 2. 检查 Clerk 配置
# Clerk Dashboard -> Configuration -> API Keys
```

#### 修复

**如果是 API 密钥问题:**
```bash
# 1. 获取新的 API 密钥
# Clerk Dashboard -> API Keys

# 2. 更新 Vercel 环境变量
# Vercel -> Environment Variables:
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
#   CLERK_SECRET_KEY=sk_live_...

# 3. 重新部署
git push origin main
```

**如果是域名问题:**
```
1. Clerk Dashboard -> Project Settings -> Domains
2. 添加/验证生产域名
3. 等待 DNS 传播 (5-30 分钟)
4. 清除浏览器缓存并重试
```

---

### 3. AI 建议功能不工作

#### 症状
```
"AI 建议" 按钮无响应
流式响应未显示
返回 API 错误
```

#### 诊断

```bash
# 1. 验证 Tencent 凭证
echo $TENCENT_SECRET_ID
echo $TENCENT_SECRET_KEY

# 2. 检查 API 配额
# Tencent Cloud -> Hunyuan -> Usage and Quota
```

#### 修复

**如果凭证过期:**
```bash
# 1. 生成新凭证
# Tencent Cloud -> Security Credentials -> API Keys

# 2. 更新 Vercel 环境变量

# 3. 重新部署
git push origin main
```

**如果超过配额:**
```
1. Tencent Cloud -> Hunyuan -> Quota Management
2. 增加 API 配额或联系支持
3. 实施缓存减少调用
```

---

## 📊 性能诊断

### 应用加载缓慢

#### 诊断步骤

```bash
# 1. 检查 Lighthouse 评分
Chrome DevTools -> Lighthouse -> Generate Report

# 2. 查看网络瀑布
Chrome DevTools -> Network -> 刷新页面

# 3. 检查数据库查询性能
Vercel -> Analytics -> Database Queries
```

#### 常见原因和修复

| 原因 | 诊断 | 修复 |
|-----|------|------|
| 首页慢 | Network 选项卡 > 2s | 减少初始 JS 包大小 |
| API 慢 | DevTools > FetchEvents > 3s | 优化数据库查询 |
| 数据库慢 | Vercel Analytics | 添加索引, 缓存结果 |
| 图片加载慢 | Network > Images > 1MB+ | 使用 Next.js Image 优化 |

### 数据库查询慢

```bash
# 1. 查看慢查询日志
# Vercel Postgres -> Analytics -> Query Performance

# 2. 检查缺失的索引
# Prisma schema -> 添加 @@index([field])

# 3. 优化查询
# 避免 N+1 问题，使用 include/select
```

---

## 🔧 维护任务

### 日常维护 (每天)

- [ ] 检查应用是否在线
- [ ] 扫一眼错误日志
- [ ] 监控 API 调用成本

### 周间维护 (每周)

- [ ] 运行性能检查
- [ ] 审查数据库大小
- [ ] 检查 API 配额使用
- [ ] 验证备份状态

```bash
# 周间检查脚本
#!/bin/bash

echo "=== Weekly Maintenance Check ==="
echo ""

echo "1. Checking Vercel deployment status..."
# 自动拉取部署状态 (需要 Vercel CLI)
vercel list

echo ""
echo "2. Checking database size..."
# 连接到数据库检查大小
psql $DATABASE_URL -c "SELECT 
  sum(pg_database.pg_database_size(pg_database.datname)) 
  AS size 
  FROM pg_database;"

echo ""
echo "3. Checking API costs..."
echo "Check Tencent Cloud dashboard manually"
echo ""
```

### 月间维护 (每月)

- [ ] 数据库优化和清理
- [ ] 成本审查
- [ ] 安全更新检查
- [ ] 依赖升级

```bash
npm audit
npm outdated
```

### 季度维护 (每季)

- [ ] 架构审查
- [ ] 成本优化评估
- [ ] 容量规划
- [ ] 灾难恢复测试

---

## 🔍 日志检查

### 如何访问日志

**Vercel 运行时日志**
```
Dashboard -> Logs -> Runtime Logs
实时查看应用日志
```

**数据库日志**
```
Vercel -> Storage -> Postgres -> Analytics
查询性能和慢查询
```

**Tencent API 日志**
```
Tencent Cloud -> CloudAudit
查看 API 调用日志
```

### 常见日志错误

```
ERROR: Database connection timeout
  -> 检查 IP 白名单

ERROR: Clerk auth failed
  -> 检查 API 密钥和域名配置

ERROR: Tencent API rate limited
  -> 检查配额或实施缓存

Error: Out of memory
  -> 数据库查询返回太多数据
  -> 实施分页或限制
```

---

## 📈 监控告警

### 关键指标

```
1. 应用可用性 (SLA)
   目标: 99.9%
   告警: < 99%

2. 响应时间 (P95)
   目标: < 500ms
   告警: > 1000ms

3. 错误率
   目标: < 0.1%
   告警: > 0.5%

4. API 成本
   目标: < $100/月
   告警: > $120/月
```

### 设置监控 (使用 Vercel + Sentry)

```typescript
// app/lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    attachStacktrace: true,
  });
}
```

在 `.env` 中添加:
```
SENTRY_DSN=https://...sentry.io/...
```

---

## 🔐 安全事件处理

### 可疑活动检测

#### 症状
- 异常 API 调用
- 数据库异常查询
- 无法解释的成本增加

#### 处理流程

1. **立即行动**
   - 检查最近的日志
   - 查看 GitHub 提交历史
   - 联系团队成员

2. **评估影响**
   - 是否有数据泄露？
   - 是否有未授权访问？
   - 是否有恶意代码?

3. **遏制问题**
   ```bash
   # 回滚最近的部署
   vercel rollback

   # 或重置 API 密钥
   # Regenerate keys in Tencent/Clerk dashboards
   ```

4. **分析和修复**
   - 审查代码变更
   - 检查依赖安全性
   - 更新安全措施

5. **事后总结**
   - 文档化事件
   - 实施预防措施
   - 更新监控告警

---

## 📞 获取帮助

### 联系方式

| 问题 | 联系方式 | 响应时间 |
|-----|---------|---------|
| Vercel 技术问题 | support@vercel.com | 24 小时 |
| Clerk 认证问题 | support@clerk.dev | 24 小时 |
| Tencent API 问题 | 通过 Tencent Cloud | 24 小时 |
| 数据库紧急 | Vercel Support | 1 小时 |

### 使用的工具

- **Vercel CLI**: `npm i -g vercel`
- **Prisma CLI**: `npx prisma`
- **PostgreSQL CLI**: `psql`
- **curl/Postman**: API 测试

---

## 完整故障排查流程图

```
应用不可用?
├─ 是 -> 检查 Vercel 部署状态
│        ├─ 构建失败? -> 查看构建日志
│        ├─ 已部署? -> 检查运行时日志
│        └─ 无错误? -> 检查依赖服务
│
└─ 否 -> 检查具体功能
         ├─ 登录失败? -> Clerk 配置
         ├─ 数据库错误? -> 连接字符串
         ├─ API 错误? -> Tencent 配置
         └─ 性能慢? -> 优化和缓存
```

---

**最后更新**: 2026-03-30  
**下一步**: 标记此文档以供快速参考
