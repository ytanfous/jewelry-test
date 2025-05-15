/*
  Warnings:

  - You are about to drop the column `amonut` on the `orderhistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orderhistory` DROP COLUMN `amonut`,
    ADD COLUMN `amount` VARCHAR(191) NULL;
