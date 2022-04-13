/*
  Warnings:

  - The primary key for the `Article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'unlisted',
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("authorId", "content", "createdAt", "displayId", "id", "rawContent", "summary", "title", "updatedAt", "visibility") SELECT "authorId", "content", "createdAt", "displayId", "id", "rawContent", "summary", "title", "updatedAt", "visibility" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_displayId_key" ON "Article"("displayId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "displayId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Anonymous',
    "summary" TEXT NOT NULL DEFAULT 'This user has not set a summary.'
);
INSERT INTO "new_User" ("discordId", "displayId", "id", "name", "summary") SELECT "discordId", "displayId", "id", "name", "summary" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE UNIQUE INDEX "User_displayId_key" ON "User"("displayId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
