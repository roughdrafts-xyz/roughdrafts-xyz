-- CreateTable
CREATE TABLE `Article` (
    `id` VARCHAR(191) NOT NULL,
    `displayId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL DEFAULT '',
    `content` VARCHAR(191) NOT NULL,
    `rawContent` VARCHAR(191) NOT NULL,
    `visibility` VARCHAR(191) NOT NULL DEFAULT 'unlisted',
    `authorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Article_displayId_key`(`displayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `discordId` VARCHAR(191) NULL,
    `displayId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Anonymous',
    `summary` VARCHAR(191) NOT NULL DEFAULT 'This user has not set a summary.',

    UNIQUE INDEX `User_discordId_key`(`discordId`),
    UNIQUE INDEX `User_displayId_key`(`displayId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
