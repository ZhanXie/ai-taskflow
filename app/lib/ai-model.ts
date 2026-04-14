import { createOpenAI } from "@ai-sdk/openai";

/**
 * Qwen (Tongyi Qianwen) model configured via OpenAI-compatible API.
 * Uses QWEN_* environment variables for configuration.
 */
const qwen = createOpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

/**
 * Primary model for AI suggestions.
 * Configurable via QWEN_MODEL env var (default: qwen-plus).
 */
export const suggestionModel = qwen(
  process.env.QWEN_MODEL ?? "qwen-plus"
);
