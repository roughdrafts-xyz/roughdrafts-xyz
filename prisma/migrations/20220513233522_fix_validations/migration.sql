-- AlterTable
ALTER TABLE `Article` MODIFY `title` VARCHAR(280) NOT NULL,
    MODIFY `summary` VARCHAR(280) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `User` MODIFY `name` VARCHAR(280) NOT NULL DEFAULT 'Anonymous',
    MODIFY `summary` VARCHAR(280) NOT NULL DEFAULT 'This user has not set a summary.';
