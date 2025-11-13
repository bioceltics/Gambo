-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BundleGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bundleId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "pick" TEXT NOT NULL,
    "betType" TEXT NOT NULL DEFAULT 'h2h',
    "odds" REAL NOT NULL,
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
    CONSTRAINT "BundleGame_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BundleGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BundleGame" ("advancedMetrics", "bundleId", "gameId", "headToHead", "id", "injuries", "marketIntelligence", "motivationFactors", "odds", "pick", "playerForm", "recentForm", "result", "setPieceAnalysis", "styleMatchup", "summary", "weatherConditions") SELECT "advancedMetrics", "bundleId", "gameId", "headToHead", "id", "injuries", "marketIntelligence", "motivationFactors", "odds", "pick", "playerForm", "recentForm", "result", "setPieceAnalysis", "styleMatchup", "summary", "weatherConditions" FROM "BundleGame";
DROP TABLE "BundleGame";
ALTER TABLE "new_BundleGame" RENAME TO "BundleGame";
CREATE INDEX "BundleGame_bundleId_idx" ON "BundleGame"("bundleId");
CREATE INDEX "BundleGame_gameId_idx" ON "BundleGame"("gameId");
CREATE INDEX "BundleGame_betType_idx" ON "BundleGame"("betType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
