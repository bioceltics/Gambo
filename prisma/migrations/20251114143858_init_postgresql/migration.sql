-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'ULTIMATE');

-- CreateEnum
CREATE TYPE "BundleType" AS ENUM ('STANDARD', 'BTTS', 'PLUS_50_ODDS', 'WEEKEND_PLUS_10', 'PLAYERS_TO_SCORE', 'UNDER_OVER');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('UPCOMING', 'LIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('SOCCER', 'BASKETBALL', 'FOOTBALL', 'TENNIS', 'HOCKEY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BundleType" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "expectedReturn" DOUBLE PRECISION NOT NULL,
    "tierAccess" "SubscriptionTier" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'UPCOMING',
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "currentPeriod" TEXT,
    "venue" TEXT,
    "weather" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleGame" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "pick" TEXT NOT NULL,
    "betType" TEXT NOT NULL DEFAULT 'h2h',
    "odds" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "recentForm" TEXT,
    "headToHead" TEXT,
    "injuries" TEXT,
    "advancedMetrics" TEXT,
    "weatherConditions" TEXT,
    "motivationFactors" TEXT,
    "setPieceAnalysis" TEXT,
    "styleMatchup" TEXT,
    "playerForm" TEXT,
    "marketIntelligence" TEXT,
    "result" TEXT,

    CONSTRAINT "BundleGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveGameStats" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "possession" JSONB,
    "shots" JSONB,
    "shotsOnTarget" JSONB,
    "corners" JSONB,
    "xG" JSONB,
    "passAccuracy" JSONB,
    "fieldGoalPct" JSONB,
    "threePointPct" JSONB,
    "rebounds" JSONB,
    "assists" JSONB,
    "totalYards" JSONB,
    "passingYards" JSONB,
    "rushingYards" JSONB,
    "aces" JSONB,
    "doubleFaults" JSONB,
    "firstServesPct" JSONB,
    "breakPoints" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveGameStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundlePerformance" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "pushes" INTEGER NOT NULL DEFAULT 0,
    "actualReturn" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BundlePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBundleRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sport" "Sport",
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomBundleRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyzedGame" (
    "id" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "country" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "recommendedPick" TEXT NOT NULL,
    "betType" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "recentForm" TEXT NOT NULL,
    "headToHead" TEXT NOT NULL,
    "injuries" TEXT NOT NULL,
    "advancedMetrics" TEXT NOT NULL,
    "weatherConditions" TEXT NOT NULL,
    "motivationFactors" TEXT NOT NULL,
    "setPieceAnalysis" TEXT,
    "styleMatchup" TEXT,
    "playerForm" TEXT,
    "marketIntelligence" TEXT,
    "selectedForBundle" BOOLEAN NOT NULL DEFAULT false,
    "bundleId" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyzedGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Bundle_type_isActive_idx" ON "Bundle"("type", "isActive");

-- CreateIndex
CREATE INDEX "Bundle_publishedAt_idx" ON "Bundle"("publishedAt");

-- CreateIndex
CREATE INDEX "Bundle_archivedAt_idx" ON "Bundle"("archivedAt");

-- CreateIndex
CREATE INDEX "Game_sport_scheduledAt_idx" ON "Game"("sport", "scheduledAt");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "BundleGame_bundleId_idx" ON "BundleGame"("bundleId");

-- CreateIndex
CREATE INDEX "BundleGame_gameId_idx" ON "BundleGame"("gameId");

-- CreateIndex
CREATE INDEX "BundleGame_betType_idx" ON "BundleGame"("betType");

-- CreateIndex
CREATE UNIQUE INDEX "LiveGameStats_gameId_key" ON "LiveGameStats"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "BundlePerformance_bundleId_key" ON "BundlePerformance"("bundleId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "CustomBundleRequest_userId_idx" ON "CustomBundleRequest"("userId");

-- CreateIndex
CREATE INDEX "AnalyzedGame_sport_generationDate_idx" ON "AnalyzedGame"("sport", "generationDate");

-- CreateIndex
CREATE INDEX "AnalyzedGame_country_competition_idx" ON "AnalyzedGame"("country", "competition");

-- CreateIndex
CREATE INDEX "AnalyzedGame_scheduledAt_idx" ON "AnalyzedGame"("scheduledAt");

-- CreateIndex
CREATE INDEX "AnalyzedGame_selectedForBundle_idx" ON "AnalyzedGame"("selectedForBundle");

-- CreateIndex
CREATE INDEX "AnalyzedGame_confidenceScore_idx" ON "AnalyzedGame"("confidenceScore");

-- AddForeignKey
ALTER TABLE "BundleGame" ADD CONSTRAINT "BundleGame_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleGame" ADD CONSTRAINT "BundleGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveGameStats" ADD CONSTRAINT "LiveGameStats_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePerformance" ADD CONSTRAINT "BundlePerformance_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomBundleRequest" ADD CONSTRAINT "CustomBundleRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
