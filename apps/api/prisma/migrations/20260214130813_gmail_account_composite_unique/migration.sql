-- DropIndex
DROP INDEX "GmailAccount_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "GmailAccount_userId_email_key" ON "GmailAccount"("userId", "email");
