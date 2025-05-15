/*
  Warnings:

  - A unique constraint covering the columns `[clientCode]` on the table `client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `client_clientCode_key` ON `client`(`clientCode`);
