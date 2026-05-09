/*
  Warnings:

  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropTable
DROP TABLE `post`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `sys_user` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `dept_id` BIGINT NULL,
    `user_name` VARCHAR(30) NOT NULL,
    `nick_name` VARCHAR(30) NOT NULL,
    `user_type` VARCHAR(2) NOT NULL DEFAULT '00',
    `email` VARCHAR(50) NOT NULL DEFAULT '',
    `phone_number` VARCHAR(11) NOT NULL DEFAULT '',
    `sex` CHAR(1) NOT NULL DEFAULT '0',
    `avatar` VARCHAR(100) NOT NULL DEFAULT '',
    `password` VARCHAR(100) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `login_ip` VARCHAR(128) NOT NULL DEFAULT '',
    `login_date` DATETIME(3) NULL,
    `pwd_update_date` DATETIME(3) NULL,
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(3) NULL,
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(3) NULL,
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `role_id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(30) NOT NULL,
    `role_key` VARCHAR(100) NOT NULL,
    `role_sort` INTEGER NOT NULL,
    `data_scope` CHAR(1) NOT NULL DEFAULT '1',
    `menu_check_strictly` BOOLEAN NOT NULL DEFAULT true,
    `dept_check_strictly` BOOLEAN NOT NULL DEFAULT true,
    `status` CHAR(1) NOT NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(3) NULL,
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(3) NULL,
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `menu_id` BIGINT NOT NULL AUTO_INCREMENT,
    `menu_name` VARCHAR(50) NOT NULL,
    `parent_id` BIGINT NULL DEFAULT 0,
    `order_num` INTEGER NULL DEFAULT 0,
    `path` VARCHAR(200) NULL DEFAULT '',
    `component` VARCHAR(255) NULL,
    `query` VARCHAR(255) NULL,
    `route_name` VARCHAR(50) NULL DEFAULT '',
    `is_frame` INTEGER NULL DEFAULT 1,
    `is_cache` INTEGER NULL DEFAULT 0,
    `menu_type` CHAR(1) NULL DEFAULT '',
    `visible` CHAR(1) NULL DEFAULT '0',
    `status` CHAR(1) NULL DEFAULT '0',
    `perms` VARCHAR(100) NULL,
    `icon` VARCHAR(100) NULL DEFAULT '#',
    `create_by` VARCHAR(64) NULL DEFAULT '',
    `create_time` DATETIME(3) NULL,
    `update_by` VARCHAR(64) NULL DEFAULT '',
    `update_time` DATETIME(3) NULL,
    `remark` VARCHAR(500) NULL DEFAULT '',

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `role_id` BIGINT NOT NULL,
    `menu_id` BIGINT NOT NULL,

    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
