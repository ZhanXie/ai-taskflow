"use server";

import { auth } from "@clerk/nextjs/server";

/**
 * 获取当前认证的用户 ID
 * 如果用户未认证，将抛出错误
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  return userId;
}

/**
 * 验证当前用户是否是资源的所有者
 * 用于确保用户隔离
 */
export async function verifyOwnership(resourceUserId: string): Promise<void> {
  const currentUserId = await getCurrentUserId();

  if (currentUserId !== resourceUserId) {
    throw new Error("Unauthorized: You do not have permission to access this resource");
  }
}
