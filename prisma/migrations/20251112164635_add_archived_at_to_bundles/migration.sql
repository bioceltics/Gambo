-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN "archivedAt" DATETIME;

-- CreateIndex
CREATE INDEX "Bundle_archivedAt_idx" ON "Bundle"("archivedAt");
