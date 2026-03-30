# 生产部署快速指南

本指南介绍如何快速部署应用到生产环境。详细信息请参考 `DEPLOYMENT_GUIDE.md`。

## 🚀 快速部署 (5 分钟)

### 前置条件

- [ ] 代码已 push 到 main 分支
- [ ] 所有测试通过
- [ ] 代码已 review

### 部署检查

```bash
# 运行预部署检查
npm run pre-deploy

# 或手动检查
npm run type-check
npm run lint
npm run build
```

### 验证生产环境变量

在 Vercel 项目设置中确认以下变量已设置：

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
TENCENT_SECRET_ID=...
TENCENT_SECRET_KEY=...
TENCENT_REGION=ap-beijing
```

### 触发部署

**选项 1: GitHub 自动部署 (推荐)**

```bash
git push origin main
```

- Vercel 会自动检测推送
- GitHub Actions 会运行 CI/CD 流程
- 部署完成后会自动推送到生产环境

**选项 2: 手动 Vercel 部署**

1. 登录 vercel.com
2. 选择项目
3. 点击 "Deploy"

### 部署验证 (5 分钟)

部署完成后执行以下检查：

```bash
# 1. 检查应用可访问
curl https://your-domain.com

# 2. 测试登录
# 在浏览器中打开生产 URL，点击登录

# 3. 创建测试任务
# 创建一个测试任务验证数据库连接

# 4. 测试 AI 建议
# 点击 "AI 建议" 按钮验证 API 连接
```

### 监控

部署后请监控：

- **Vercel Dashboard** - 查看实时日志和性能
- **Data 数据库** - 检查连接和性能
- **API 配额** - 监控 Tencent Hunyuan 调用
- **错误监控** - 如使用 Sentry，检查错误

---

## 🔄 蓝绿部署策略 (可选)

对于关键更新，使用蓝绿部署：

### 步骤

1. **蓝环境** (当前生产)
   - 保持运行
   - 继续接收用户流量

2. **绿环境** (新版本)
   - 在 新 Vercel 部署上运行测试版本
   - 在暂存环境进行完整测试

3. **切换**
   - DNA 配置切换到绿环境
   - 监控新版本
   - 如有问题可立即切回蓝环境

---

## ⚠️ 回滚步骤

如果部署有问题：

### 快速回滚

```bash
# 在 Vercel 中回滚到上一个版本
# Dashboard -> Deployments -> Previous Version -> Promote
```

或

```bash
# 本地回滚到上一个提交
git revert HEAD
git push origin main
```

---

## 📋 常见问题

### Q: 部署後如何查看日志？
**A:** 在 Vercel Dashboard 的 Logs 部分查看实时应用日志。

### Q: 如何检查数据库迁移是否成功？
**A:** 
```bash
# 本地测试
DATABASE_URL="your_prod_url" npx prisma migrate deploy --preview-feature

# 或检查 Vercel 部署日志中 Prisma 迁移部分
```

### Q: 如何处理 API 密钥泄露？
**A:** 
1. 立即在相应服务中重新生成密钥
2. 在 Vercel 中更新环境变量
3. 触发新部署

### Q: Tencent API 达到配额怎么办？
**A:**
1. 在 Tencent Cloud 控制台检查配额
2. 增加配额或优化 API 调用
3. 实施缓存策略减少调用

---

## 📞 紧急联系

如遇部署问题：

- **Vercel 支持**: support@vercel.com
- **Clerk 支持**: support@clerk.dev
- **Tencent 支持**: 通过 Tencent Cloud 控制台

---

## 下一步

- [ ] 完成首次生产部署
- [ ] 配置监控告警
- [ ] 建立部署发布流程
- [ ] 准备应急响应计划

---

**最后更新**: 2026-03-30
**下一步建议**: 参考完整的 `DEPLOYMENT_GUIDE.md` 了解详细信息
