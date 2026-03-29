// Prisma configuration - Load .env.local for local development
import path from "path";
import dotenv from "dotenv";

// Load .env.local first for local development (SQLite)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
// Fall back to .env if .env.local doesn't have DATABASE_URL
dotenv.config();

// Ensure DATABASE_URL is properly set with correct path resolution
if (!process.env.DATABASE_URL) {
  // Default to SQLite database in prisma directory
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), "prisma/dev.db")}`;
}

export default {};
