-- Drop old tables
DROP TABLE "TelegramMessage";
DROP TABLE "TelegramConversation";

-- Create new TelegramConversation table (one per user)
CREATE TABLE "TelegramConversation" (
    "id" TEXT NOT NULL,
    "telegramSettingsId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramConversation_pkey" PRIMARY KEY ("id")
);

-- Create unique index on telegramSettingsId (one conversation per user)
CREATE UNIQUE INDEX "TelegramConversation_telegramSettingsId_key" ON "TelegramConversation"("telegramSettingsId");

-- Create new TelegramMessage table with agentType
CREATE TABLE "TelegramMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "type" "LangChainMessageType" NOT NULL,
    "agentType" TEXT,
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

-- Create indexes
CREATE INDEX "TelegramMessage_conversationId_createdAt_idx" ON "TelegramMessage"("conversationId", "createdAt");
CREATE INDEX "TelegramMessage_conversationId_seq_idx" ON "TelegramMessage"("conversationId", "seq");
CREATE INDEX "TelegramMessage_agentType_idx" ON "TelegramMessage"("agentType");

-- Add foreign keys
ALTER TABLE "TelegramConversation" ADD CONSTRAINT "TelegramConversation_telegramSettingsId_fkey" FOREIGN KEY ("telegramSettingsId") REFERENCES "TelegramSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TelegramMessage" ADD CONSTRAINT "TelegramMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TelegramConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
