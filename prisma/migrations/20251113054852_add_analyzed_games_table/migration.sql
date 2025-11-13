-- CreateTable
CREATE TABLE "AnalyzedGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sport" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "recommendedPick" TEXT NOT NULL,
    "betType" TEXT NOT NULL,
    "odds" REAL NOT NULL,
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
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generationDate" DATETIME NOT NULL
);

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
