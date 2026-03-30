# 成本监控和优化指南

此文档帮助你监控和优化生产环境的成本。

## 月度成本估算

### 基础成本 (中等使用量)

| 服务 | 免费额度 | 付费等级 | 预计月成本 |
|------|---------|---------|----------|
| **Vercel** | - | Hobby/Pro | $20-100 |
| **Vercel Postgres** | - | 按使用量 | $15-30 |
| **Clerk** | 10k 用户 | 按用户计费 | $0-50 |
| **Tencent Hunyuan** | - | 按 token (lite) | $2-10 |
| **DNS/域名** | - | - | $5-15 |
| **其他** | - | - | $0-20 |
| **总计** | - | - | **$42-225/月** |

### 使用量假设
- 日活用户 (DAU): 100-500
- 每日 API 调用: 500-2000
- 存储: < 1GB
- 带宽: < 10GB

---

## Vercel 成本优化

### 当前配置
- **部署**: $0 (自动 CI/CD)
- **边函数**: 包含在 Pro 中
- **数据库**: Vercel Postgres

### 优化建议

#### 1. 部署优化
```
当前每月部署数: ~30 次 (每周 1 次)
成本: $0 (测试环境免费)
优化: 无需额外优化
```

#### 2. 边函数优化
- API 路由已使用 Next.js Server Actions
- 无额外边函数需要优化

#### 3. 缓存策略
```typescript
// next.config.ts 中已配置
images: {
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 年缓存
}

// 添加页面缓存 (可选)
export const revalidate = 3600; // 1 小时
```

---

## 数据库成本优化

### Vercel Postgres 计费

**按使用量计费:**
- 存储: $0.25 GB/月
- 计算: 按查询时间
- 已包含: 自动备份, SSL, 高可用

### 优化建议

#### 1. 查询优化
```typescript
// ❌ 不好 - N+1 问题
const tasks = await prisma.task.findMany();
for (const task of tasks) {
  console.log(task.userId); // 额外查询!
}

// ✓ 好 - 单次查询
const tasks = await prisma.task.findMany({
  include: { user: true }
});
```

#### 2. 索引优化
当前已有:
```prisma
@@index([userId])  // 任务查询优化
```

考虑添加:
```prisma
@@index([status])      // 按状态过滤
@@index([createdAt])   // 按日期排序
@@index([dueDate])     // 到期日期查询
```

#### 3. 连接池
Vercel Postgres 自动启用 PgBouncer。无需配置。

#### 4. 备份策略
- **自动备份**: 每日 1 次
- **保留期**: 7 天
- **成本**: 包含在价格内
- **建议**: 保持默认配置

---

## Clerk 认证成本优化

### 当前定价
- **前 10k 用户**: 免费
- **10k+ 用户**: $0.02 per MAU

### 使用量控制

#### 1. 禁用未使用的功能
```typescript
// 仅启用必需的登录方法
// 其他功能可禁用以减少开销
```

#### 2. 会话管理
- **会话超时**: 7 天 (默认)
- **刷新令牌**: 30 天
- **成本影响**: 最小化

#### 3. 多租户
当前为单租户。不适用。

---

## Tencent Hunyuan API 成本优化

### 当前使用模型
- **模型**: hunyuan-lite（轻量级，成本最低）

### 当前定价 (大概)
- **输入 token**: $0.0001 per 1k tokens (hunyuan-lite - 最低价)
- **输出 token**: $0.0003 per 1k tokens (hunyuan-lite - 最低价)
- **建议**: 每个用户请求 ~500 tokens

### 成本估算
```
每日请求数: 1000
平均 token 数: 500
月使用量: 15M tokens
预计月成本: $2-5 (使用 hunyuan-lite)

优化目标: < $5/月
```

### 模型对比 (参考)
| 模型 | 输入价格 | 输出价格 | 适用场景 |
|-----|---------|---------|---------|
| hunyuan-lite | $0.0001 | $0.0003 | 简单建议、低成本 ✓ 当前 |
| hunyuan | $0.0005 | $0.001 | 通用任务 |
| hunyuan-pro | $0.001 | $0.002 | 复杂推理 |

### 优化建议

#### 1. 实施缓存
```typescript
// 缓存常见建议
const suggestionCache = new Map<string, Suggestion>();

export async function getAISuggestions(title: string) {
  // 检查缓存
  if (suggestionCache.has(title)) {
    return suggestionCache.get(title);
  }
  
  // 调用 API
  const suggestion = await callHunyuanAPI(title);
  
  // 缓存结果 (24 小时)
  suggestionCache.set(title, suggestion);
  
  return suggestion;
}
```

#### 2. 请求优化
```typescript
// 简化 prompt 词元数量
const prompt = `Task: ${title}. Suggest priority (LOW/MEDIUM/HIGH) and due date.`;

// 而不是冗长的 prompt
```

#### 3. 用户限制
```typescript
// 限制每个用户的 API 调用次数
const MAX_SUGGESTIONS_PER_DAY = 10;

// 实施速率限制
if await getUserSuggestionsCount(userId) >= MAX_SUGGESTIONS_PER_DAY {
  throw new Error("Daily limit exceeded");
}
```

#### 4. 降级处理
```typescript
// 如果 API 超过配额，提供本地建议
const localFallback = {
  priority: "MEDIUM",
  dueDate: getDueDateIn(7, 'days'),
  reasoning: "Using automatic suggestion. Upgrade for AI suggestions."
};
```

#### 5. 监控成本
```bash
# 定期检查使用量
# Tencent Cloud 控制台 -> Hunyuan 服务 -> 账单
```

---

## 综合成本优化策略

### 第一阶段: 基础优化 (月省 $10-20)
- [ ] 启用页面缓存 (1 小时 TTL)
- [ ] 添加数据库查询缓存
- [ ] 禁用 Clerk 未使用功能
- **预期节省**: $10-20/月

### 第二阶段: 中级优化 (月省 $20-50)
- [ ] 实施 Hunyuan 结果缓存
- [ ] 添加 API 速率限制
- [ ] 优化数据库索引
- [ ] 分析和优化 缓慢查询
- **预期节省**: $20-50/月

### 第三阶段: 高级优化 (月省 $50-100)
- [ ] 实施 CDN 缓存策略
- [ ] 添加建议预生成
- [ ] 优化资源加载
- [ ] 考虑其他 AI 服务 (成本更低)
- **预期节省**: $50-100/月

---

## 监控和告警

### 设置监控

#### 1. Vercel 监控
```
Dashboard -> Analytics
- 监控带宽使用
- 监控部署频率
- 监控边函数调用
```

#### 2. 数据库监控
```
Vercel -> Storage -> Postgres -> Analytics
- 查询时间
- 存储大小趋势
- 连接数
```

#### 3. Tencent 监控
```
Tencent Cloud -> Hunyuan -> Usage
- API 调用次数
- Token 使用量
- 成本统计
```

#### 4. Clerk 监控
```
Clerk Dashboard -> Analytics
- MAU 趋势
- 认证成功率
- 成本预估
```

### 告警设置

#### 每周审查清单
- [ ] Vercel 成本 YoY 趋势
- [ ] 数据库查询性能
- [ ] Hunyuan API 成本
- [ ] Clerk MAU

#### 告警阈值
| 指标 | 阈值 | 操作 |
|-----|------|------|
| 每月成本超过预算 | +20% | 暂停新功能 |
| API 调用异常 | 3x 正常 | 检查代码 |
| 数据库查询缓慢 | > 100ms | 优化查询 |
| 存储增长 | > 100MB/周 | 清理数据 |

---

## 按规模扩展成本

### 小规模 (< 1000 DAU)
```
Vercel:        $20/月
Database:      $10/月
Clerk:         $0/月
Hunyuan-lite:  $2/月
总计:          $32/月
```

### 中等规模 (1000-10000 DAU)
```
Vercel:        $50/月
Database:      $30/月
Clerk:         $20/月
Hunyuan-lite:  $8/月
总计:          $108/月
```

### 大规模 (> 10000 DAU)
```
Vercel:        $100/月
Database:      $100+/月
Clerk:         $100+/月
Hunyuan-lite:  $50+/月 (比 pro 便宜 75%)
总计:          $350+/月
```

---

## 成本报告模板

### 月度成本报告

**报告期间**: __________, 20__

| 服务 | 预期成本 | 实际成本 | 差异 | 说明 |
|-----|---------|---------|------|------|
| Vercel | $ | $ | $ | |
| Database | $ | $ | $ | |
| Clerk | $ | $ | $ | |
| Hunyuan | $ | $ | $ | |
| 其他 | $ | $ | $ | |
| **总计** | $ | $ | $ | |

**优化措施**: 
- [ ] 
- [ ] 

**下月行动**:
- [ ] 
- [ ] 

---

**最后更新**: 2026-03-30  
**下一步**: 每月一次审查成本报告
