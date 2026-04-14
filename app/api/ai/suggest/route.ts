import { streamObject } from "ai";
import { suggestionModel } from "@/app/lib/ai-model";
import { AISuggestionSchema } from "@/app/lib/ai-schema";

const SYSTEM_PROMPT = `You are a task management assistant. Based on the task title and optional description, suggest:
1. A priority level (LOW, MEDIUM, or HIGH)
2. A suggested due date (YYYY-MM-DD format, or null if not applicable)
3. Brief reasoning for your suggestions

Respond with valid JSON matching the provided schema.`;

export async function POST(request: Request) {
  const body = await request.json();
  const title = body?.title as string | undefined;
  const description = body?.description as string | undefined;

  if (!title?.trim()) {
    return new Response("Title is required", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const result = streamObject({
      model: suggestionModel,
      schema: AISuggestionSchema,
      system: SYSTEM_PROMPT,
      prompt: `Task Title: ${title.trim()}\n${description?.trim() ? `Task Description: ${description.trim()}` : ""}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI suggestion error:", error);
    return new Response(
      error instanceof Error ? error.message : "Failed to generate suggestions",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
