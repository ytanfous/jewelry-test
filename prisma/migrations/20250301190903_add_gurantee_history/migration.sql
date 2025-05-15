-- CreateTable
CREATE TABLE `GuaranteeHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guaranteeId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuaranteeHistory` ADD CONSTRAINT `GuaranteeHistory_guaranteeId_fkey` FOREIGN KEY (`guaranteeId`) REFERENCES `guarantee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
