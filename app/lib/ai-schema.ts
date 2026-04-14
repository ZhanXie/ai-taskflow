import { z } from "zod";

/**
 * Zod schema defining the structure of AI suggestion responses.
 * Used by streamObject for type-safe, validated AI output.
 */
export const AISuggestionSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().nullable().describe("Suggested due date in YYYY-MM-DD format, or null if not applicable"),
  reasoning: z.string(),
});

export type AISuggestion = z.infer<typeof AISuggestionSchema>;
