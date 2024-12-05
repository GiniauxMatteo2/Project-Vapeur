-- CreateTable
CREATE TABLE "Games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GamesTypes" (
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "type"),
    CONSTRAINT "GamesTypes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GamePublishers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publisher" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "GamePublishers_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
