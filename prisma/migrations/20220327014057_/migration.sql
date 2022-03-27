/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Profile_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Profile";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discordId" TEXT,
    "displayId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Anonymous',
    "summary" TEXT NOT NULL DEFAULT 'This user has not set a summary.'
);
INSERT INTO "new_User" ("discordId", "displayId", "id") SELECT "discordId", "displayId", "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE UNIQUE INDEX "User_displayId_key" ON "User"("displayId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
