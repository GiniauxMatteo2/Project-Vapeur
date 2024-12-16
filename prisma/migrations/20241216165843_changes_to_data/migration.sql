/*
  Warnings:

  - You are about to drop the `GamesTypes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `gameId` on the `GamePublishers` table. All the data in the column will be lost.
  - Added the required column `genreId` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishersId` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GamesTypes";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GamePublishers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publisher" TEXT NOT NULL
);
INSERT INTO "new_GamePublishers" ("id", "publisher") SELECT "id", "publisher" FROM "GamePublishers";
DROP TABLE "GamePublishers";
ALTER TABLE "new_GamePublishers" RENAME TO "GamePublishers";
CREATE TABLE "new_Games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
    "genreId" INTEGER NOT NULL,
    "publishersId" INTEGER NOT NULL,
    CONSTRAINT "Games_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Games_publishersId_fkey" FOREIGN KEY ("publishersId") REFERENCES "GamePublishers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Games" ("description", "id", "releaseDate", "title") SELECT "description", "id", "releaseDate", "title" FROM "Games";
DROP TABLE "Games";
ALTER TABLE "new_Games" RENAME TO "Games";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
