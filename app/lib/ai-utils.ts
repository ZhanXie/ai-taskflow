// AI utility functions (not Server Actions)

export interface AIResponse {
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  reasoning: string;
}

/**
 * 从 AI 响应文本解析建议
 * Task 7.3: Parse AI suggestions for priority and due date
 */
export function parseAISuggestions(responseText: string): AIResponse {
  // Handle empty response
  if (!responseText || responseText.trim() === "") {
    console.warn("Empty response from AI, using default suggestions");
    return {
      priority: "MEDIUM",
      dueDate: null,
      reasoning: "AI service returned empty response, using default suggestions.",
    };
  }

  try {
    // Try to extract JSON from response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${responseText.substring(0, 100)}`);
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse AI suggestions: ${errorMsg}`);
  }
}
