-- CreateEnum
CREATE TYPE "LangChainMessageType" AS ENUM ('human', 'ai', 'system', 'tool');

-- CreateTable
CREATE TABLE "EmailAgentSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labels" TEXT[],

    CONSTRAINT "EmailAgentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "displayName" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAgentConversation" (
    "id" TEXT NOT NULL,
    "userAgentId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAgentConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "type" "LangChainMessageType" NOT NULL,
    "content" JSONB NOT NULL,
    "name" TEXT,
    "additional_kwargs" JSONB,
    "response_metadata" JSONB,
    "tool_call_id" TEXT,
    "tool_name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seq" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailAgentSettings_userId_idx" ON "EmailAgentSettings"("userId");

-- CreateIndex
CREATE INDEX "UserAgent_userId_idx" ON "UserAgent"("userId");

-- CreateIndex
CREATE INDEX "UserAgent_agentId_idx" ON "UserAgent"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAgent_userId_agentId_key" ON "UserAgent"("userId", "agentId");

-- CreateIndex
CREATE INDEX "UserAgentConversation_userAgentId_idx" ON "UserAgentConversation"("userAgentId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_seq_idx" ON "Message"("conversationId", "seq");

-- AddForeignKey
ALTER TABLE "EmailAgentSettings" ADD CONSTRAINT "EmailAgentSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAgent" ADD CONSTRAINT "UserAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAgent" ADD CONSTRAINT "UserAgent_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAgentConversation" ADD CONSTRAINT "UserAgentConversation_userAgentId_fkey" FOREIGN KEY ("userAgentId") REFERENCES "UserAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "UserAgentConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
