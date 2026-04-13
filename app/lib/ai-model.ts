import { createOpenAI } from "@ai-sdk/openai";

/**
 * Tencent Hunyuan model configured via OpenAI-compatible API.
 * Uses HUNYUAN_* environment variables for configuration.
 */
const hunyuan = createOpenAI({
  apiKey: process.env.HUNYUAN_API_KEY,
  baseURL: process.env.HUNYUAN_BASE_URL ?? "https://api.hunyuan.cloud.tencent.com/v1",
});

/**
 * Primary model for AI suggestions.
 * Configurable via HUNYUAN_MODEL env var (default: hunyuan-lite).
 */
export const suggestionModel = hunyuan(
  process.env.HUNYUAN_MODEL ?? "hunyuan-lite"
);
