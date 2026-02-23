-- CreateTable
CREATE TABLE "ModelPricing" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_provider" TEXT NOT NULL,
    "input_price_per_token" DECIMAL(20,12) NOT NULL,
    "output_price_per_token" DECIMAL(20,12) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsageRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelPricingId" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "cached_tokens" INTEGER NOT NULL DEFAULT 0,
    "reasoning_tokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelPricing_model_name_model_provider_key" ON "ModelPricing"("model_name", "model_provider");

-- CreateIndex
CREATE INDEX "TokenUsageRecord_userId_createdAt_idx" ON "TokenUsageRecord"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TokenUsageRecord_userId_modelPricingId_key" ON "TokenUsageRecord"("userId", "modelPricingId");

-- AddForeignKey
ALTER TABLE "TokenUsageRecord" ADD CONSTRAINT "TokenUsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenUsageRecord" ADD CONSTRAINT "TokenUsageRecord_modelPricingId_fkey" FOREIGN KEY ("modelPricingId") REFERENCES "ModelPricing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
