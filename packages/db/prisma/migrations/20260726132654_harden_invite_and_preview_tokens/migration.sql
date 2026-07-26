-- AlterTable
ALTER TABLE "InviteToken" DROP CONSTRAINT "InviteToken_pkey",
DROP COLUMN "token",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "tokenHash" TEXT NOT NULL,
ADD CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PreviewToken" DROP CONSTRAINT "PreviewToken_pkey",
DROP COLUMN "token",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "tokenHash" TEXT NOT NULL,
ADD CONSTRAINT "PreviewToken_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_tokenHash_key" ON "InviteToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PreviewToken_tokenHash_key" ON "PreviewToken"("tokenHash");
