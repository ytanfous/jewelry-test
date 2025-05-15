-- AlterTable
ALTER TABLE `guarantee` ADD COLUMN `clientCode` VARCHAR(191) NULL,
    ADD COLUMN `clientid` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `guarantee` ADD CONSTRAINT `guarantee_clientid_fkey` FOREIGN KEY (`clientid`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
