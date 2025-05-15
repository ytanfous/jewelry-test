-- DropForeignKey
ALTER TABLE `savinghistory` DROP FOREIGN KEY `savinghistory_savingId_fkey`;

-- DropIndex
DROP INDEX `savinghistory_savingId_fkey` ON `savinghistory`;

-- AddForeignKey
ALTER TABLE `savinghistory` ADD CONSTRAINT `savinghistory_savingId_fkey` FOREIGN KEY (`savingId`) REFERENCES `saving`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
