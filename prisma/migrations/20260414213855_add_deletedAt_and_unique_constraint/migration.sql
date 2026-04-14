-- AlterTable
ALTER TABLE "Task" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_title_deletedAt_key" ON "Task"("userId", "title", "deletedAt");
