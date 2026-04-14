"use server";

import { prisma } from "./prisma";
import { getCurrentUserId } from "./auth";
import { z, ZodError } from "zod";
import type { Task, TaskStatus, Priority } from "@prisma/client";

// Schema for validation
const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"] as const).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"] as const).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

type TaskInput = z.infer<typeof TaskSchema>;

/**
 * 创建新任务
 * Task 4.1: Create createTask Server Action with validation and database insert
 */
export async function createTask(input: TaskInput): Promise<Task> {
  try {
    const userId = await getCurrentUserId();

    // Validate input
    const validated = TaskSchema.parse(input);

    // Ensure user exists in database (create if not exists)
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    const task = await prisma.task.create({
      data: {
        ...validated,
        userId,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        status: (validated.status as TaskStatus) ?? "TODO",
        priority: (validated.priority as Priority) ?? "MEDIUM",
      },
    });

    return task;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.issues.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

/**
 * 获取当前用户的所有任务
 * Task 4.2: Create getTasks Server Action to fetch user's tasks with pagination/sorting
 */
export async function getTasks(
  options?: {
    skip?: number;
    take?: number;
    orderBy?: "createdAt" | "dueDate" | "priority";
    order?: "asc" | "desc";
  }
): Promise<Task[]> {
  const userId = await getCurrentUserId();
  
  const skip = options?.skip || 0;
  const take = options?.take || 10;
  const orderBy = options?.orderBy || "createdAt";
  const order = options?.order || "desc";

  const tasks = await prisma.task.findMany({
    where: { userId, deletedAt: null },
    skip,
    take,
    orderBy: {
      [orderBy]: order,
    },
  });

  return tasks;
}

/**
 * 获取单个任务
 * Task 4.3: Create getTask Server Action to fetch single task by id
 */
export async function getTask(id: string): Promise<Task> {
  const userId = await getCurrentUserId();

  const task = await prisma.task.findUnique({
    where: { id, userId, deletedAt: null },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

/**
 * 更新任务
 * Task 4.4: Create updateTask Server Action with optimistic updates
 */
export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const userId = await getCurrentUserId();

  // Get existing task to verify ownership (atomic query)
  const existingTask = await prisma.task.findUnique({
    where: { id, userId, deletedAt: null },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  // Validate input
  const validated = TaskSchema.partial().parse(input);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    },
  });

  return task;
}

/**
 * 删除任务
 * Task 4.5: Create deleteTask Server Action with authorization check
 */
export async function deleteTask(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  // Get task to verify ownership (atomic query)
  const task = await prisma.task.findUnique({
    where: { id, userId, deletedAt: null },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Soft delete
  await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
