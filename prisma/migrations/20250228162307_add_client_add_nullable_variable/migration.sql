-- DropIndex
DROP INDEX `client_phone_key` ON `client`;

-- AlterTable
ALTER TABLE `client` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `location` VARCHAR(191) NULL;
