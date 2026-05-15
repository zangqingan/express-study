-- ============================================================
-- 内容管理系统（CMS） 数据库完整初始化脚本
-- 数据库名: common_cms
-- 字符集: utf8mb4 / utf8mb4_unicode_ci
-- 引擎: InnoDB
-- 版本: MySQL 8.0+
-- 总表数: 30
-- 生成日期: 2026-05-13
-- ============================================================

-- ----------------------------
-- 1. 建库语句
-- ----------------------------
DROP DATABASE IF EXISTS `common_cms`;
CREATE DATABASE `common_cms`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `common_cms`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 一、CMS核心模块 (12 张表)
-- ============================================================

-- ----------------------------
-- 1. cms_site — 站点信息表
-- ----------------------------
DROP TABLE IF EXISTS `cms_site`;
CREATE TABLE `cms_site` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '站点ID',
  `name`          VARCHAR(20)      DEFAULT NULL         COMMENT '网站名称',
  `logo`          VARCHAR(500)     DEFAULT NULL         COMMENT '网站Logo路径',
  `domain`        VARCHAR(30)      DEFAULT NULL         COMMENT '网站域名',
  `email`         VARCHAR(50)      DEFAULT NULL         COMMENT '联系邮箱',
  `wechat`        VARCHAR(30)      DEFAULT NULL         COMMENT '微信号',
  `icp`           VARCHAR(100)     DEFAULT NULL         COMMENT 'ICP备案号',
  `code`          VARCHAR(255)     DEFAULT NULL         COMMENT '站点统计代码（如百度统计）',
  `ext_config`    TEXT             DEFAULT NULL         COMMENT '万能配置（JSON格式扩展字段）',
  `title`         VARCHAR(50)      DEFAULT NULL         COMMENT 'SEO标题（页面默认）',
  `keywords`      VARCHAR(100)     DEFAULT NULL         COMMENT 'SEO关键词（页面默认）',
  `description`   VARCHAR(255)     DEFAULT NULL         COMMENT 'SEO描述（页面默认）',
  `template`      VARCHAR(50)      DEFAULT 'default'    COMMENT '模板名称',
  `upload_way`    TINYINT UNSIGNED NOT NULL DEFAULT 1    COMMENT '上传方式(1-普通、2-七牛云)',
  `created_at`    DATETIME         DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    DATETIME         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站信息';

-- ----------------------------
-- 2. cms_category — 栏目分类表（树形结构）
-- ----------------------------
DROP TABLE IF EXISTS `cms_category`;
CREATE TABLE `cms_category` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT          COMMENT '栏目ID',
  `parent_id`       INT UNSIGNED    NOT NULL DEFAULT 0               COMMENT '父级栏目ID，0表示顶级',
  `seo_title`       VARCHAR(255)    DEFAULT NULL                     COMMENT 'SEO标题',
  `seo_keywords`    VARCHAR(255)    DEFAULT NULL                     COMMENT 'SEO关键字',
  `seo_description` VARCHAR(255)    DEFAULT NULL                     COMMENT 'SEO描述',
  `name`            VARCHAR(50)     NOT NULL                         COMMENT '栏目名称',
  `pinyin`          VARCHAR(255)    NOT NULL                         COMMENT '栏目标识（拼音）',
  `path`            VARCHAR(255)    NOT NULL                         COMMENT '栏目路径',
  `description`     VARCHAR(255)    NOT NULL                         COMMENT '栏目描述',
  `type`            TINYINT UNSIGNED DEFAULT 0                       COMMENT '栏目类型（0-栏目、1-页面）',
  `url`             VARCHAR(255)    DEFAULT NULL                     COMMENT '外部链接',
  `order_by`        INT             DEFAULT 0                        COMMENT '排序',
  `target`          TINYINT UNSIGNED DEFAULT 0                       COMMENT '打开方式（0-当前页、1-新窗口）',
  `status`          TINYINT UNSIGNED DEFAULT 0                       COMMENT '显示状态（0-显示、1-隐藏）',
  `mid`             INT UNSIGNED    DEFAULT NULL                     COMMENT '关联模型ID → cms_model.id',
  `list_view`       VARCHAR(100)    DEFAULT 'list.html'              COMMENT '列表页模板文件名',
  `article_view`    VARCHAR(100)    DEFAULT 'article.html'           COMMENT '详情页模板文件名',
  `created_at`      DATETIME        DEFAULT CURRENT_TIMESTAMP        COMMENT '创建时间',
  `updated_at`      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_pinyin`(`pinyin`) USING BTREE,
  INDEX `idx_path`(`path`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站栏目';

-- ----------------------------
-- 3. cms_article — 文章表
-- ----------------------------
DROP TABLE IF EXISTS `cms_article`;
CREATE TABLE `cms_article` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT              COMMENT '文章ID',
  `cid`           INT UNSIGNED    NOT NULL                             COMMENT '所属栏目ID → cms_category.id',
  `sub_cid`       VARCHAR(255)    DEFAULT NULL                         COMMENT '其他关联栏目ID（逗号分隔）',
  `title`         VARCHAR(255)    NOT NULL                             COMMENT '文章标题',
  `short_title`   VARCHAR(255)    DEFAULT NULL                         COMMENT '短标题',
  `tag_id`        VARCHAR(255)    DEFAULT NULL                         COMMENT '标签ID字符串（逗号分隔）',
  `attr`          TINYINT UNSIGNED DEFAULT NULL                        COMMENT '属性(1-头条、2-推荐、3-轮播、4-热门)',
  `article_view`  VARCHAR(100)    DEFAULT NULL                         COMMENT '文章详情页模板',
  `source`        VARCHAR(255)    DEFAULT NULL                         COMMENT '来源',
  `author`        VARCHAR(255)    DEFAULT NULL                         COMMENT '作者',
  `description`   VARCHAR(255)    DEFAULT NULL                         COMMENT '文章简述/摘要',
  `img`           VARCHAR(255)    DEFAULT NULL                         COMMENT '缩略图URL',
  `content`       LONGTEXT        NOT NULL                             COMMENT '文章内容/正文（HTML）',
  `status`        TINYINT UNSIGNED DEFAULT 0                           COMMENT '文章发布状态（0-发布、1-不发布）',
  `pv`            INT             DEFAULT 0                            COMMENT '浏览量',
  `link`          VARCHAR(255)    DEFAULT NULL                         COMMENT '外部链接',
  `created_at`    DATETIME        DEFAULT CURRENT_TIMESTAMP            COMMENT '创建时间',
  `updated_at`    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cid`(`cid`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_pv`(`pv`) USING BTREE,
  CONSTRAINT `fk_article_category` FOREIGN KEY (`cid`) REFERENCES `cms_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ----------------------------
-- 4. cms_tag — 标签表
-- ----------------------------
DROP TABLE IF EXISTS `cms_tag`;
CREATE TABLE `cms_tag` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '标签ID',
  `name`      VARCHAR(10)  DEFAULT NULL              COMMENT '标签名称',
  `path`      VARCHAR(255) DEFAULT ''                COMMENT '标签标识（URL路径）',
  `ref_count` INT          DEFAULT 0                 COMMENT '引用次数（冗余计数器）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_path`(`path`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签';

-- ----------------------------
-- 5. cms_article_tag — 文章-标签中间表
-- ----------------------------
DROP TABLE IF EXISTS `cms_article_tag`;
CREATE TABLE `cms_article_tag` (
  `id`  INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '关联ID',
  `aid` INT UNSIGNED DEFAULT NULL             COMMENT '文章ID → cms_article.id',
  `tid` INT UNSIGNED DEFAULT NULL             COMMENT '标签ID → cms_tag.id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_aid`(`aid`) USING BTREE,
  INDEX `idx_tid`(`tid`) USING BTREE,
  CONSTRAINT `fk_article_tag_article` FOREIGN KEY (`aid`) REFERENCES `cms_article` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_article_tag_tag`     FOREIGN KEY (`tid`) REFERENCES `cms_tag` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章-标签关联表';

-- ----------------------------
-- 6. cms_slide — 轮播图表
-- ----------------------------
DROP TABLE IF EXISTS `cms_slide`;
CREATE TABLE `cms_slide` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '轮播ID',
  `title`      VARCHAR(255) DEFAULT NULL              COMMENT '轮播标题',
  `img_url`    VARCHAR(255) DEFAULT NULL              COMMENT '轮播图URL',
  `link_url`   VARCHAR(255) DEFAULT NULL              COMMENT '点击链接地址',
  `remark`     VARCHAR(255) DEFAULT NULL              COMMENT '备注',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图';

-- ----------------------------
-- 7. cms_frag — 碎片管理表
-- ----------------------------
DROP TABLE IF EXISTS `cms_frag`;
CREATE TABLE `cms_frag` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '碎片ID',
  `name`       VARCHAR(50)     DEFAULT ''               COMMENT '碎片名称（管理后台用）',
  `remark`     VARCHAR(50)     DEFAULT NULL             COMMENT '碎片标识（代码调用用）',
  `content`    LONGTEXT        DEFAULT NULL             COMMENT '内容',
  `type`       TINYINT UNSIGNED DEFAULT NULL            COMMENT '类型(1-富文本、2-文本框)',
  `created_at` DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='碎片';

-- ----------------------------
-- 8. cms_friend_link — 友情链接表
-- ----------------------------
DROP TABLE IF EXISTS `cms_friend_link`;
CREATE TABLE `cms_friend_link` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '链接ID',
  `title`      VARCHAR(255) DEFAULT NULL              COMMENT '链接名称',
  `link`       VARCHAR(255) DEFAULT NULL              COMMENT '链接地址',
  `order_by`   INT          DEFAULT 0                 COMMENT '排序',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='友情链接';

-- ----------------------------
-- 9. cms_message — 留言表
-- ----------------------------
DROP TABLE IF EXISTS `cms_message`;
CREATE TABLE `cms_message` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '留言ID',
  `type`         TINYINT UNSIGNED DEFAULT NULL            COMMENT '留言分类（1-咨询、2-建议、3-投诉、4-其它）',
  `title`        VARCHAR(255)    DEFAULT NULL             COMMENT '留言标题',
  `name`         VARCHAR(100)    DEFAULT NULL             COMMENT '姓名',
  `phone_number` VARCHAR(50)     DEFAULT NULL             COMMENT '电话号码',
  `wechat`       VARCHAR(50)     DEFAULT NULL             COMMENT '微信',
  `company_name` VARCHAR(100)    DEFAULT NULL             COMMENT '公司名称',
  `content`      VARCHAR(500)    DEFAULT NULL             COMMENT '留言内容',
  `created_at`   DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`   DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言';

-- ----------------------------
-- 10. cms_model — 模型字典表
-- ----------------------------
DROP TABLE IF EXISTS `cms_model`;
CREATE TABLE `cms_model` (
  `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '模型ID',
  `model_name` VARCHAR(10)     DEFAULT NULL             COMMENT '模型名称',
  `table_name` VARCHAR(50)     DEFAULT NULL             COMMENT '对应数据库表名',
  `status`     TINYINT UNSIGNED DEFAULT '1'             COMMENT '1-开启、0-关闭',
  `remark`     VARCHAR(50)     DEFAULT NULL             COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型字典';

-- ----------------------------
-- 11. cms_field — 模型字段表
-- ----------------------------
DROP TABLE IF EXISTS `cms_field`;
CREATE TABLE `cms_field` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '字段ID',
  `mid`         INT UNSIGNED    DEFAULT NULL             COMMENT '所属模型ID → cms_model.id',
  `cname`       VARCHAR(60)     DEFAULT NULL             COMMENT '字段中文名',
  `ename`       VARCHAR(60)     DEFAULT ''               COMMENT '字段英文名（对应数据表列名）',
  `type`        TINYINT UNSIGNED DEFAULT NULL            COMMENT '表单类型(1-单行、2-多行、3-下拉、4-单选、5-多选、6-日期、7-数字)',
  `val`         VARCHAR(255)    DEFAULT NULL             COMMENT '字段配置（下拉/单选/多选的选项JSON）',
  `default_val` VARCHAR(255)    DEFAULT NULL             COMMENT '默认值',
  `order_by`    INT             DEFAULT 0                COMMENT '排序',
  `length`      VARCHAR(255)    DEFAULT NULL             COMMENT '字段长度',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_mid`(`mid`) USING BTREE,
  CONSTRAINT `fk_field_model` FOREIGN KEY (`mid`) REFERENCES `cms_model` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字段字典';

-- ----------------------------
-- 12. extend_model_download — 下载模型扩展表
-- ----------------------------
DROP TABLE IF EXISTS `extend_model_download`;
CREATE TABLE `extend_model_download` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `aid`          INT UNSIGNED NOT NULL                  COMMENT '关联文章ID → cms_article.id',
  `file_name`    VARCHAR(250) DEFAULT ''               COMMENT '文件名称',
  `file_version` VARCHAR(255) DEFAULT NULL             COMMENT '文件版本',
  `file_link`    VARCHAR(250) DEFAULT ''               COMMENT '文件链接',
  `test1`        TEXT         DEFAULT NULL             COMMENT '测试字段（示例单选）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_aid`(`aid`) USING BTREE,
  CONSTRAINT `fk_download_article` FOREIGN KEY (`aid`) REFERENCES `cms_article` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载模型扩展表';

-- ============================================================
-- 二、内容采集模块 (2 张表)
-- ============================================================

-- ----------------------------
-- 13. plus_collect — 页面采集（爬虫）规则表
-- ----------------------------
DROP TABLE IF EXISTS `plus_collect`;
CREATE TABLE `plus_collect` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '任务ID',
  `task_name`   VARCHAR(255)    DEFAULT NULL             COMMENT '任务名称',
  `target_url`  VARCHAR(255)    DEFAULT NULL             COMMENT '采集目标地址',
  `list_tag`    VARCHAR(255)    DEFAULT NULL             COMMENT '列表选择器（CSS选择器）',
  `start_num`   INT             DEFAULT 1                COMMENT '开始页码',
  `end_num`     INT             DEFAULT NULL             COMMENT '结束页码',
  `increment`   VARCHAR(255)    DEFAULT '1'              COMMENT '页码增量',
  `title_tag`   VARCHAR(255)    DEFAULT NULL             COMMENT '标题标签',
  `article_tag` VARCHAR(255)    DEFAULT NULL             COMMENT '文章内容选择器',
  `charset`     TINYINT UNSIGNED DEFAULT NULL            COMMENT '编码(1-utf-8、2-gb2312)',
  `pages`       TEXT            DEFAULT NULL             COMMENT '指定采集地址URL集合（JSON数组）',
  `parse_data`  TEXT            DEFAULT NULL             COMMENT '数据格式化函数代码（JavaScript）',
  `cid`         INT UNSIGNED    NOT NULL                  COMMENT '文章存入目标栏目ID → cms_category.id',
  `status`      TINYINT UNSIGNED DEFAULT '1'             COMMENT '发布状态（1-草稿、2-发布）',
  `created_at`  DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cid`(`cid`) USING BTREE,
  CONSTRAINT `fk_collect_category` FOREIGN KEY (`cid`) REFERENCES `cms_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面采集';

-- ----------------------------
-- 14. plus_gather — 接口采集规则表
-- ----------------------------
DROP TABLE IF EXISTS `plus_gather`;
CREATE TABLE `plus_gather` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '任务ID',
  `task_name`   VARCHAR(255)    DEFAULT NULL             COMMENT '任务名称',
  `target_url`  VARCHAR(255)    DEFAULT NULL             COMMENT 'API接口地址',
  `parse_data`  TEXT            DEFAULT NULL             COMMENT '数据转换解析脚本（JavaScript代码）',
  `cid`         INT UNSIGNED    NOT NULL                  COMMENT '文章存入目标栏目ID → cms_category.id',
  `status`      TINYINT UNSIGNED DEFAULT '1'             COMMENT '发布状态（1-草稿、2-发布）',
  `created_at`  DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cid`(`cid`) USING BTREE,
  CONSTRAINT `fk_gather_category` FOREIGN KEY (`cid`) REFERENCES `cms_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='接口采集';

-- ============================================================
-- 三、RBAC 权限系统模块 (5 张表)
-- ============================================================

-- ----------------------------
-- 15. sys_user — 系统用户表
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id`              INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  `username`        VARCHAR(30)     NOT NULL                 COMMENT '登录账号',
  `nickname`        VARCHAR(30)     DEFAULT ''               COMMENT '昵称',
  `password`        VARCHAR(80)     DEFAULT ''               COMMENT '加密密码',
  `salt`            VARCHAR(20)     DEFAULT ''               COMMENT '盐值',
  `avatar`          VARCHAR(100)    DEFAULT ''               COMMENT '头像路径',
  `gender`          TINYINT UNSIGNED DEFAULT '0'             COMMENT '性别（0-男、1-女、2-未知）',
  `email`           VARCHAR(50)     DEFAULT ''               COMMENT '邮箱',
  `phone_number`    VARCHAR(11)     DEFAULT ''               COMMENT '手机号',
  `login_ip`        VARCHAR(128)    DEFAULT ''               COMMENT '最后登录IP',
  `login_date`      DATETIME        DEFAULT NULL             COMMENT '最后登录时间',
  `create_by`       VARCHAR(64)     DEFAULT ''               COMMENT '创建者',
  `create_at`       DATETIME        DEFAULT NULL             COMMENT '创建时间',
  `update_by`       VARCHAR(64)     DEFAULT ''               COMMENT '更新者',
  `update_at`       DATETIME        DEFAULT NULL             COMMENT '更新时间',
  `pwd_update_date` DATETIME        DEFAULT NULL             COMMENT '密码最后修改时间',
  `status`          TINYINT UNSIGNED DEFAULT '0'             COMMENT '账号状态（0-正常、1-停用）',
  `remark`          VARCHAR(500)    DEFAULT NULL             COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- ----------------------------
-- 16. sys_role — 角色表
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '角色ID',
  `name`      VARCHAR(30)     NOT NULL                 COMMENT '角色名称',
  `key`       VARCHAR(100)    NOT NULL                 COMMENT '角色权限字符串（super/admin/visitor）',
  `sort`      INT             NOT NULL                 COMMENT '显示顺序',
  `status`    TINYINT UNSIGNED NOT NULL DEFAULT '1'    COMMENT '状态(1-正常、2-停用)',
  `del_flag`  TINYINT UNSIGNED DEFAULT '1'             COMMENT '删除标志(1-存在、2-删除)',
  `create_by` VARCHAR(64)     DEFAULT ''               COMMENT '创建者',
  `create_at` DATETIME        DEFAULT NULL             COMMENT '创建时间',
  `update_by` VARCHAR(64)     DEFAULT ''               COMMENT '更新者',
  `update_at` DATETIME        DEFAULT NULL             COMMENT '更新时间',
  `remark`    VARCHAR(500)    DEFAULT NULL             COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色信息表';

-- ----------------------------
-- 17. sys_menu — 菜单权限表（树形结构）
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '菜单ID',
  `pid`         INT             DEFAULT 0                COMMENT '父菜单ID，0为顶级',
  `title`       VARCHAR(50)     NOT NULL                 COMMENT '菜单名称',
  `name`        VARCHAR(50)     DEFAULT ''               COMMENT '路由名称（Vue Router name）',
  `order_num`   INT             DEFAULT 0                COMMENT '显示顺序',
  `path`        VARCHAR(200)    DEFAULT ''               COMMENT '路由地址',
  `component`   VARCHAR(255)    DEFAULT NULL             COMMENT '前端组件路径',
  `icon`        VARCHAR(100)    DEFAULT ''               COMMENT '菜单图标',
  `query`       VARCHAR(255)    DEFAULT NULL             COMMENT '路由参数',
  `permissions` VARCHAR(100)    DEFAULT ''               COMMENT '权限标识',
  `type`        CHAR(1)         DEFAULT ''               COMMENT '菜单类型（M-目录、C-菜单、F-按钮）',
  `is_frame`    TINYINT UNSIGNED DEFAULT '2'             COMMENT '是否外链(1-是、2-否)',
  `is_cache`    TINYINT UNSIGNED DEFAULT '2'             COMMENT '是否缓存(1-缓存、2-不缓存)',
  `is_show`     TINYINT UNSIGNED DEFAULT '1'             COMMENT '是否显示(1-显示、2-隐藏)',
  `status`      TINYINT UNSIGNED DEFAULT NULL            COMMENT '状态(1-启用、2-停用)',
  `create_by`   VARCHAR(64)     DEFAULT ''               COMMENT '创建者',
  `create_at`   DATETIME        DEFAULT NULL             COMMENT '创建时间',
  `update_by`   VARCHAR(64)     DEFAULT ''               COMMENT '更新者',
  `update_at`   DATETIME        DEFAULT NULL             COMMENT '更新时间',
  `remark`      VARCHAR(500)    DEFAULT ''               COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

-- ----------------------------
-- 18. sys_user_role — 用户-角色关联表
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` INT UNSIGNED NOT NULL  COMMENT '用户ID → sys_user.id',
  `role_id` INT UNSIGNED NOT NULL  COMMENT '角色ID → sys_role.id',
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户和角色关联表';

-- ----------------------------
-- 19. sys_role_menu — 角色-菜单关联表
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` INT UNSIGNED NOT NULL  COMMENT '角色ID → sys_role.id',
  `menu_id` INT UNSIGNED NOT NULL  COMMENT '菜单ID → sys_menu.id',
  PRIMARY KEY (`role_id`, `menu_id`) USING BTREE,
  INDEX `idx_menu_id`(`menu_id`) USING BTREE,
  CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和菜单关联表';

-- ============================================================
-- 四、审计日志模块 (2 张表)
-- ============================================================

-- ----------------------------
-- 20. sys_login_log — 登录日志表
-- ----------------------------
DROP TABLE IF EXISTS `sys_login_log`;
CREATE TABLE `sys_login_log` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '日志ID',
  `uid`        INT UNSIGNED NOT NULL                  COMMENT '用户ID → sys_user.id',
  `ip`         VARCHAR(45)  DEFAULT NULL              COMMENT '登录IP地址',
  `country`    VARCHAR(50)  DEFAULT NULL              COMMENT '国家',
  `province`   VARCHAR(50)  DEFAULT NULL              COMMENT '省份',
  `city`       VARCHAR(50)  DEFAULT NULL              COMMENT '城市',
  `district`   VARCHAR(50)  DEFAULT NULL              COMMENT '区县',
  `isp`        VARCHAR(50)  DEFAULT NULL              COMMENT '网络运营商',
  `lat`        VARCHAR(15)  DEFAULT NULL              COMMENT '纬度',
  `lng`        VARCHAR(15)  DEFAULT NULL              COMMENT '经度',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_uid_time`(`uid`, `created_at`) USING BTREE,
  CONSTRAINT `fk_loginlog_user` FOREIGN KEY (`uid`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志';

-- ----------------------------
-- 21. sys_notice — 通知公告表
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice`;
CREATE TABLE `sys_notice` (
  `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '公告ID',
  `title`     VARCHAR(50)     NOT NULL                 COMMENT '公告标题',
  `type`      TINYINT UNSIGNED NOT NULL DEFAULT 1       COMMENT '类型(1-通知、2-公告)',
  `content`   LONGTEXT        NOT NULL                 COMMENT '公告内容',
  `status`    TINYINT UNSIGNED NOT NULL DEFAULT 1       COMMENT '状态(0-关闭、1-正常)',
  `remark`    VARCHAR(255)    DEFAULT NULL             COMMENT '备注',
  `create_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知公告表';

-- ============================================================
-- 五、系统配置模块 (2 张表)
-- ============================================================

-- ----------------------------
-- 22. sys_config_type — 配置类型字典表
-- ----------------------------
DROP TABLE IF EXISTS `sys_config_type`;
CREATE TABLE `sys_config_type` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `type_code` VARCHAR(50)  NOT NULL                 COMMENT '类型标识（如 wechat_minip、qiniu_oss）',
  `type_name` VARCHAR(50)  NOT NULL                 COMMENT '类型名称',
  `status`    TINYINT UNSIGNED NOT NULL DEFAULT 1    COMMENT '是否启用(1-启用、2-停用)',
  `remark`    VARCHAR(255) DEFAULT NULL             COMMENT '备注',
  `create_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_code`(`type_code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配置类型表';

-- ----------------------------
-- 23. sys_config — 系统配置项表
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  `type_code`    VARCHAR(50)  NOT NULL                 COMMENT '配置类型标识 → sys_config_type.type_code',
  `config_key`   VARCHAR(100) NOT NULL                 COMMENT '配置键',
  `config_value` TEXT         NOT NULL                 COMMENT '配置值',
  `status`       TINYINT UNSIGNED NOT NULL DEFAULT '1' COMMENT '状态(1-启用、2-关闭)',
  `create_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark`       VARCHAR(255) DEFAULT NULL             COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_key`(`config_key`) USING BTREE,
  INDEX `idx_type_code`(`type_code`) USING BTREE,
  CONSTRAINT `fk_config_type` FOREIGN KEY (`type_code`) REFERENCES `sys_config_type` (`type_code`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================================
-- 六、会员系统模块 (7 张表)
-- ============================================================

-- ----------------------------
-- 24. user — 会员表（C端用户）
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '用户ID',
  `username`        VARCHAR(50)  DEFAULT NULL             COMMENT '用户名',
  `password`        VARCHAR(100) DEFAULT NULL             COMMENT '密码',
  `gender`          TINYINT UNSIGNED DEFAULT '0'          COMMENT '性别(0-未知、1-男、2-女)',
  `email`           VARCHAR(255) DEFAULT NULL             COMMENT '邮箱',
  `phone_number`    VARCHAR(20)  DEFAULT ''               COMMENT '手机号',
  `avatar`          VARCHAR(255) DEFAULT NULL             COMMENT '头像',
  `login_ip`        VARCHAR(255) DEFAULT NULL             COMMENT '登录IP',
  `login_date`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后登录时间',
  `pwd_update_date` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '密码最后修改时间',
  `created_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '注册日期',
  `updated_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark`          VARCHAR(255) DEFAULT NULL             COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE,
  INDEX `idx_email`(`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表(核心)';

-- ----------------------------
-- 25. user_level — 会员等级表
-- ----------------------------
DROP TABLE IF EXISTS `user_level`;
CREATE TABLE `user_level` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '等级ID',
  `level_code` VARCHAR(20)  DEFAULT NULL             COMMENT '等级代码(super0-注册、super1-月、super2-季、super3-年、super9-永久)',
  `level_name` VARCHAR(50)  DEFAULT NULL             COMMENT '等级显示名称',
  `days_valid` INT          DEFAULT NULL             COMMENT '有效天数(NULL表示永久)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_level_code`(`level_code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级';

-- ----------------------------
-- 26. user_level_ship — 会员-等级关联表
-- ----------------------------
DROP TABLE IF EXISTS `user_level_ship`;
CREATE TABLE `user_level_ship` (
  `user_id`    INT UNSIGNED NOT NULL  COMMENT '用户ID → user.id',
  `level_id`   INT UNSIGNED NOT NULL  COMMENT '等级ID → user_level.id',
  `start_date` DATETIME     NOT NULL  COMMENT '开始日期',
  `end_date`   DATETIME     NOT NULL  COMMENT '结束日期',
  PRIMARY KEY (`user_id`) USING BTREE,
  INDEX `idx_level_id`(`level_id`) USING BTREE,
  CONSTRAINT `fk_levelship_user`  FOREIGN KEY (`user_id`)  REFERENCES `user` (`id`)       ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_levelship_level` FOREIGN KEY (`level_id`) REFERENCES `user_level` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级关系(核心)';

-- ----------------------------
-- 27. user_product — 会员产品表
-- ----------------------------
DROP TABLE IF EXISTS `user_product`;
CREATE TABLE `user_product` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '产品ID',
  `name`          VARCHAR(50)     NOT NULL                 COMMENT '产品名称',
  `price`         DECIMAL(10,2)   NOT NULL                 COMMENT '价格',
  `level_id`      INT UNSIGNED    NOT NULL                 COMMENT '关联等级ID → user_level.id',
  `duration_days` INT             DEFAULT NULL             COMMENT '有效天数',
  `description`   TEXT            DEFAULT NULL             COMMENT '产品描述',
  `status`        TINYINT UNSIGNED NOT NULL DEFAULT 1       COMMENT '状态(1-启用、2-停用)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_level_id`(`level_id`) USING BTREE,
  CONSTRAINT `fk_product_level` FOREIGN KEY (`level_id`) REFERENCES `user_level` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- ----------------------------
-- 28. user_order — 订单表
-- ----------------------------
DROP TABLE IF EXISTS `user_order`;
CREATE TABLE `user_order` (
  `id`             INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '订单ID',
  `user_id`        INT UNSIGNED    NOT NULL                 COMMENT '用户ID → user.id',
  `order_no`       VARCHAR(50)     NOT NULL                 COMMENT '订单号',
  `product_id`     INT UNSIGNED    NOT NULL                 COMMENT '产品ID → user_product.id',
  `amount`         DECIMAL(10,2)   NOT NULL                 COMMENT '金额',
  `payment_method` TINYINT UNSIGNED NOT NULL DEFAULT 1       COMMENT '支付方式(1-支付宝、2-微信)',
  `status`         TINYINT UNSIGNED NOT NULL DEFAULT 1       COMMENT '订单状态(1-待支付、2-已支付、3-已过期、4-已退款)',
  `created_at`     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `paid_at`        DATETIME        DEFAULT NULL             COMMENT '支付时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_product_id`(`product_id`) USING BTREE,
  CONSTRAINT `fk_order_user`    FOREIGN KEY (`user_id`)    REFERENCES `user` (`id`)         ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `user_product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ----------------------------
-- 29. user_reading_record — 阅读记录表
-- ----------------------------
DROP TABLE IF EXISTS `user_reading_record`;
CREATE TABLE `user_reading_record` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`    INT UNSIGNED NOT NULL                  COMMENT '用户ID → user.id',
  `article_id` INT UNSIGNED NOT NULL                  COMMENT '文章ID → cms_article.id',
  `read_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_article_id`(`article_id`) USING BTREE,
  CONSTRAINT `fk_reading_user`    FOREIGN KEY (`user_id`)    REFERENCES `user` (`id`)        ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_reading_article` FOREIGN KEY (`article_id`) REFERENCES `cms_article` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='阅读记录表';

-- ----------------------------
-- 30. user_social_login — 第三方登录表
-- ----------------------------
DROP TABLE IF EXISTS `user_social_login`;
CREATE TABLE `user_social_login` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
  `user_id`    INT UNSIGNED NOT NULL                  COMMENT '用户ID → user.id',
  `platform`   VARCHAR(20)  NOT NULL                  COMMENT '平台(wechat/qq)',
  `openid`     VARCHAR(255) NOT NULL                  COMMENT '平台openid',
  `unionid`    VARCHAR(255) DEFAULT NULL              COMMENT '微信UnionID（跨应用）',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_platform_openid`(`platform`, `openid`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三方登录';

-- ============================================================
-- 初始化测试数据
-- ============================================================

-- ----------------------------
-- cms_site 测试数据
-- ----------------------------
INSERT INTO `cms_site` VALUES (1, 'commonCMS', '/public/template/default/2025/05/29/1748449231136_source_logo.png', 'www.commoncms.top', '867528315@qq.com', NULL, '皖ICP备2024030927号-1', '', '', 'commonCMS', 'commonCMS', 'commonCMS是一款基于Express和MySQL研发的高质量实用型CMS管理系统。它具备多种类型网站开发，易扩展、基于模块化和插件化开发模式，适用于商用企业级程序开发。', 'default', 1, '2025-05-29 00:20:38', '2025-05-29 00:20:38');

-- ----------------------------
-- cms_category 测试数据
-- ----------------------------
INSERT INTO `cms_category` VALUES (1, 0, '', '', '', '首页', 'home', '/home', '', 1, '', 0, 0, 0, NULL, 'index.html', 'article.html', '2024-09-13 22:38:12', '2024-09-17 15:47:29');
INSERT INTO `cms_category` VALUES (2, 0, '', '', '', '文章', 'art3', '/art3', '', 0, '', 0, 0, 0, NULL, 'list.html', 'article.html', '2024-09-13 22:38:12', '2024-12-06 00:13:05');
INSERT INTO `cms_category` VALUES (3, 0, '', '', '', '图片', 'pics', '/pics', '', 0, '', 0, 0, 0, NULL, 'list-img.html', 'article-img.html', '2024-09-13 22:39:02', '2024-09-17 10:26:10');
INSERT INTO `cms_category` VALUES (4, 0, '', '', '', '视频', 'video', '/video', '', 0, '', 0, 0, 0, NULL, 'list.html', 'article.html', '2024-09-13 22:39:22', '2024-09-13 22:39:22');
INSERT INTO `cms_category` VALUES (5, 0, '', '', '', '下载', 'down', '/down', '', 0, '', 0, 0, 0, 1, 'list.html', 'article-down.html', '2024-09-13 22:39:44', '2024-10-02 15:45:16');
INSERT INTO `cms_category` VALUES (6, 0, '', '', '', '专题', 'topic', '/topic', '', 1, '', 0, 0, 0, NULL, 'list.html', 'special.html', '2024-09-13 22:42:10', '2024-10-01 14:41:51');
INSERT INTO `cms_category` VALUES (7, 0, '', '', '', '关于', 'about', '/about', '', 1, '', 0, 0, 0, NULL, 'list.html', 'page.html', '2024-09-13 22:42:55', '2024-09-13 23:09:29');
INSERT INTO `cms_category` VALUES (8, 2, '', '', '', '文档', 'doc', '/art2/doc', '', 0, '', 0, 0, 0, NULL, 'list.html', 'article.html', '2024-12-05 22:35:58', '2025-01-07 21:41:13');
INSERT INTO `cms_category` VALUES (9, 7, '', '', '', '作者', 'zuozhe', '/about/zuozhe', '', 1, '', 0, 0, 0, NULL, 'list.html', 'page.html', '2024-12-05 23:25:44', '2024-12-05 23:34:37');

-- ----------------------------
-- cms_article 测试数据
-- ----------------------------
INSERT INTO `cms_article` VALUES (1, 2, '', 'commonCMS内容管理系统', '', '2', 2, '', '', '', 'commonCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。', '', '<p>commonCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</p>\n<ul>\n<li>自研。基于自研commonjs轻量级mvc框架实现，轻量、灵活、稳定、高性能、可持续。</li>\n<li>SEO。专注于<code>seo</code>,伪静态<code>html</code>和拼音导航，灵活设置关键词和描述。</li>\n<li>安全。基于<code>knex</code>,高防<code>sql</code>注入，接口权限校验，为安全提供保障。</li>\n<li>灵活。碎片功能，支持零碎文案配置，方便各类灵活文案配置。</li>\n<li>高扩展。支持扩展模型，字段配置，可动态生成表，超强扩展。</li>\n<li>模块化。一切模块相互独立，互不干扰。</li>\n<li>插件化。灵活开发，支持完整功能模块。</li>\n<li>无头cms，为多端提供接口支持。</li>\n</ul>', 0, 14, '', '2024-09-13 22:49:28', '2024-11-24 02:43:13');
INSERT INTO `cms_article` VALUES (2, 3, '', 'commonCMS山水图：风景图', '', '2', 2, '', '', '', '山峰树林湖泊', '/public/cover/04.jpg', '<p><img src=\"https://q5.itc.cn/q_70/images03/20240706/62869b54ec3c4ea5a842b97ac9722630.jpeg\" alt=\"\" width=\"2062\" height=\"1200\"></p>', 0, 32, '', '2024-09-13 22:55:57', '2024-12-13 23:36:50');
INSERT INTO `cms_article` VALUES (3, 4, '', 'commonCMS后台基本操作', '', '2', 2, '', '', '', 'commonCMS后台基本操作', '', '<p><iframe src=\"//player.bilibili.com/player.html?isOutside=true&aid=877077167&bvid=BV17N4y1Y7WC&cid=1362009352&p=1\" height=\"520\" frameborder=\"no\" scrolling=\"no\" allowfullscreen=\"allowfullscreen\"></iframe></p>', 0, 8, '', '2024-09-13 22:59:58', '2025-02-13 22:38:52');
INSERT INTO `cms_article` VALUES (5, 7, '', 'commonCMS简介', '', '2', 2, '', '', '', 'commonCMS简介', '', '<p><strong>commonCMS内容管理系统</strong></p>\n<p>commonCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</p>\n<p><strong>系统特色</strong></p>\n<p>自研。基于自研commonjs轻量级mvc框架实现，轻量、灵活、稳定、高性能、可持续。</p>\n<p>SEO。专注于seo,伪静态html和拼音导航，灵活设置关键词和描述。</p>\n<p>安全。基于knex,高防sql注入，接口权限校验，为安全提供保障。</p>\n<p>灵活。碎片功能，支持零碎文案配置，方便各类灵活文案配置。</p>\n<p>高扩展。支持扩展模型，字段配置，可动态生成表，超强扩展。</p>\n<p>模块化。一切模块相互独立，互不干扰。</p>\n<p>插件化。灵活开发，支持完整功能模块。</p>\n<p>无头cms，为多端提供接口支持。</p>\n<p><strong>软件架构</strong></p>\n<p>后台管理FE</p>\n<pre class=\"language-markup\"><code>vue3\nvue-router\npina\nelement-plus\nvite4\ntinymce</code></pre>\n<p>服务端技术栈</p>\n<pre class=\"language-markup\"><code>nodejs v20.16.0+\nexpress 4.18+\nmysql v5.7.26\nknex (sql操作)\nart-tempate v4.13.2+\npm2 v5.2.2\njwt\npm2 (prd)\nnodemon (dev)</code></pre>', 0, 67, '', '2024-09-13 23:06:30', '2025-02-08 21:57:32');
INSERT INTO `cms_article` VALUES (6, 3, '', 'commonCMS山水图：桂林山水', '', '2', 2, '', '', '', '', '/public/cover/06.jpg', '<p><img src=\"https://img-qn.51miz.com/preview/element/00/01/30/75/E-1307587-924E2CBE.png!/quality/90/unsharp/true/compress/true/format/png/fwfh/900x640\" alt=\"\"><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://p3-pc-sign.douyinpic.com/tos-cn-i-0813c001/ogKHZvfQQ30BGWXEzfeP2BQ70OA5AA7AAdyJgF~tplv-dy-aweme-images-v2:3000:3000:q75.webp?biz_tag=aweme_images&from=327834062&s=PackSourceEnum_AWEME_DETAIL&sc=image&se=false&x-expires=1729130400&x-signature=vl4RUOePzX7s4npn4oARkHH6EAc%3D\" alt=\"\" width=\"896\" height=\"1536\"></p>', 0, 5, '', '2024-09-17 10:53:54', '2024-12-13 23:36:52');
INSERT INTO `cms_article` VALUES (7, 3, '', 'commonCMSAIGC图片美女', '', '2', 2, '', '', '', '', '/public/cover/10.jpg', '<p><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://p9-heycan-hgt-sign.byteimg.com/tos-cn-i-3jr8j4ixpe/31f5581b6dee463bb23c6f4a31d1b204~tplv-3jr8j4ixpe-aigc_resize:0:0.png?lk3s=43402efa&x-expires=1728864000&x-signature=AP23D4sBKcal3LurrbHp9WWra8M%3D&format=.png\" alt=\"\"></p>', 0, 4, '', '2024-09-27 10:06:09', '2024-12-13 23:36:54');
INSERT INTO `cms_article` VALUES (8, 3, '', 'commonCMS图片美女', '', '2', 2, '', '', '', '', '/public/cover/06.jpg', '<p style=\"text-align: center;\"><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://p3-heycan-hgt-sign.byteimg.com/tos-cn-i-3jr8j4ixpe/b9255497ccf94fcf9a1c873eda23b78f~tplv-3jr8j4ixpe-aigc_resize:0:0.png?lk3s=43402efa&x-expires=1728864000&x-signature=xU2jY9QGyZY5ZeG56f%2BZgRyJ4Yk%3D&format=.png\" alt=\"\"></p>', 0, 3, '', '2024-09-27 10:07:52', '2025-05-28 21:47:28');
INSERT INTO `cms_article` VALUES (9, 3, '', 'commonCMS图片美女', '', '2', 2, '', '', '', '', '/public/cover/07.jpg', '<p><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://p3-heycan-hgt-sign.byteimg.com/tos-cn-i-3jr8j4ixpe/9266d858c987459a96ff3a1847d8c9fb~tplv-3jr8j4ixpe-aigc_resize:0:0.png?lk3s=43402efa&x-expires=1728864000&x-signature=%2F%2BWXysOaMFc6Gm%2Fkiv%2FyT2d%2FoAQ%3D&format=.png\" alt=\"\"></p>', 0, 7, '', '2024-09-27 10:37:12', '2025-02-13 22:38:49');
INSERT INTO `cms_article` VALUES (10, 3, '', 'commonCMS图片美女', '', '2', 2, '', '', '', '', '/public/cover/04.jpg', '<p style=\"text-align: center;\"><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://p9-heycan-hgt-sign.byteimg.com/tos-cn-i-3jr8j4ixpe/178004138fad44e3ac7bfd0e6f415e38~tplv-3jr8j4ixpe-aigc_resize:2000:2000.png?lk3s=43402efa&x-expires=1747308745&x-signature=zEPP6LTkWbEnU%2B9af0J1pBPfrqI%3D&format=.png\" alt=\"\" width=\"288\" height=\"512\"></p>', 0, 8, '', '2024-09-27 10:46:27', '2025-02-14 23:03:47');
INSERT INTO `cms_article` VALUES (11, 6, '', 'commonCMS欢迎使用commonCMS系统', '', '2', 2, 'special.html', '', '', '', '', '<section class=\"banner row justify-center\">\n<h1 class=\"commonyue text-c\">commonCMS</h1>\n<p class=\"f-23 text-c mt-20\">基于express+mysql的一款轻量级高质量cms管理系统</p>\n<p class=\"text-c mt-20\"><span class=\"el-button el-button--primary is-round mr-10 c-fff\"><a href=\"https://www.commoncms.top/docs/index.html\" target=\"_blank\" rel=\"noopener\">开始使用</a> </span><span class=\"el-button el-button--primary is-round c-fff\"><a href=\"https://gitee.com/yanyutao0402/commonyue-cms\" target=\"_blank\" rel=\"noopener\">码云</a></span></p>\n</section>\n<section class=\"main center flex justify-between flex-wrap pd-30\">\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">大道至简</h3>\n<p class=\"f-16 mb-20\">基于express自研mvc框架， 优秀的稳定性，可持续迭代，拒绝复杂设计模式。</p>\n</div>\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">独有特色</h3>\n<p class=\"f-16 mb-20\">轻量、灵活、自研、稳定、高性能。</p>\n</div>\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">SEO标准</h3>\n<p class=\"f-16 mb-20\">专注于seo功能，伪静态、自定义导航、灵活设置关键词和描述。</p>\n</div>\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">灵活</h3>\n<p class=\"f-16 mb-20\">万能碎片功能，支持零碎文案配置，把灵活发挥到极致。</p>\n</div>\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">高扩展</h3>\n<p class=\"f-16 mb-20\">无头cms和传统模板共存，多端渲染。灵活模块开发，开发多领域网站。</p>\n</div>\n<div class=\"m-card\">\n<h3 class=\"f-20 mb-20\">高持续性</h3>\n<p class=\"f-16 mb-20\">多年深入nodejs技术栈，一心致力于自研开发，前后端代码逐行开发，可持续性强。</p>\n</div>\n</section>\n<footer class=\"pd-20\">\n<p class=\"mt-30 text-c f-14\">&copy;CopyRight commonCMS</p>\n<p class=\"mt-5 text-c f-12\"><a href=\"https://beian.miit.gov.cn/\" target=\"_blank\" rel=\"external nofollow noopener\">皖ICP备2024033678号-1</a></p>\n</footer>', 0, 73, '', '2024-10-02 13:58:53', '2025-05-29 22:54:47');
INSERT INTO `cms_article` VALUES (13, 5, '', 'commonCMS v3.0.6下载', '', '2', 2, '', '', '', '', '', '<p>commonCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。</p>', 0, 16, '', '2024-10-02 15:40:46', '2024-10-02 15:40:46');
INSERT INTO `cms_article` VALUES (14, 2, '', 'commonCMS', '', '2', 2, 'article-pdf.html', '', '', '', '', '<p>/public/doc/1.pdf</p>', 0, 36, '', '2024-11-09 18:40:34', '2024-12-13 23:37:02');
INSERT INTO `cms_article` VALUES (15, 9, '', 'commonCMS于作者', '', '2', 2, '', '', '', '关于作者测试单页', '', '<p>关于作者测试单页</p>', 0, 72, '', '2024-12-05 23:26:59', '2025-05-29 22:54:47');
INSERT INTO `cms_article` VALUES (18, 8, '', 'commonCMS早间新闻—2024-12-08', '', '2', 2, '', '', '', '123', '', '<p>123</p>', 0, 2, '', '2024-12-09 23:16:07', '2025-02-14 22:59:47');
INSERT INTO `cms_article` VALUES (21, 8, '', 'commonCMS一条鱼如何接二连三', '', '2', 2, NULL, '', '', '凌晨2点刚过，王金友就赶到自家鱼塘忙着捕鱼出货了。', '', '<p>凌晨2点刚过，王金友就赶到自家鱼塘忙着捕鱼出货了。</p><p>兴化水网纵横，渔业发达，是江苏著名的鱼米之乡。产业振兴是乡村振兴的重中之重，一二三产业融合发展是乡村产业振兴的进阶方向。</p>', 0, 6, '', '2024-12-09 23:17:35', '2025-05-29 00:06:35');

-- ----------------------------
-- cms_tag 测试数据
-- ----------------------------
INSERT INTO `cms_tag` VALUES (1, '图片', 'pic', 6);
INSERT INTO `cms_tag` VALUES (2, 'commoncms', 'commoncms', 7);

-- ----------------------------
-- cms_slide 测试数据
-- ----------------------------
INSERT INTO `cms_slide` VALUES (1, '轮播图1', '/public/cover/01.jpg', '', NULL, '2024-09-17 10:52:05', '2024-09-17 10:52:05');
INSERT INTO `cms_slide` VALUES (2, '轮播图2', '/public/cover/02.jpg', '', NULL, '2024-09-17 10:52:15', '2024-09-17 10:52:15');
INSERT INTO `cms_slide` VALUES (3, '轮播图01', '/public/uploads/default/2024/12/15/1734245257724_source_001.jpg', 'http://www.baidu.com', NULL, '2024-09-17 10:52:25', '2024-12-15 14:48:38');

-- ----------------------------
-- cms_frag 测试数据
-- ----------------------------
INSERT INTO `cms_frag` VALUES (1, 'commoncms简介', 'commoncms', '<p><span style=\"font-size: 14px;\">commonCMS是一款基于Node、Express、MySQL、Vue3研发的高质量实用型CMS系统。轻量、灵活、稳定、高性能、易扩展，让开发更简单。</span></p>', 1, '2024-09-13 22:53:33', '2024-09-27 10:51:41');
INSERT INTO `cms_frag` VALUES (2, 'PowerBy', 'PowerBy', '<p style=\"text-align: center;\">Powder By <a href=\"http://www.commoncms.top\" target=\"_blank\" rel=\"noopener\">commonCMS v3.0.14</a></p>', 1, '2024-09-27 11:00:03', '2025-02-12 22:13:21');

-- ----------------------------
-- cms_friend_link 测试数据
-- ----------------------------
INSERT INTO `cms_friend_link` VALUES (1, 'commonCMS官网', 'https://www.commoncms.top', 0, '2024-10-02 14:12:45', '2024-10-02 14:12:45');

-- ----------------------------
-- cms_model 测试数据
-- ----------------------------
INSERT INTO `cms_model` VALUES (1, '下载模型', 'extend_model_download', 1, '下载模型');

-- ----------------------------
-- cms_field 测试数据
-- ----------------------------
INSERT INTO `cms_field` VALUES (1, 1, '文件名称', 'file_name', 1, '', '', 0, '');
INSERT INTO `cms_field` VALUES (2, 1, '文件版本', 'file_version', 1, '', '', 0, '');
INSERT INTO `cms_field` VALUES (3, 1, '文件链接', 'file_link', 1, '', '', 0, '');
INSERT INTO `cms_field` VALUES (4, 1, '测试1', 'test1', 4, '{"options":[{"label":"本地下载","value":"1"},{"label":"电信下载","value":"2"}]}', '', 0, '');

-- ----------------------------
-- plus_collect 测试数据
-- ----------------------------
INSERT INTO `plus_collect` VALUES (2, '人民网-top文章', 'http://www.people.com.cn/', '#rm_topline a', 1, 1, '1', '#newstit', '.rm_txt_con', 1, 'http://js.people.com.cn/n2/2024/0822/c360301-40951625.html', '//图片加域名\nvar urlPrefix = \"http://www.people.com.cn/\";\n    data = data.replace(/(<img[^>]*src=[\"\'])([^\"\']*)(\".*>)/g, function(match, p1, p2, p3) {\n        return p1 + urlPrefix + p2 + p3;\n    });\n//删除分享\ndata = data .replace(/<p\\s+class=\"paper_num\"[^>]*>[\\s\\S]*<\\/p>/gi, \'\');\n//删除编辑\ndata = data .replace(/<div\\s+class=\"(?:edit\\s+)[^\"]*\"[^>]*>[\\s\\S]*<\\/div>/gi, \'\');\n// 移除 style 属性中的所有样式，但保留 text-align: center;\ndata = data .replace(/ style\\s*=\\s*[\'\"]([^\'\"]*)[\'\"]/g, function(match, style) {\n    if (style.includes(\'text-align: center;\')) {\n        return ` style=\"text-align: center;\"`;\n    } else {\n        return \'\';\n    }\n});\n//清理class\ndata = data.replace(/ class\\s*=\\s*[\'\"]([^\'\\\"]*)[\'\"]/g, \'\');\n//清理空格\ndata = data.replace(/\\s+/g, \' \');\ndata = data.trim();\n//清理空span标签\ndata = data.replaceAll(\'<span></span>\', \'\');\n//清理空p标签\ndata = data.replaceAll(\'<p></p>\', \'\');\n//清理空div标签\ndata = data.replaceAll(\'<div></div>\', \'\');\n//清理空table标签\ndata = data .replace(/<table[^>]*>[\\s\\S]*<\\/table>/gi, \'\');\nreturn data;', 8, 2, '2024-08-22 16:27:19', '2024-12-09 23:17:34');

-- ----------------------------
-- plus_gather 测试数据
-- ----------------------------
INSERT INTO `plus_gather` VALUES (3, '每日新闻60s', 'https://api.qqsuu.cn/api/dm-60s?type=json', 'let cont = \'\';\ndata.data.news.map((item)=>{\n   cont +=\'<p>\'+ item+\'</p>\'\n})\nreturn {content:cont ,weiyu:data.data.weiyu,title:\'commonCMS早间新闻—\'+data.data.date};', 8, 2, '2023-11-29 19:10:45', '2024-12-15 15:04:07');

-- ----------------------------
-- sys_user 测试数据
-- ----------------------------
INSERT INTO `sys_user` VALUES (11, '张三', '', '$2a$10$P2KJwlUv/88rqcMVCEgOiO2B0tRWxlJ0T2/LMn1vJmbATtNhOBBQe', '', '', 0, '', '', '', NULL, '', NULL, '', NULL, NULL, 1, NULL);
INSERT INTO `sys_user` VALUES (12, 'admin', '', '$2a$10$pdygs6uahorxNcAOw7RQC.6KkByPiWdg44oDuBNVWr.zfEcy4FLDS', '', '', 0, '', '', '', NULL, '', NULL, '', NULL, NULL, 1, NULL);
INSERT INTO `sys_user` VALUES (14, 'commoncms', '', '$2a$10$Wxkz0GhriYPAXfBxQjQkJ.5ZHs51qYT/JCAZRYQHguManQuFbh1Z.', '', '', 0, '', '', '', NULL, '', NULL, '', NULL, NULL, 1, NULL);

-- ----------------------------
-- sys_role 测试数据
-- ----------------------------
INSERT INTO `sys_role` VALUES (7, '超级管理员', 'super', 0, 1, 1, '', NULL, '', NULL, NULL);
INSERT INTO `sys_role` VALUES (8, '普通管理员', 'admin', 0, 1, 1, '', NULL, '', NULL, NULL);
INSERT INTO `sys_role` VALUES (9, '游客', 'visitor', 0, 1, 1, '', NULL, '', NULL, NULL);

-- ----------------------------
-- sys_menu 测试数据
-- ----------------------------
INSERT INTO `sys_menu` VALUES (5, 0, '网站信息', 'dashboard', 0, '/dashboard', '@/views/base/dashboard/index.vue', 'DataLine', NULL, '', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (6, 0, '站点管理', '', 0, '/site', '', 'Monitor', NULL, '', 'M', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (7, 6, '站点设置', 'siteinfo', 0, '/siteinfo', '@/views/cms/site/index.vue', '', NULL, 'api.site.query', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (8, 0, '内容管理', '', 0, '/content', '', 'Grid', NULL, '', 'M', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (9, 8, '栏目管理', 'category-index', 0, '/category', '@/views/cms/category/index.vue', '', NULL, 'api.category.list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (10, 9, '栏目新增', 'category-add', 0, '/category/add', '@/views/cms/category/add.vue', '', NULL, 'api:category:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (11, 9, '栏目修改', 'category-edit', 0, '/category/edit/:id', '@/views/cms/category/edit.vue', '', NULL, 'api:category.edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (12, 9, '栏目删除', '', 0, '', '', '', NULL, 'api:category:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (13, 9, '栏目查询', '', 0, '', '', '', NULL, 'api:category:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (14, 8, '文章管理', 'article-index', 0, '/article', '@/views/cms/article/index.vue', '', NULL, 'api:article:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (15, 14, '文章新增', 'article-add', 0, '/article/add', '@/views/cms/article/add.vue', '', NULL, 'api:article.add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (16, 14, '文章修改', 'article-edit', 0, '/article/edit/:id', '@/views/cms/article/edit.vue', '', NULL, 'api:article:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (17, 14, '文章删除', '', 0, '', NULL, '', NULL, 'api:article:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (18, 14, '文章查询', '', 0, '', NULL, '', NULL, 'api:article:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (19, 8, '轮播管理', 'slide-index', 0, '/slide', '@/views/cms/slide/index.vue', '', NULL, 'api:slide:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (20, 19, '轮播新增', 'slide-add', 0, '/slide/add', '@/views/cms/slide/add.vue', '', NULL, 'api:slide:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (21, 19, '轮播修改', 'slide-edit', 0, '/slide/edit/:id', '@/views/cms/slide/edit.vue', '', NULL, 'api:slide.edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (22, 19, '轮播删除', '', 0, '', NULL, '', NULL, 'api:slide:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (23, 19, '轮播查询', '', 0, '', NULL, '', NULL, 'api:slide:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (24, 8, '标签管理', 'tag-index', 0, '/tag', '@/views/cms/tag/index.vue', '', NULL, 'api:tag:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (25, 24, '标签新增', 'tag-add', 0, '/tag/add', '@/views/cms/tag/add.vue', '', NULL, 'api:tag:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (26, 24, '标签修改', 'tag-edit', 0, '/tag/edit/:id', '@/views/cms/tag/edit.vue', '', NULL, 'api:tag:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (27, 24, '标签删除', '', 0, '', NULL, '', NULL, 'api:tag:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (28, 24, '标签查询', '', 0, '', NULL, '', NULL, 'api:tag:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (29, 8, '碎片管理', 'frag-index', 0, '/frag', '@/views/cms/frag/index.vue', '', NULL, 'api:tag:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (30, 29, '碎片新增', 'frag-add', 0, '/frag/add', '@/views/cms/frag/add.vue', '', NULL, 'api:tag:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (31, 29, '碎片编辑', 'frag-edit', 0, '/frag/edit/:id', '@/views/cms/frag/edit.vue', '', NULL, 'api:tag:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (32, 29, '碎片删除', '', 0, '', NULL, '', NULL, 'api:tag:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (33, 29, '碎片查询', '', 0, '', NULL, '', NULL, 'api:tag:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (35, 45, '页面采集', 'collect-index', 0, '/collect', '@/views/cms/collect/index.vue', '', NULL, 'api:collect:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (36, 35, '采集新增', 'collect-add', 0, '/collect/add', '@/views/cms/collect/add.vue', '', NULL, 'api:collect:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (37, 35, '采集修改', 'collect-edit', 0, '/collect/:id', '@/views/cms/collect/edit.vue', '', NULL, 'api:collect:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (38, 35, '采集删除', '', 0, '', NULL, '', NULL, 'api:collect:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (39, 35, '采集查询', '', 0, '', NULL, '', NULL, 'api:collect:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (40, 45, '接口采集', 'gather-index', 0, '/gather', '@/views/cms/gather/index.vue', '', NULL, 'api:gather:index', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (41, 40, '采集新增', 'gather-add', 0, '/gather/add', '@/views/cms/gather/add.vue', '', NULL, 'api:gather:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (42, 40, '采集修改', 'gather-edit', 0, '/gather/edit/:id', '@/views/cms/gather/edit.vue', '', NULL, 'api:gather:eidt', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (43, 40, '采集删除', '', 0, '', NULL, '', NULL, 'api:gather:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (44, 40, '采集查询', '', 0, '', NULL, '', NULL, 'api:gather:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (45, 0, '功能管理', '', 0, '/extend', NULL, 'Operation', NULL, NULL, 'M', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (46, 45, '模型管理', 'model-index', 0, '/model', '@/views/cms/model/index.vue', '', NULL, 'api:model:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (47, 46, '模型新增', 'model-add', 0, '/model/add', '@/views/cms/model/add.vue', '', NULL, 'api:model:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (48, 46, '模型修改', 'model-edit', 0, '/model/edit/:id', '@/views/cms/model/edit.vue', '', NULL, 'api:model:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (49, 46, '模型删除', '', 0, '', NULL, '', NULL, 'api:model:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (50, 46, '模型查询', '', 0, '', NULL, '', NULL, 'api:model:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (51, 46, '字段管理', 'field-index', 0, '/model/field', '@/views/cms/field/index.vue', '', NULL, 'api:field:list', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (52, 51, '字段新增', 'field-add', 0, '/model/field/add', '@/views/cms/field/add.vue', '', NULL, 'api:field:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (53, 51, '字段修改', 'field-edit', 0, '/model/field/edit', '@/views/cms/field/edit.vue', '', NULL, 'api:field:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (54, 51, '字段删除', '', 0, '', NULL, '', NULL, 'api:field:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (55, 51, '字段查询', '', 0, '', NULL, '', NULL, 'api:field:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (56, 8, '友情链接', 'friendlink-index', 0, '/friendlink', '@/views/cms/friendlink/index.vue', '', NULL, 'api:friendlink:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (57, 56, '友链新增', 'friendlink-add', 0, '/friendlink/add', '@/views/cms/friendlink/add.vue', '', NULL, 'api:friendlink:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (58, 56, '友链修改', 'friendlink-edit', 0, '/friendlink/edit/:id', '@/views/cms/friendlink/edit.vue', '', NULL, 'api:friendlink:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (59, 56, '友链删除', '', 0, '', NULL, '', NULL, 'api:friendlink:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (60, 56, '友链查询', '', 0, '', NULL, '', NULL, 'api:friendlink:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (61, 8, '消息管理', 'message-index', 0, '/message', '@/views/cms/message/index.vue', '', NULL, 'api:message:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (62, 61, '消息新增', 'message-add', 0, '/message/add', '@/views/cms/message/add.vue', '', NULL, 'api:message:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (63, 61, '消息修改', 'message-edit', 0, '/message/edit/:id', '@/views/cms/message/edit.vue', '', NULL, 'api:message:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (64, 61, '消息删除', '', 0, '', NULL, '', NULL, 'api:message:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (65, 61, '消息查询', '', 0, '', NULL, '', NULL, 'api:message:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (66, 0, '系统管理', '', 0, '/sys', '', 'Setting', NULL, NULL, 'M', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (67, 66, '用户管理', 'user-index', 0, '/user', '@/views/base/user/index.vue', '', NULL, 'api:user:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (68, 67, '用户新增', 'user-add', 0, '/user/add', '@/views/base/user/add.vue', '', NULL, 'api:user:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (69, 67, '用户修改', 'user-edit', 0, '/user/edit/:id', '@/views/base/user/edit.vue', '', NULL, 'api:user:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (70, 67, '用户删除', '', 0, '', NULL, '', NULL, 'api:user:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (71, 67, '用户查询', '', 0, '', NULL, '', NULL, 'api:user:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (72, 66, '角色管理', 'role-index', 0, '/role', '@/views/base/role/index.vue', '', NULL, 'api:role:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (73, 72, '角色新增', 'role-add', 0, '/role/add', '@/views/base/role/add.vue', '', NULL, 'api:role:add', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (74, 72, '角色编辑', 'role-edit', 0, '/role/edit/:id', '@/views/base/role/edit.vue', '', NULL, 'api:role:edit', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (75, 72, '角色删除', '', 0, '', NULL, '', NULL, 'api.role.del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (76, 72, '角色查询', '', 0, '', NULL, '', NULL, 'api:role.query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (77, 66, '菜单管理', 'menu', 0, '/menu', '@/views/base/menu/index.vue', '', NULL, 'api:menu:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (78, 77, '菜单新增', '', 0, '', NULL, '', NULL, 'api:menu:add', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (79, 77, '菜单修改', '', 0, '', NULL, '', NULL, 'api:menu:edit', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (80, 77, '菜单删除', '', 0, '', NULL, '', NULL, 'api:menu:del', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (81, 77, '菜单查询', '', 0, '', NULL, '', NULL, 'api:menu:query', 'F', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (82, 66, '登录日志', 'loginlog', 0, '/loginlog', '@/views/cms/loginlog/index.vue', '', NULL, 'api:menu:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (83, 6, '站点更新', '', 0, '', '', '', NULL, 'api:info:edit', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (84, 66, '配置字典', 'configtype', 0, '/configtype', '@/views/base/config-type/index.vue', '', NULL, 'api:configtype:list', 'C', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (85, 84, '配置列表', 'config', 0, '/configtype/:id', '@/views/base/config/index.vue', '', NULL, 'api:config:list', 'C', 2, 2, 2, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (86, 84, '字典新增', '', 0, '', '', '', NULL, 'api:configtype:add', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (87, 84, '字典修改', '', 0, '', '', '', NULL, 'api:configtype:edit', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (88, 84, '字典删除', '', 0, '', '', '', NULL, 'api:configtype:del', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (89, 84, '字典查询', '', 0, '', '', '', NULL, 'api:configtype:list', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (90, 85, '新增配置', '', 0, '', '', '', NULL, 'api:config.add', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (91, 85, '配置修改', '', 0, '', '', '', NULL, 'api:config:edit', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (92, 85, '配置删除', '', 0, '', '', '', NULL, 'api:config:del', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');
INSERT INTO `sys_menu` VALUES (93, 85, '配置查询', '', 0, '', '', '', NULL, 'api:config:list', 'F', 2, 2, 1, NULL, '', NULL, '', NULL, '');

-- ----------------------------
-- sys_user_role 测试数据
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (11, 7);
INSERT INTO `sys_user_role` VALUES (12, 9);
INSERT INTO `sys_user_role` VALUES (14, 7);

-- ----------------------------
-- sys_role_menu 测试数据
-- ----------------------------
-- 超级管理员(super) — 拥有全部菜单权限
INSERT INTO `sys_role_menu` VALUES (7, 5),(7, 6),(7, 7),(7, 8),(7, 9),(7, 10),(7, 11),(7, 12),(7, 13),(7, 14),(7, 15),(7, 16),(7, 17),(7, 18),(7, 19),(7, 20),(7, 21),(7, 22),(7, 23),(7, 24),(7, 25),(7, 26),(7, 27),(7, 28),(7, 29),(7, 30),(7, 31),(7, 32),(7, 33),(7, 35),(7, 36),(7, 37),(7, 38),(7, 39),(7, 40),(7, 41),(7, 42),(7, 43),(7, 44),(7, 45),(7, 46),(7, 47),(7, 48),(7, 49),(7, 50),(7, 51),(7, 52),(7, 53),(7, 54),(7, 55),(7, 56),(7, 57),(7, 58),(7, 59),(7, 60),(7, 61),(7, 62),(7, 63),(7, 64),(7, 65),(7, 66),(7, 67),(7, 68),(7, 69),(7, 70),(7, 71),(7, 72),(7, 73),(7, 74),(7, 75),(7, 76),(7, 77),(7, 78),(7, 79),(7, 80),(7, 81),(7, 82),(7, 83),(7, 84),(7, 85);
-- 普通管理员(admin)
INSERT INTO `sys_role_menu` VALUES (8, 5),(8, 6),(8, 7);
-- 游客(visitor)
INSERT INTO `sys_role_menu` VALUES (9, 5),(9, 7),(9, 9),(9, 13),(9, 14),(9, 18),(9, 19),(9, 23),(9, 24),(9, 28),(9, 29),(9, 33),(9, 35),(9, 39),(9, 40),(9, 44),(9, 46),(9, 50),(9, 51),(9, 55),(9, 56),(9, 60),(9, 61),(9, 65),(9, 67),(9, 71),(9, 72),(9, 76),(9, 77),(9, 81),(9, 82);

-- ----------------------------
-- sys_login_log 测试数据
-- ----------------------------
INSERT INTO `sys_login_log` VALUES (39, 1, '112.80.234.68', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2024-12-01 22:49:59');
INSERT INTO `sys_login_log` VALUES (40, 1, '112.80.234.68', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2024-12-02 21:57:58');
INSERT INTO `sys_login_log` VALUES (41, 1, '112.80.234.68', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2024-12-05 22:29:03');
INSERT INTO `sys_login_log` VALUES (42, 1, '112.80.234.68', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2024-12-05 22:32:13');
INSERT INTO `sys_login_log` VALUES (43, 14, '112.80.234.180', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2025-05-28 21:48:42');
INSERT INTO `sys_login_log` VALUES (44, 14, '112.80.234.180', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2025-05-29 00:16:13');
INSERT INTO `sys_login_log` VALUES (45, 14, '112.80.234.180', '中国', '江苏省', '南京市', '秦淮区', '中国联通', NULL, NULL, '2025-05-29 00:19:37');

-- ----------------------------
-- sys_config_type 测试数据
-- ----------------------------
INSERT INTO `sys_config_type` VALUES (2, 'wechat_minip', '微信小程序', 1, '微信小程序登录appId appkey', '2025-03-01 21:02:10', '2025-03-07 14:20:35');
INSERT INTO `sys_config_type` VALUES (3, 'qiniu_oss', '七牛云配置', 1, '七牛云oss配置', '2025-03-01 21:03:35', '2025-03-07 14:20:21');
INSERT INTO `sys_config_type` VALUES (4, 'cms_config', '应用设置', 1, '站点常用配置', '2025-03-04 19:10:51', '2025-03-07 14:21:05');

-- ----------------------------
-- sys_config 测试数据
-- ----------------------------
INSERT INTO `sys_config` VALUES (1, 'wechat_minip', 'appid', 'wx1234567890abcdef', 1, '2025-03-07 14:50:13', '2025-03-07 22:11:33', '小程序appId');
INSERT INTO `sys_config` VALUES (2, 'wechat_minip', 'secret', 'secret1234567890abcdef', 1, '2025-03-07 14:54:36', '2025-03-07 22:11:33', '小程序secret');
INSERT INTO `sys_config` VALUES (3, 'qiniu_oss', 'accessKey', 'your-access-key', 1, '2025-03-07 14:59:31', '2025-03-07 22:11:29', '七牛云AccessKey');
INSERT INTO `sys_config` VALUES (4, 'qiniu_oss', 'secretKey', 'your-secret-key', 1, '2025-03-07 14:59:51', '2025-03-07 22:11:29', '七牛云SecretKey');
INSERT INTO `sys_config` VALUES (5, 'qiniu_oss', 'bucket', 'your-bucket', 1, '2025-03-07 15:00:08', '2025-03-07 22:11:29', '七牛云Bucket');
INSERT INTO `sys_config` VALUES (6, 'cms_config', 'upload_way', '1', 1, '2025-03-07 15:00:42', '2025-03-07 15:00:42', '上传方式');
INSERT INTO `sys_config` VALUES (8, 'qiniu_oss', 'domain', 'https://cdn.example.com', 1, '2025-03-07 17:48:50', '2025-03-07 22:11:29', '七牛云域名');

-- ----------------------------
-- 会员体系测试数据（空表保留结构，可按需添加）
-- ----------------------------
-- user: 无测试数据
-- user_level: 无测试数据
-- user_level_ship: 无测试数据
-- user_product: 无测试数据
-- user_order: 无测试数据
-- user_reading_record: 无测试数据
-- user_social_login: 无测试数据
-- cms_article_tag: 无测试数据
-- cms_message: 无测试数据
-- sys_notice: 无测试数据
-- extend_model_download: 无测试数据

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 初始化完成
-- ============================================================
