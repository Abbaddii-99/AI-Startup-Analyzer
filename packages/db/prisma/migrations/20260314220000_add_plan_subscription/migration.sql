-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "stripeSubId" TEXT,
  ADD COLUMN "analysesThisMonth" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "monthResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- AlterTable analyses (add missing columns from schema)
ALTER TABLE "analyses"
  ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- AlterTable analyses score columns to DOUBLE PRECISION
ALTER TABLE "analyses"
  ALTER COLUMN "marketDemandScore" TYPE DOUBLE PRECISION,
  ALTER COLUMN "competitionScore" TYPE DOUBLE PRECISION,
  ALTER COLUMN "executionDifficultyScore" TYPE DOUBLE PRECISION,
  ALTER COLUMN "profitPotentialScore" TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubId_key" ON "users"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "analyses_isPublic_idx" ON "analyses"("isPublic");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
