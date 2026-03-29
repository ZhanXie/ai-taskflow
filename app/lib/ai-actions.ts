"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getCurrentUserId } from "./auth";
import type { AIResponse } from "./ai-utils";

/**
 * 任务 7.1: Create getAISuggestions Server Action using @ai-sdk/openai streamText
 * 生成针对任务标题和描述的 AI 建议
 */
export async function getAISuggestions(
  title: string,
  description?: string
) {
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
  console.log("OpenAI API Key configured:", !!process.env.OPENAI_API_KEY);
  
  try {
    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    // Convert to ReadableStream for client-side consumption
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of textStream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });
  } catch (error) {
    console.error("AI API Error:", error);
    // Provide graceful fallback
    const fallbackResponse = JSON.stringify({
      priority: "MEDIUM",
      dueDate: null,
      reasoning: "AI service temporarily unavailable. Using default suggestions.",
    });
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(fallbackResponse));
        controller.close();
      },
    });
  }
}
