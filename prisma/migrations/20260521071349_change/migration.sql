/*
  Warnings:

  - You are about to drop the `PC` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `PC`;

-- CreateTable
CREATE TABLE `komputer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `room` TEXT NULL,
    `owner` VARCHAR(191) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
