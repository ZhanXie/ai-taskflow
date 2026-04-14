"use client";

import { useSuggestion } from "@/app/hooks/use-suggestion";

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
  const {
    isLoading,
    error,
    suggestion,
    partialSuggestion,
    fetchSuggestion,
    dismiss,
    cancel,
  } = useSuggestion();

  function handleSuggest() {
    fetchSuggestion(title, description);
  }

  function handleApplySuggestion() {
    if (suggestion) {
      onApply(suggestion.priority, suggestion.dueDate);
    }
  }

  // Priority display with color
  const priorityColors: Record<string, string> = {
    LOW: "text-blue-600",
    MEDIUM: "text-yellow-600",
    HIGH: "text-red-600",
  };

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
            onClick={cancel}
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
        </div>
      )}

      {/* Streaming Partial Response */}
      {isLoading && partialSuggestion && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <div className="font-medium mb-2">AI is generating suggestions...</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Priority</div>
              <div className="px-3 py-2 bg-white rounded border border-blue-200 font-semibold">
                {partialSuggestion.priority ? (
                  <span className={priorityColors[partialSuggestion.priority]}>
                    {partialSuggestion.priority}
                  </span>
                ) : (
                  <span className="text-gray-400">thinking...</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Due Date</div>
              <div className="px-3 py-2 bg-white rounded border border-blue-200 font-semibold">
                {partialSuggestion.dueDate || (
                  <span className="text-gray-400">thinking...</span>
                )}
              </div>
            </div>
          </div>
          {partialSuggestion.reasoning && (
            <div className="text-xs text-gray-600 mt-2 italic">
              {partialSuggestion.reasoning}
            </div>
          )}
        </div>
      )}

      {/* Complete Suggestions */}
      {suggestion && (
        <div className="p-4 bg-green-50 border border-green-200 rounded space-y-3">
          <div className="font-medium text-green-900">AI Suggestions</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Priority
              </div>
              <div className={`px-3 py-2 bg-white rounded border border-green-200 font-semibold ${priorityColors[suggestion.priority]}`}>
                {suggestion.priority}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Due Date
              </div>
              <div className="px-3 py-2 bg-white rounded border border-green-200 font-semibold text-green-700">
                {suggestion.dueDate || "No date"}
              </div>
            </div>
          </div>

          {suggestion.reasoning && (
            <div className="text-sm text-green-800 italic">
              {suggestion.reasoning}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplySuggestion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex-1"
            >
              Use These Suggestions
            </button>
            <button
              onClick={dismiss}
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
