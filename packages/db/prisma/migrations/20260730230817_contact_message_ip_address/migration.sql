-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "ContactMessage_ipAddress_createdAt_idx" ON "ContactMessage"("ipAddress", "createdAt");
