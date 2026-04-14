"use client";

import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "@/app/lib/task-actions";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import type { Task, TaskStatus } from "@/app/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const result = await getTasks({ take: 100 });
      setTasks(result);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id: string) {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        setTasks(tasks.filter(t => t.id !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task");
      }
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    await updateTask(id, { status });
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  }

  function handleTaskCreated() {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">Manage your tasks with AI suggestions</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "Add Task"}
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <TaskForm
              task={editingTask}
              onTaskCreated={handleTaskCreated}
            />
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowForm(true);
                }}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
