"use client";

import { useState, useRef, useEffect } from "react";
import { getAISuggestions } from "@/app/lib/ai-actions";
import { parseAISuggestions } from "@/app/lib/ai-utils";

interface AISuggestionsProps {
  title: string;
  description?: string;
  onApply: (priority: string, dueDate: string | null) => void;
}

export default function AISuggestions({
  title,
  description,
  onApply,
}: AISuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    priority: string;
    dueDate: string | null;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // 任务 7.2: Implement streaming response handler on client side
  async function handleSuggest() {
    if (!title.trim()) {
      setError("Please enter a task title first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuggestions(null);
      setStreamingText("");

      const response = await getAISuggestions(title, description);

      if (!response) {
        throw new Error("No response from AI");
      }

      const reader = response.getReader();
      const decoder = new TextDecoder();
      readerRef.current = reader;

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Parse final suggestions from complete text
          try {
            const parsed = parseAISuggestions(fullText);
            setSuggestions(parsed);
            setStreamingText("");
          } catch (parseError) {
            setError(
              parseError instanceof Error
                ? parseError.message
                : "Failed to parse suggestions"
            );
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("abort")) {
        return; // User cancelled
      }

      // 任务 7.6: Implement error handling for AI API timeouts and rate limits
      if (err instanceof Error) {
        if (err.message.includes("rate limit")) {
          setError("Too many suggestions. Please try again in a moment.");
        } else if (err.message.includes("timeout")) {
          setError("Request timed out. Please try again.");
        } else {
          setError(`Could not generate suggestions: ${err.message}`);
        }
      } else {
        setError("Could not generate suggestions. Please enter manually.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setIsLoading(false);
    setStreamingText("");
  }

  // 任务 7.5: Add "Use these suggestions" button to apply AI results
  function handleApply() {
    if (suggestions) {
      onApply(suggestions.priority, suggestions.dueDate);
      setSuggestions(null);
      setStreamingText("");
    }
  }

  return (
    <div className="space-y-4">
      {/* Suggest Button */}
      <div className="flex gap-2">
        <button
          onClick={handleSuggest}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 font-medium text-sm"
        >
          {isLoading ? "Generating..." : "✨ AI Suggest"}
        </button>
        {isLoading && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          <div className="font-semibold mb-1">❌ Error</div>
          <div>{error}</div>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer underline">Debug Info</summary>
            <div className="mt-1 p-2 bg-white rounded font-mono text-gray-600">
              {streamingText && (
                <div className="mb-2">
                  <div className="font-semibold">Raw Response:</div>
                  <div className="max-h-20 overflow-auto whitespace-pre-wrap break-words">
                    {streamingText.substring(0, 200)}
                    {streamingText.length > 200 ? "..." : ""}
                  </div>
                </div>
              )}
              <div>Check browser console for more details</div>
            </div>
          </details>
        </div>
      )}

      {/* Streaming Response */}
      {isLoading && streamingText && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <div className="font-medium mb-2">AI is generating suggestions...</div>
          <div className="text-xs font-mono bg-white p-2 rounded max-h-40 overflow-auto">
            {streamingText}
          </div>
        </div>
      )}

      {/* Suggestions Display */}
      {suggestions && (
        <div className="p-4 bg-green-50 border border-green-200 rounded space-y-3">
          <div className="font-medium text-green-900">AI Suggestions</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Priority
              </div>
              <div className="px-3 py-2 bg-white rounded border border-green-200 font-semibold text-green-700">
                {suggestions.priority}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Due Date
              </div>
              <div className="px-3 py-2 bg-white rounded border border-green-200 font-semibold text-green-700">
                {suggestions.dueDate || "No date"}
              </div>
            </div>
          </div>

          {suggestions.reasoning && (
            <div className="text-sm text-green-800 italic">
              "{suggestions.reasoning}"
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex-1"
            >
              Use These Suggestions
            </button>
            <button
              onClick={() => setSuggestions(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
