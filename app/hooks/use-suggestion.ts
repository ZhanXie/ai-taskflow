"use client";

import { useState, useRef, useCallback } from "react";
import { parsePartialJson } from "ai";
import type { AISuggestion } from "@/app/lib/ai-schema";

interface UseSuggestionReturn {
  isLoading: boolean;
  error: string | null;
  suggestion: AISuggestion | null;
  /** Partial suggestion updated during streaming for progressive UI */
  partialSuggestion: Partial<AISuggestion> | null;
  fetchSuggestion: (title: string, description?: string) => Promise<void>;
  dismiss: () => void;
  cancel: () => void;
}

export function useSuggestion(): UseSuggestionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [partialSuggestion, setPartialSuggestion] = useState<Partial<AISuggestion> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPartialSuggestion(null);
    setIsLoading(false);
  }, []);

  const fetchSuggestion = useCallback(async (title: string, description?: string) => {
    if (!title.trim()) {
      setError("Please enter a task title first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    setPartialSuggestion(null);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Parse final suggestions from complete text
          const { value: parsed } = await parsePartialJson(fullText);
          if (parsed && isValidAISuggestion(parsed)) {
            setPartialSuggestion(null);
            setSuggestion(parsed as AISuggestion);
          } else {
            setError("Failed to parse AI suggestions");
          }
          break;
        }

        fullText += value;
        // Try to parse partial JSON for progressive UI updates
        const { value: partial, state } = await parsePartialJson(fullText);
        if (state === "successful-parse" || state === "repaired-parse") {
          if (partial && typeof partial === "object") {
            setPartialSuggestion(partial as Partial<AISuggestion>);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setPartialSuggestion(null);
        return; // User cancelled
      }
      setPartialSuggestion(null);
      setError(err instanceof Error ? err.message : "Could not generate suggestions");
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setSuggestion(null);
    setPartialSuggestion(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    suggestion,
    partialSuggestion,
    fetchSuggestion,
    dismiss,
    cancel,
  };
}

function isValidAISuggestion(obj: unknown): obj is AISuggestion {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "priority" in obj &&
    ["LOW", "MEDIUM", "HIGH"].includes((obj as AISuggestion).priority) &&
    "reasoning" in obj &&
    typeof (obj as AISuggestion).reasoning === "string"
  );
}
