import { PrismaClient } from "../../prisma/generated/client";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Parse and resolve the database URL
const getResolvedDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // If it's a SQLite file URL with relative path, resolve it to absolute path
  if (databaseUrl.startsWith("file:./")) {
    const relativePath = databaseUrl.substring("file:./".length);
    const absolutePath = path.resolve(process.cwd(), relativePath);
    return `file:${absolutePath}`;
  }
  
  // Return as-is for other URLs (PostgreSQL, MySQL, etc.)
  return databaseUrl;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getResolvedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;