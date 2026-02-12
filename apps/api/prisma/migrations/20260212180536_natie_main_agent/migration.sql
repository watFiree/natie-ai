/*
  Warnings:

  - You are about to drop the `Agent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailAgentSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TelegramConversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TelegramMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAgent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAgentConversation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('email', 'x');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('natie', 'email', 'x', 'telegram');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('web', 'telegram', 'email', 'x');

-- DropForeignKey
ALTER TABLE "EmailAgentSettings" DROP CONSTRAINT "EmailAgentSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "TelegramConversation" DROP CONSTRAINT "TelegramConversation_telegramSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "TelegramMessage" DROP CONSTRAINT "TelegramMessage_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "UserAgent" DROP CONSTRAINT "UserAgent_agentId_fkey";

-- DropForeignKey
ALTER TABLE "UserAgent" DROP CONSTRAINT "UserAgent_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAgentConversation" DROP CONSTRAINT "UserAgentConversation_userAgentId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "channel" "MessageChannel" NOT NULL DEFAULT 'web';

-- DropTable
DROP TABLE "Agent";

-- DropTable
DROP TABLE "EmailAgentSettings";

-- DropTable
DROP TABLE "TelegramConversation";

-- DropTable
DROP TABLE "TelegramMessage";

-- DropTable
DROP TABLE "UserAgent";

-- DropTable
DROP TABLE "UserAgentConversation";

-- DropEnum
DROP TYPE "AgentType";

-- CreateTable
CREATE TABLE "EmailIntegrationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labels" TEXT[],

    CONSTRAINT "EmailIntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "displayName" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ChatType" NOT NULL,
    "userIntegrationId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailIntegrationSettings_userId_idx" ON "EmailIntegrationSettings"("userId");

-- CreateIndex
CREATE INDEX "UserIntegration_userId_idx" ON "UserIntegration"("userId");

-- CreateIndex
CREATE INDEX "UserIntegration_integrationId_idx" ON "UserIntegration"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_userId_integrationId_key" ON "UserIntegration"("userId", "integrationId");

-- CreateIndex
CREATE INDEX "UserChat_userId_idx" ON "UserChat"("userId");

-- CreateIndex
CREATE INDEX "UserChat_userIntegrationId_idx" ON "UserChat"("userIntegrationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChat_userId_type_key" ON "UserChat"("userId", "type");

-- AddForeignKey
ALTER TABLE "EmailIntegrationSettings" ADD CONSTRAINT "EmailIntegrationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userIntegrationId_fkey" FOREIGN KEY ("userIntegrationId") REFERENCES "UserIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "UserChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
