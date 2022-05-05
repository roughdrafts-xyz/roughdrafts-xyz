-- CreateTable
CREATE TABLE "Article" (
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

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT,
    "displayId" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Anonymous',
    "summary" TEXT NOT NULL DEFAULT 'This user has not set a summary.'
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_displayId_key" ON "Article"("displayId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_displayId_key" ON "User"("displayId");
