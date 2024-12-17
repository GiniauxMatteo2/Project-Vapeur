-- CreateTable
CREATE TABLE "GameFeatures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "GameFeatures_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GameFeatures_gameId_key" ON "GameFeatures"("gameId");
