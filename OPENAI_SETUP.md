# OpenAI API 配置指南

## 问题
当前应用无法连接到 OpenAI API，出现错误：
```
Error [AI_RetryError]: Failed after 3 attempts. Last error: Cannot connect to API: read ECONNRESET
```

## 原因
`OPENAI_API_KEY` 在 `.env.local` 中是一个无效的占位符密钥。

## 解决步骤

### 1. 获取 OpenAI API 密钥
- 访问: https://platform.openai.com/api-keys
- 点击 "Create new secret key"
- 复制生成的密钥（以 `sk-` 开头）

### 2. 更新 `.env.local`
在 `/Users/xiezhan/文档/git/ai-taskflow/.env.local` 中：

```
OPENAI_API_KEY="sk-proj-YOUR-REAL-API-KEY-HERE"
```

替换为你从 OpenAI 获取的真实密钥。

### 3. 检查账户配置
- 确保账户有可用的额度（$5+ 或付款方式有效）
- 检查 API 密钥未被禁用
- 模型 `gpt-4o-mini` 在你的地区和账户中可用

### 4. 重启应用
重启 Next.js 开发服务器以加载新的环境变量：
```bash
npm run dev:all
```

## 备选方案
如果暂时无法使用 OpenAI API，可以：
1. 使用其他 AI 提供商（如 Anthropic Claude）
2. 在代码中实现 Fallback 机制返回默认建议

当前已实现带有 Fallback 的错误处理，当 API 不可用时将使用默认建议。
