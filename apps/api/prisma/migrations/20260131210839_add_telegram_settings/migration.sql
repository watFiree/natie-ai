-- CreateTable
CREATE TABLE "TelegramSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "telegramBotToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramSettings_userId_key" ON "TelegramSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramSettings_telegramUserId_key" ON "TelegramSettings"("telegramUserId");

-- CreateIndex
CREATE INDEX "TelegramSettings_userId_idx" ON "TelegramSettings"("userId");

-- CreateIndex
CREATE INDEX "TelegramSettings_telegramUserId_idx" ON "TelegramSettings"("telegramUserId");

-- AddForeignKey
ALTER TABLE "TelegramSettings" ADD CONSTRAINT "TelegramSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
