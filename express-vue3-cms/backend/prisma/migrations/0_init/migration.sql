-- CreateTable
CREATE TABLE `cms_article` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cid` INTEGER UNSIGNED NOT NULL,
    `sub_cid` VARCHAR(255) NULL,
    `title` VARCHAR(255) NOT NULL,
    `short_title` VARCHAR(255) NULL,
    `tag_id` VARCHAR(255) NULL,
    `attr` TINYINT UNSIGNED NULL,
    `article_view` VARCHAR(100) NULL,
    `source` VARCHAR(255) NULL,
    `author` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `img` VARCHAR(255) NULL,
    `content` LONGTEXT NOT NULL,
    `status` TINYINT UNSIGNED NULL DEFAULT 0,
    `pv` INTEGER NULL DEFAULT 0,
    `link` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cid`(`cid`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_pv`(`pv`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_article_tag` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `aid` INTEGER UNSIGNED NULL,
    `tid` INTEGER UNSIGNED NULL,

    INDEX `idx_aid`(`aid`),
    INDEX `idx_tid`(`tid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_category` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(255) NULL,
    `seo_keywords` VARCHAR(255) NULL,
    `seo_description` VARCHAR(255) NULL,
    `name` VARCHAR(50) NOT NULL,
    `pinyin` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `type` TINYINT UNSIGNED NULL DEFAULT 0,
    `url` VARCHAR(255) NULL,
    `order_by` INTEGER NULL DEFAULT 0,
    `target` TINYINT UNSIGNED NULL DEFAULT 0,
    `status` TINYINT UNSIGNED NULL DEFAULT 0,
    `mid` INTEGER UNSIGNED NULL,
    `list_view` VARCHAR(100) NULL DEFAULT 'list.html',
    `article_view` VARCHAR(100) NULL DEFAULT 'article.html',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_path`(`path`),
    INDEX `idx_pinyin`(`pinyin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_field` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `mid` INTEGER UNSIGNED NULL,
    `cname` VARCHAR(60) NULL,
    `ename` VARCHAR(60) NULL DEFAULT '',
    `type` TINYINT UNSIGNED NULL,
    `val` VARCHAR(255) NULL,
    `default_val` VARCHAR(255) NULL,
    `order_by` INTEGER NULL DEFAULT 0,
    `length` VARCHAR(255) NULL,

    INDEX `idx_mid`(`mid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_frag` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL DEFAULT '',
    `remark` VARCHAR(50) NULL,
    `content` LONGTEXT NULL,
    `type` TINYINT UNSIGNED NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_friend_link` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `link` VARCHAR(255) NULL,
    `order_by` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_message` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` TINYINT UNSIGNED NULL,
    `title` VARCHAR(255) NULL,
    `name` VARCHAR(100) NULL,
    `phone_number` VARCHAR(50) NULL,
    `wechat` VARCHAR(50) NULL,
    `company_name` VARCHAR(100) NULL,
    `content` VARCHAR(500) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_model` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `model_name` VARCHAR(10) NULL,
    `table_name` VARCHAR(50) NULL,
    `status` TINYINT UNSIGNED NULL DEFAULT 1,
    `remark` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_site` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NULL,
    `logo` VARCHAR(500) NULL,
    `domain` VARCHAR(30) NULL,
    `email` VARCHAR(50) NULL,
    `wechat` VARCHAR(30) NULL,
    `icp` VARCHAR(100) NULL,
    `code` VARCHAR(255) NULL,
    `ext_config` TEXT NULL,
    `title` VARCHAR(50) NULL,
    `keywords` VARCHAR(100) NULL,
    `description` VARCHAR(255) NULL,
    `template` VARCHAR(50) NULL DEFAULT 'default',
    `upload_way` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_slide` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `img_url` VARCHAR(255) NULL,
    `link_url` VARCHAR(255) NULL,
    `remark` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_tag` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(10) NULL,
    `path` VARCHAR(255) NULL DEFAULT '',
    `ref_count` INTEGER NULL DEFAULT 0,

    INDEX `idx_path`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `extend_model_download` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `aid` INTEGER UNSIGNED NOT NULL,
    `file_name` VARCHAR(250) NULL DEFAULT '',
    `file_version` VARCHAR(255) NULL,
    `file_link` VARCHAR(250) NULL DEFAULT '',
    `test1` TEXT NULL,

    INDEX `idx_aid`(`aid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plus_collect` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `task_name` VARCHAR(255) NULL,
    `target_url` VARCHAR(255) NULL,
    `list_tag` VARCHAR(255) NULL,
    `start_num` INTEGER NULL DEFAULT 1,
    `end_num` INTEGER NULL,
    `increment` VARCHAR(255) NULL DEFAULT '1',
    `title_tag` VARCHAR(255) NULL,
    `article_tag` VARCHAR(255) NULL,
    `charset` TINYINT UNSIGNED NULL,
    `pages` TEXT NULL,
    `parse_data` TEXT NULL,
    `cid` INTEGER UNSIGNED NOT NULL,
    `status` TINYINT UNSIGNED NULL DEFAULT 1,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plus_gather` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `task_name` VARCHAR(255) NULL,
    `target_url` VARCHAR(255) NULL,
    `parse_data` TEXT NULL,
    `cid` INTEGER UNSIGNED NOT NULL,
    `status` TINYINT UNSIGNED NULL DEFAULT 1,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_config` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_code` VARCHAR(50) NOT NULL,
    `config_key` VARCHAR(100) NOT NULL,
    `config_value` TEXT NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `create_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `remark` VARCHAR(255) NULL,

    UNIQUE INDEX `uk_config_key`(`config_key`),
    INDEX `idx_type_code`(`type_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_config_type` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_code` VARCHAR(50) NOT NULL,
    `type_name` VARCHAR(50) NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `create_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_type_code`(`type_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_login_log` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` INTEGER UNSIGNED NOT NULL,
    `ip` VARCHAR(45) NULL,
    `country` VARCHAR(50) NULL,
    `province` VARCHAR(50) NULL,
    `city` VARCHAR(50) NULL,
    `district` VARCHAR(50) NULL,
    `isp` VARCHAR(50) NULL,
    `lat` VARCHAR(15) NULL,
    `lng` VARCHAR(15) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_uid_time`(`uid`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NULL DEFAULT 0,
    `title` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NULL DEFAULT '',
    `order_num` INTEGER NULL DEFAULT 0,
    `path` VARCHAR(200) NULL DEFAULT '',
    `component` VARCHAR(255) NULL,
    `icon` VARCHAR(100) NULL DEFAULT '',
    `query` VARCHAR(255) NULL,
    `permissions` VARCHAR(100) NULL DEFAULT '',
    `type` CHAR(1) NULL DEFAULT '',
    `is_frame` TINYINT UNSIGNED NULL DEFAULT 2,
    `is_cache` TINYINT UNSIGNED NULL DEFAULT 2,
    `is_show` TINYINT UNSIGNED NULL DEFAULT 1,
    `status` TINYINT UNSIGNED NULL,
    `create_by` VARCHAR(64) NULL DEFAULT '',
    `create_at` DATETIME(0) NULL,
    `update_by` VARCHAR(64) NULL DEFAULT '',
    `update_at` DATETIME(0) NULL,
    `remark` VARCHAR(500) NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_notice` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL,
    `type` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `content` LONGTEXT NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `remark` VARCHAR(255) NULL,
    `create_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `sort` INTEGER NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `del_flag` TINYINT UNSIGNED NULL DEFAULT 1,
    `create_by` VARCHAR(64) NULL DEFAULT '',
    `create_at` DATETIME(0) NULL,
    `update_by` VARCHAR(64) NULL DEFAULT '',
    `update_at` DATETIME(0) NULL,
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `role_id` INTEGER UNSIGNED NOT NULL,
    `menu_id` INTEGER UNSIGNED NOT NULL,

    INDEX `idx_menu_id`(`menu_id`),
    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL,
    `nickname` VARCHAR(30) NULL DEFAULT '',
    `password` VARCHAR(80) NULL DEFAULT '',
    `salt` VARCHAR(20) NULL DEFAULT '',
    `avatar` VARCHAR(100) NULL DEFAULT '',
    `gender` TINYINT UNSIGNED NULL DEFAULT 0,
    `email` VARCHAR(50) NULL DEFAULT '',
    `phone_number` VARCHAR(11) NULL DEFAULT '',
    `login_ip` VARCHAR(128) NULL DEFAULT '',
    `login_date` DATETIME(0) NULL,
    `create_by` VARCHAR(64) NULL DEFAULT '',
    `create_at` DATETIME(0) NULL,
    `update_by` VARCHAR(64) NULL DEFAULT '',
    `update_at` DATETIME(0) NULL,
    `pwd_update_date` DATETIME(0) NULL,
    `status` TINYINT UNSIGNED NULL DEFAULT 0,
    `remark` VARCHAR(500) NULL,

    UNIQUE INDEX `uk_username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `password` VARCHAR(100) NULL,
    `gender` TINYINT UNSIGNED NULL DEFAULT 0,
    `email` VARCHAR(255) NULL,
    `phone_number` VARCHAR(20) NULL DEFAULT '',
    `avatar` VARCHAR(255) NULL,
    `login_ip` VARCHAR(255) NULL,
    `login_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `pwd_update_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `remark` VARCHAR(255) NULL,

    UNIQUE INDEX `uk_username`(`username`),
    INDEX `idx_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_level` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `level_code` VARCHAR(20) NULL,
    `level_name` VARCHAR(50) NULL,
    `days_valid` INTEGER NULL,

    UNIQUE INDEX `uk_level_code`(`level_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_level_ship` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `level_id` INTEGER UNSIGNED NOT NULL,
    `start_date` DATETIME(0) NOT NULL,
    `end_date` DATETIME(0) NOT NULL,

    INDEX `idx_level_id`(`level_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_order` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `order_no` VARCHAR(50) NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `paid_at` DATETIME(0) NULL,

    UNIQUE INDEX `uk_order_no`(`order_no`),
    INDEX `idx_product_id`(`product_id`),
    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_product` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `level_id` INTEGER UNSIGNED NOT NULL,
    `duration_days` INTEGER NULL,
    `description` TEXT NULL,
    `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,

    INDEX `idx_level_id`(`level_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_reading_record` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `article_id` INTEGER UNSIGNED NOT NULL,
    `read_time` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_article_id`(`article_id`),
    INDEX `idx_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_social_login` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `platform` VARCHAR(20) NOT NULL,
    `openid` VARCHAR(255) NOT NULL,
    `unionid` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_id`(`user_id`),
    UNIQUE INDEX `uk_platform_openid`(`platform`, `openid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cms_article` ADD CONSTRAINT `fk_article_category` FOREIGN KEY (`cid`) REFERENCES `cms_category`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cms_article_tag` ADD CONSTRAINT `fk_article_tag_article` FOREIGN KEY (`aid`) REFERENCES `cms_article`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cms_article_tag` ADD CONSTRAINT `fk_article_tag_tag` FOREIGN KEY (`tid`) REFERENCES `cms_tag`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cms_field` ADD CONSTRAINT `fk_field_model` FOREIGN KEY (`mid`) REFERENCES `cms_model`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `extend_model_download` ADD CONSTRAINT `fk_download_article` FOREIGN KEY (`aid`) REFERENCES `cms_article`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `plus_collect` ADD CONSTRAINT `fk_collect_category` FOREIGN KEY (`cid`) REFERENCES `cms_category`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `plus_gather` ADD CONSTRAINT `fk_gather_category` FOREIGN KEY (`cid`) REFERENCES `cms_category`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sys_config` ADD CONSTRAINT `fk_config_type` FOREIGN KEY (`type_code`) REFERENCES `sys_config_type`(`type_code`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sys_login_log` ADD CONSTRAINT `fk_loginlog_user` FOREIGN KEY (`uid`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_level_ship` ADD CONSTRAINT `fk_levelship_level` FOREIGN KEY (`level_id`) REFERENCES `user_level`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_level_ship` ADD CONSTRAINT `fk_levelship_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_order` ADD CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `user_product`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_order` ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_product` ADD CONSTRAINT `fk_product_level` FOREIGN KEY (`level_id`) REFERENCES `user_level`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_reading_record` ADD CONSTRAINT `fk_reading_article` FOREIGN KEY (`article_id`) REFERENCES `cms_article`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_reading_record` ADD CONSTRAINT `fk_reading_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_social_login` ADD CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

