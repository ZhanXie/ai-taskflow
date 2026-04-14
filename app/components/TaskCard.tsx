"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/app/lib/types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

export default function TaskCard({ task, onDelete, onEdit, onStatusChange }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus: TaskStatus) {
    try {
      setIsUpdating(true);
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  }

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 mt-2 text-sm">{task.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Status */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Status:</label>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            disabled={isUpdating}
            className={`px-3 py-1 text-xs rounded font-medium cursor-pointer ${
              statusColors[task.status]
            }`}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Priority:</label>
          <span
            className={`px-3 py-1 text-xs rounded font-medium ${
              priorityColors[task.priority]
            }`}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>

        {/* Due Date */}
        {formattedDate && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Due:</label>
            <span className="text-xs text-gray-700">{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
