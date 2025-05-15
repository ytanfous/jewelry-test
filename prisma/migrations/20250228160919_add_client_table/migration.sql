-- AlterTable
ALTER TABLE `order` ADD COLUMN `clientCode` VARCHAR(191) NULL,
    ADD COLUMN `clientid` INTEGER NULL;

-- AlterTable
ALTER TABLE `saving` ADD COLUMN `clientCode` VARCHAR(191) NULL,
    ADD COLUMN `clientid` INTEGER NULL;

-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `clientCode` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `client_phone_key`(`phone`),
    UNIQUE INDEX `client_clientCode_key`(`clientCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userClientSequence` (
    `userId` INTEGER NOT NULL,
    `lastSeq` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_clientid_fkey` FOREIGN KEY (`clientid`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saving` ADD CONSTRAINT `saving_clientid_fkey` FOREIGN KEY (`clientid`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
