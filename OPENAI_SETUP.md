# 腾讯元宝 API 配置指南

## 问题
当前应用无法连接到腾讯元宝 API。

## 解决步骤

### 1. 获取腾讯云 API 凭证
- 访问腾讯云控制台: https://console.cloud.tencent.com/
- 登录或注册账户
- 进入 **访问管理 (IAM)** -> **用户** -> **API密钥**
- 点击 **创建密钥** 获取 `SecretId` 和 `SecretKey`
- 复制并保管好这两个密钥

### 2. 激活腾讯元宝服务
- 访问腾讯云 Hunyuan 产品页面: https://cloud.tencent.com/product/hunyuan
- 点击 **立即体验** 或 **开通服务**
- 确保账户有可用的余额或信用额度

### 3. 更新 `.env.local`
在 `/Users/xiezhan/文档/git/ai-taskflow/.env.local` 中添加：

```
TENCENT_SECRET_ID="your-secret-id-here"
TENCENT_SECRET_KEY="your-secret-key-here"
```

替换为你从腾讯云获取的真实凭证。

### 4. 重启应用
重启 Next.js 开发服务器以加载新的环境变量：
```bash
npm install
npm run dev:all
```

## 关键说明
- 默认模型：`hunyuan-pro`（高级模型，需付费）
- 免费模型：`hunyuan` 或 `hunyuan-lite`（如需免费体验，修改 Model 参数）
- 默认区域：`ap-beijing`（北京，可根据需求修改）

## 故障排查
如果遇到问题：
1. 确认 `TENCENT_SECRET_ID` 和 `TENCENT_SECRET_KEY` 已正确配置
2. 检查账户是否有可用额度
3. 确认腾讯云 Hunyuan 服务已激活
4. 检查网络连接是否可以访问 hunyuan.tencentcloudapi.com

## 备选方案
如果暂时无法使用腾讯元宝，可以：
1. 使用其他 AI 提供商（如 OpenAI、Anthropic Claude）
2. 修改 `app/lib/ai-actions.ts` 的 Model 参数为免费模型：`hunyuan-lite`

