/*
  Warnings:

  - You are about to drop the column `authorId` on the `Article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorDisplayId,displayId]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorDisplayId` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Made the column `displayId` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `displayId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_authorId_fkey`;

-- DropIndex
DROP INDEX `Article_displayId_key` ON `Article`;

-- AlterTable
ALTER TABLE `Article`
    ADD COLUMN `authorDisplayId` VARCHAR(191) NOT NULL,
    MODIFY `displayId` VARCHAR(191) NOT NULL;

-- UpdateTable
UPDATE `Article`
    SET `authorDisplayId` = (
      SELECT displayId
      FROM `User`
      WHERE `User`.id = `Article`.authorId
    );

ALTER TABLE `Article` DROP COLUMN `authorId`;

-- AlterTable
ALTER TABLE `User` MODIFY `displayId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Article_authorDisplayId_displayId_key` ON `Article`(`authorDisplayId`, `displayId`);

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_authorDisplayId_fkey` FOREIGN KEY (`authorDisplayId`) REFERENCES `User`(`displayId`) ON DELETE RESTRICT ON UPDATE CASCADE;
