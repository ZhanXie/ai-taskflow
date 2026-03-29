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
