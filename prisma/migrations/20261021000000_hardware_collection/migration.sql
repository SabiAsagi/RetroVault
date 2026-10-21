-- Additive migration: game collections and existing records are untouched.
CREATE TABLE IF NOT EXISTS "HardwareCollectionItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "catalogId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OWNED' CHECK ("status" IN ('OWNED', 'WISHLIST')),
  "quantity" INTEGER NOT NULL DEFAULT 1 CHECK ("quantity" BETWEEN 1 AND 99),
  "memo" TEXT NOT NULL DEFAULT '' CHECK (length("memo") <= 2000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HardwareCollectionItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HardwareCollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "HardwareCollectionItem_userId_catalogId_key" ON "HardwareCollectionItem"("userId", "catalogId");
CREATE INDEX IF NOT EXISTS "HardwareCollectionItem_userId_idx" ON "HardwareCollectionItem"("userId");
