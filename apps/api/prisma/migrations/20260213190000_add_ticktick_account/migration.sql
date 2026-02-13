-- CreateTable
CREATE TABLE "TickTickAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" BYTEA NOT NULL,
    "refreshToken" BYTEA NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TickTickAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TickTickAccount_userId_key" ON "TickTickAccount"("userId");

-- CreateIndex
CREATE INDEX "TickTickAccount_userId_idx" ON "TickTickAccount"("userId");

-- AddForeignKey
ALTER TABLE "TickTickAccount" ADD CONSTRAINT "TickTickAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "IntegrationType" ADD VALUE 'ticktick';

-- AlterEnum
ALTER TYPE "ChatType" ADD VALUE 'ticktick';
