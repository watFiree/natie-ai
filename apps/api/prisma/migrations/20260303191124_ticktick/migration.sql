-- CreateEnum
CREATE TYPE "TodoAppProvider" AS ENUM ('TickTick');

-- AlterEnum
ALTER TYPE "ChatType" ADD VALUE 'todo';

-- CreateTable
CREATE TABLE "TodoAppAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "TodoAppProvider" NOT NULL,
    "accessToken" BYTEA NOT NULL,
    "refreshToken" BYTEA NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoAppAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoAppAccount_userId_key" ON "TodoAppAccount"("userId");

-- AddForeignKey
ALTER TABLE "TodoAppAccount" ADD CONSTRAINT "TodoAppAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
