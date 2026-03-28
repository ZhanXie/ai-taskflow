"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getCurrentUserId } from "./auth";

interface AIResponse {
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  reasoning: string;
}

/**
 * 任务 7.1: Create getAISuggestions Server Action using @ai-sdk/openai streamText
 * 生成针对任务标题和描述的 AI 建议
 */
export async function getAISuggestions(
  title: string,
  description?: string
): Promise<ReadableStream<Uint8Array>> {
  // Task 7.2: Implement authentication check
  await getCurrentUserId();

  if (!title.trim()) {
    throw new Error("Title is required for AI suggestions");
  }

  const prompt = `You are a task management assistant. Based on the following task title and description, suggest:
1. A priority level (LOW, MEDIUM, or HIGH)
2. A suggested due date (in YYYY-MM-DD format, or null if not applicable)
3. Brief reasoning for your suggestions

Task Title: ${title}
${description ? `Task Description: ${description}` : ""}

Respond in JSON format like this:
{
  "priority": "MEDIUM",
  "dueDate": "2025-04-15",
  "reasoning": "This task seems moderately important and could be completed within the next week."
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;

  const { textStream } = await streamText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Convert Text Stream to Web Stream
  const stream = textStream.toReadableStream();
  return stream;
}

/**
 * 任务 7.3: Parse AI suggestions for priority and due date
 * 从 AI 响应文本解析建议
 */
export function parseAISuggestions(responseText: string): AIResponse {
  try {
    // 尝试解析 JSON
    const parsed = JSON.parse(responseText);

    // Validate response structure
    if (!parsed.priority || !["LOW", "MEDIUM", "HIGH"].includes(parsed.priority)) {
      throw new Error("Invalid priority in AI response");
    }

    return {
      priority: parsed.priority,
      dueDate: parsed.dueDate || null,
      reasoning: parsed.reasoning || "AI suggestion",
    };
  } catch (error) {
    throw new Error(`Failed to parse AI suggestions: ${error}`);
  }
}
