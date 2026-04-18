import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenRouter model configured via OpenAI-compatible API.
 * Uses OPENR_* environment variables for configuration.
 */
const openRouter = createOpenAI({
  apiKey: process.env.OPEN_API_KEY,
  baseURL: process.env.OPEN_BASE_URL ?? "https://openrouter.ai/api/v1",
});

/**
 * Primary model for AI suggestions.
 * Configurable via OPENROUTER_MODEL env var (default: openrouter/free).
 */
export const suggestionModel = openRouter(
  process.env.OPEN_MODEL ?? "openrouter/free"
);
