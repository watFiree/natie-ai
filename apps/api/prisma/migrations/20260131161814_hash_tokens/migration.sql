/*
  Warnings:

  - Changed the type of `accessToken` on the `GmailAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `refreshToken` to the `GmailAccount` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `authToken` on the `XAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ct0` on the `XAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "GmailAccount_userId_idx";

-- DropIndex
DROP INDEX "XAccount_userId_idx";

-- AlterTable
ALTER TABLE "GmailAccount" DROP COLUMN "accessToken",
ADD COLUMN     "accessToken" BYTEA NOT NULL,
DROP COLUMN "refreshToken",
ADD COLUMN     "refreshToken" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "XAccount" DROP COLUMN "authToken",
ADD COLUMN     "authToken" BYTEA NOT NULL,
DROP COLUMN "ct0",
ADD COLUMN     "ct0" BYTEA NOT NULL;
