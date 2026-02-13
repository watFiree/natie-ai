-- CreateTable
CREATE TABLE "ModelPricing" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputPricePerMillionMicros" INTEGER NOT NULL DEFAULT 0,
    "outputPricePerMillionMicros" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserModelTokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" BIGINT NOT NULL DEFAULT 0,
    "outputTokens" BIGINT NOT NULL DEFAULT 0,
    "totalTokens" BIGINT NOT NULL DEFAULT 0,
    "inputCostMicros" BIGINT NOT NULL DEFAULT 0,
    "outputCostMicros" BIGINT NOT NULL DEFAULT 0,
    "totalCostMicros" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModelTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelPricing_model_key" ON "ModelPricing"("model");

-- CreateIndex
CREATE UNIQUE INDEX "UserModelTokenUsage_userId_model_key" ON "UserModelTokenUsage"("userId", "model");

-- CreateIndex
CREATE INDEX "UserModelTokenUsage_userId_idx" ON "UserModelTokenUsage"("userId");

-- CreateIndex
CREATE INDEX "UserModelTokenUsage_model_idx" ON "UserModelTokenUsage"("model");

-- AddForeignKey
ALTER TABLE "UserModelTokenUsage" ADD CONSTRAINT "UserModelTokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
