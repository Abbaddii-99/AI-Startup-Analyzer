-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "ideaAnalysis" JSONB,
    "marketResearch" JSONB,
    "competitorAnalysis" JSONB,
    "mvpPlan" JSONB,
    "monetization" JSONB,
    "goToMarket" JSONB,
    "finalReport" JSONB,
    "marketDemandScore" INTEGER,
    "competitionScore" INTEGER,
    "executionDifficultyScore" INTEGER,
    "profitPotentialScore" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "analyses_userId_idx" ON "analyses"("userId");

-- CreateIndex
CREATE INDEX "analyses_status_idx" ON "analyses"("status");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
