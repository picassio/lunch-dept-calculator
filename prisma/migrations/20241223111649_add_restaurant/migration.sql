-- CreateTable
CREATE TABLE `Restaurant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: Add restaurantId as nullable first
ALTER TABLE `MenuItem` ADD COLUMN `restaurantId` INTEGER NULL;

-- Create default restaurant
INSERT INTO `Restaurant` (`name`, `updatedAt`) VALUES ('Default Restaurant', NOW());

-- Update existing menu items to use default restaurant
UPDATE `MenuItem` SET `restaurantId` = (SELECT id FROM `Restaurant` LIMIT 1);

-- Make restaurantId required
ALTER TABLE `MenuItem` MODIFY `restaurantId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `MenuItem_restaurantId_idx` ON `MenuItem`(`restaurantId`);

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
