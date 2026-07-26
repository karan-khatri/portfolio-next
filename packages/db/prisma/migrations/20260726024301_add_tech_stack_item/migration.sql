-- CreateTable
CREATE TABLE "TechStackItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TechStackItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TechStackItem_order_idx" ON "TechStackItem"("order");
