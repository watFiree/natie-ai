-- CreateTable
CREATE TABLE "TelegramConversation" (
    "id" TEXT NOT NULL,
    "telegramSettingsId" TEXT NOT NULL,
    "agentType" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramMessage" (
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

    CONSTRAINT "TelegramMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelegramConversation_telegramSettingsId_idx" ON "TelegramConversation"("telegramSettingsId");

-- CreateIndex
CREATE INDEX "TelegramMessage_conversationId_createdAt_idx" ON "TelegramMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "TelegramMessage_conversationId_seq_idx" ON "TelegramMessage"("conversationId", "seq");

-- AddForeignKey
ALTER TABLE "TelegramConversation" ADD CONSTRAINT "TelegramConversation_telegramSettingsId_fkey" FOREIGN KEY ("telegramSettingsId") REFERENCES "TelegramSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramMessage" ADD CONSTRAINT "TelegramMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TelegramConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
