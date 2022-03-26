/*
  Warnings:

  - You are about to drop the column `private` on the `Article` table. All the data in the column will be lost.
  - Made the column `title` on table `Article` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "rawContent" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'unlisted',
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("authorId", "content", "createdAt", "displayId", "id", "rawContent", "summary", "title", "updatedAt") SELECT "authorId", "content", "createdAt", "displayId", "id", "rawContent", coalesce("summary", '') AS "summary", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_displayId_key" ON "Article"("displayId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
