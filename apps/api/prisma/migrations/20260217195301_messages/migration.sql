/*
  Warnings:

  - The values [system,tool] on the enum `LangChainMessageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [email,x] on the enum `MessageChannel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `additional_kwargs` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `seq` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `tool_name` on the `Message` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LangChainMessageType_new" AS ENUM ('human', 'ai');
ALTER TABLE "Message" ALTER COLUMN "type" TYPE "LangChainMessageType_new" USING ("type"::text::"LangChainMessageType_new");
ALTER TYPE "LangChainMessageType" RENAME TO "LangChainMessageType_old";
ALTER TYPE "LangChainMessageType_new" RENAME TO "LangChainMessageType";
DROP TYPE "public"."LangChainMessageType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MessageChannel_new" AS ENUM ('web', 'telegram');
ALTER TABLE "public"."Message" ALTER COLUMN "channel" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "channel" TYPE "MessageChannel_new" USING ("channel"::text::"MessageChannel_new");
ALTER TYPE "MessageChannel" RENAME TO "MessageChannel_old";
ALTER TYPE "MessageChannel_new" RENAME TO "MessageChannel";
DROP TYPE "public"."MessageChannel_old";
ALTER TABLE "Message" ALTER COLUMN "channel" SET DEFAULT 'web';
COMMIT;

-- DropIndex
DROP INDEX "Message_conversationId_seq_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "additional_kwargs",
DROP COLUMN "seq",
DROP COLUMN "tool_name",
ADD COLUMN     "invalid_tool_calls" JSONB,
ADD COLUMN     "tool_calls" JSONB,
ALTER COLUMN "content" SET DATA TYPE TEXT;
