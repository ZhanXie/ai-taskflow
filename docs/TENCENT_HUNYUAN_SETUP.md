# 腾讯元宝（Hunyuan）集成指南

## 更新说明

本次更新已将应用从 OpenAI API 迁移到腾讯元宝（Hunyuan）API。

### 更改内容

1. **依赖更新**
   - 移除：`@ai-sdk/openai`
   - 添加：`tencentcloud-sdk-nodejs`

2. **代码改动**
   - `app/lib/ai-actions.ts` - 使用腾讯元宝 API 替代 OpenAI
   - 实现 TC3-HMAC-SHA256 认证机制
   - 调用 Hunyuan ChatStd 模型（支持 hunyuan-lite）

3. **环境配置**
   - `.env.local` - 更新为腾讯云凭证
   - `.env.production.example` - 更新示例配置

## 快速开始

### 1. 获取腾讯云凭证

#### 方式一：通过腾讯云控制台
1. 访问 https://console.cloud.tencent.com/
2. 登录或创建账户
3. 进入 **访问管理 (CAM)** → **用户列表**
4. 创建子账户或使用主账户
5. 进入 **API密钥管理**
6. 创建新的 API 密钥，获得：
   - SecretId
   - SecretKey

#### 方式二：快速获取（主账户）
1. 点击右上角账户头像
2. 选择 **访问管理**
3. 在左侧菜单找 **用户** → **API密钥**
4. 创建密钥

### 2. 激活 Hunyuan 服务

1. 访问 https://cloud.tencent.com/product/hunyuan
2. 点击 **立即体验**
3. 确保账户有可用余额或有效的付款方式
4. 服务应该会立即可用

### 3. 配置环境变量

编辑 `.env.local` 文件：

```
# Tencent Hunyuan
TENCENT_SECRET_ID="your-secret-id-here"
TENCENT_SECRET_KEY="your-secret-key-here"
```

将占位符替换为你的真实凭证。

### 4. 重启应用

```bash
npm install
npm run dev:all
```

## 模型说明

当前配置使用：**`hunyuan-lite`**（轻量级模型，成本最低）

### 可用模型
- `hunyuan-pro` - 高性能模型（成本最高）
- `hunyuan` - 标准模型（中等成本）
- `hunyuan-lite` - 轻量级模型（成本最低，推荐）

若要更改模型，编辑 `app/lib/ai-actions.ts` 中 `callHunyuanAPI` 函数：
```typescript
const payload = {
  Model: "hunyuan-lite",  // 改为其他模型名称
  Messages: [...],
  Stream: false,
};
```

## 计费说明

腾讯元宝采用按需付费模式：
- 阅读免费额度政策：https://cloud.tencent.com/document/product/1729/97731
- 查看实时定价：https://cloud.tencent.com/product/hunyuan/pricing

## API 请求示例

```typescript
// 自动调用（无需手动操作）
const suggestions = await getAISuggestions("任务标题", "任务描述");
```

## 故障排查

### 问题 1：认证失败
```
Error: Hunyuan API error: 403
```
**解决方案**：
- 检查 `TENCENT_SECRET_ID` 和 `TENCENT_SECRET_KEY` 是否正确
- 确认子账户有 Hunyuan 的访问权限
- 验证 API 密钥未过期

### 问题 2：余额不足
```
Error: account has insufficient balance
```
**解决方案**：
- 充值腾讯云账户
- 或在控制台绑定有效的支付方式

### 问题 3：权限不足
```
Error: User not authorized to perform hunyuan operation
```
**解决方案**：
- 为子账户添加 Hunyuan 完全访问权限
- 使用主账户的 API 密钥测试

### 问题 4：网络超时
```
Error: Hunyuan API error: 504 or timeout
```
**解决方案**：
- 检查网络连接
- 查看是否有防火墙/代理限制
- 重试请求

## 日志调试

查看 API 调用日志：
```bash
# 在浏览器开发工具 Console 中查看
# 或在服务器日志中搜索 "Tencent Hunyuan API"
```

## 支持的功能

- ✅ 任务优先级建议 (LOW, MEDIUM, HIGH)
- ✅ 任务截止日期建议
- ✅ 建议原因说明
- ✅ JSON 格式响应
- ✅ 错误容错（提供默认建议）

## 备选方案

如需切换回 OpenAI：
1. 恢复 `package.json` 依赖
2. 修改 `app/lib/ai-actions.ts` 回到 OpenAI 版本
3. 更新 `.env.local` 配置

## 更多资源

- [腾讯元宝官方文档](https://cloud.tencent.com/document/product/1729)
- [API 参考](https://cloud.tencent.com/document/api/1729)
- [SDK 文档](https://github.com/TencentCloud/tencentcloud-sdk-nodejs)
