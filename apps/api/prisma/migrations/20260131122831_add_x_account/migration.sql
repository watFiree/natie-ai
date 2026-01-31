-- CreateTable
CREATE TABLE "XAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "ct0" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XAccount_userId_key" ON "XAccount"("userId");

-- CreateIndex
CREATE INDEX "XAccount_userId_idx" ON "XAccount"("userId");

-- AddForeignKey
ALTER TABLE "XAccount" ADD CONSTRAINT "XAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
