-- CreateEnum
CREATE TYPE "AiBlogRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiBlogItemStatus" AS ENUM ('QUEUED', 'RESEARCHING', 'WRITING', 'SAVED', 'FAILED');

-- CreateTable
CREATE TABLE "AiBlogRun" (
    "id" TEXT NOT NULL,
    "status" "AiBlogRunStatus" NOT NULL DEFAULT 'RUNNING',
    "requestedCount" INTEGER NOT NULL,
    "focusKeyword" TEXT,
    "discoveredAt" TIMESTAMP(3),
    "discoveryUsage" JSONB,
    "error" TEXT,
    "heartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiBlogRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiBlogRunItem" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "whyTrending" TEXT NOT NULL,
    "sourceUrls" TEXT[],
    "status" "AiBlogItemStatus" NOT NULL DEFAULT 'QUEUED',
    "failedStage" TEXT,
    "error" TEXT,
    "research" JSONB,
    "usage" JSONB,
    "warnings" TEXT[],
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiBlogRunItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiBlogRun_createdAt_idx" ON "AiBlogRun"("createdAt");

-- CreateIndex
CREATE INDEX "AiBlogRun_createdById_createdAt_idx" ON "AiBlogRun"("createdById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiBlogRunItem_runId_position_key" ON "AiBlogRunItem"("runId", "position");

-- CreateIndex
CREATE INDEX "AiBlogRunItem_postId_idx" ON "AiBlogRunItem"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "AiBlogRun_single_running_idx" ON "AiBlogRun" ((true)) WHERE "status" = 'RUNNING';

-- AddForeignKey
ALTER TABLE "AiBlogRun" ADD CONSTRAINT "AiBlogRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiBlogRunItem" ADD CONSTRAINT "AiBlogRunItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AiBlogRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiBlogRunItem" ADD CONSTRAINT "AiBlogRunItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
