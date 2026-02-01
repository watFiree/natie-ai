/*
  Warnings:

  - Added the required column `type` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('email', 'x', 'chat');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "type" "AgentType" NOT NULL;
