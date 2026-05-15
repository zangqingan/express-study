# 内容管理系统(CMS) 数据库设计文档

**数据库名：** `common_cms`
**字符集：** `utf8mb4` / `utf8mb4_unicode_ci`
**引擎：** InnoDB
**数据库版本：** MySQL 8.0.34
**总表数：** 30
**分析日期：** 2026-05-11

## 一、整体架构概述

数据库共 30 **张表**，按业务领域分为 6大模块：

```
┌──────────────────────────────────────────────────────┐
│                    CommonCMS 数据库                   │
├─────────────┬────────────┬────────────┬──────────────┤
│  CMS 核心    │  内容采集   │  RBAC权限   │  系统配置   │
│  (12 张表)   │  (2 张表)   │  (5 张表)   │  (2 张表)   │
├─────────────┼────────────┼────────────┼──────────────┤
│   审计日志   │  会员系统   │  
│   (2 张表)  │  (7 张表)   │   
└─────────────┴────────────┴────────────┴──────────────┘
```

| 模块                   | 表名                      | 说明            |
| ---------------------- | ------------------------- | --------------- |
| CMS核心                | `cms_site`              | 站点信息表      |
|                        | `cms_category`          | 栏目分类表      |
|                        | `cms_article`           | 文章表          |
|                        | `cms_tag`               | 标签表          |
|                        | `cms_article_tag`       | 文章-标签中间表 |
| **（扩展模型）** | `cms_model`             | 模型字典        |
|                        | `cms_field`             | 模型字段字典    |
|                        | `extend_model_download` | 下载模型扩展表  |
| **（辅助功能）** | `cms_slide`             | 轮播图表        |
|                        | `cms_frag`              | 碎片管理        |
|                        | `cms_friend_link`       | 友情链接        |
|                        | `cms_message`           | 留言板          |
| **采集模块**     | `plus_collect`          | 页面采集规则    |
|                        | `plus_gather`           | 接口采集规则    |
| **系统管理**     | `sys_user`              | 后台用户        |
|                        | `sys_role`              | 角色表          |
|                        | `sys_menu`              | 菜单权限表      |
|                        | `sys_user_role`         | 用户角色关联    |
|                        | `sys_role_menu`         | 角色菜单关联    |
| **审计日志**     | `sys_login_log`         | 登录日志        |
|                        | `sys_notice`            | 通知公告        |
| **系统配置**     | `sys_config_type`       | 配置类型字典    |
|                        | `sys_config`            | 系统配置项      |
| **会员体系**     | `user`                  | 前端会员表      |
|                        | `user_level`            | 会员等级        |
|                        | `user_level_ship`       | 会员等级关系    |
|                        | `user_product`          | 会员产品        |
|                        | `user_order`            | 订单表          |
|                        | `user_reading_record`   | 阅读记录        |
|                        | `user_social_login`     | 第三方登录      |

---

---

## 二、ER 图（核心关系）

```
                          ┌──────────────────────┐
                          │      cms_site        │  站点信息（单条记录）
                          └──────────────────────┘

  ┌─────────────────┐          ┌──────────────────────┐
  │   cms_category   │←──┐     │      cms_article      │
  │   栏目（树形）    │   │     │      文章（核心）       │
  │   pid 自关联      │   │     │   cid → cms_category  │
  └────────┬─────────┘   │     └───┬────────┬──────────┘
           │             │         │        │
           │  cid (FK)   └─────────┘        │  aid (FK)
           │                                │
  ┌────────┴─────────┐          ┌───────────┴───────────┐
  │ plus_collect     │          │   cms_article_tag       │
  │ plus_gather      │          │   aid → cms_article    │
  │ (采集目标栏目)    │          │   tid → cms_tag        │
  └──────────────────┘          └───────────┬───────────┘
                                            │
                                ┌───────────┴───────────┐
                                │       cms_tag         │
                                └───────────────────────┘

  ┌──────────────────┐
  │    cms_model     │  模型字典
  └────────┬─────────┘
           │ mid (FK, CASCADE)
  ┌────────┴─────────┐         ┌──────────────────────┐
  │    cms_field     │         │ extend_model_download│  示例扩展表
  │  (动态字段定义)   │         │  aid → cms_article    │  (模型 id=1 的实例表)
  └──────────────────┘         └──────────────────────┘

  ────────────────────────────────────  辅助功能（独立表，无外键）

  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────┐
  │cms_slide │  │ cms_frag │  │cms_friend_link│  │cms_message│
  │  轮播图   │  │ 碎片管理  │  │   友情链接    │  │  留言板   │
  └──────────┘  └──────────┘  └──────────────┘  └──────────┘

  ──────────────────────────────────────────  RBAC权限系统

  ┌──────────┐    sys_user_role     ┌──────────────┐
  │ sys_user │←────────────────────→│   sys_role   │
  └─────┬────┘  user_id / role_id   └──────┬───────┘
        │                                  │
        │                            sys_role_menu
        │                            role_id / menu_id
        │                                  │
        │                       ┌──────────┴──────────┐
        │                       │     sys_menu        │  菜单/权限树
        │                       │  pid 自关联（树形）  │
        │                       └─────────────────────┘
        │
        │ uid (FK)
        ↓
  ┌──────────────┐
  │ sys_login_log│  登录日志（归属审计日志模块）
  └──────────────┘

  ──────────────────────────────────────────  审计日志

  ┌──────────────┐
  │  sys_notice  │  通知公告（独立表，当前无数据）
  └──────────────┘

  ──────────────────────────────────────────  系统配置

  ┌──────────────────┐
  │ sys_config_type  │
  └────────┬─────────┘
           │ type_code (FK, CASCADE)
  ┌────────┴─────────┐
  │    sys_config    │  具体配置键值
  └──────────────────┘

  ──────────────────────────────────────────  会员系统

  ┌──────────┐  user_level_ship    ┌──────────────┐
  │   user   │←──────────────────→│  user_level  │
  └────┬─────┘ user_id / level_id └──────┬───────┘
       │                                 │
       │ user_id (FK)              level_id (FK)
       ↓                                 ↓
  ┌─────────────┐              ┌──────────────┐
  │ user_order  │              │ user_product │
  │ product_id  │──────────────│    (FK)      │
  └─────────────┘              └──────────────┘
       │
       │ user_id (FK)
       ↓
  ┌─────────────────┐       ┌───────────────────┐
  │user_reading_record│      │ user_social_login │
  │article_id→article│      │ user_id → user    │
  └─────────────────┘       └───────────────────┘
```

## 三、CMS 核心模块（ 12张表）

### 1. cms_site — 站点信息

**用途**：存储网站全局配置，单条记录（只有 id=1 一条数据）。
**关系**：无外键关联，独立表。在应用层通过 `req.app.locals` 缓存全局使用。

| 字段名          | 类型             | 允许空 | 默认值            | 说明                         |
| --------------- | ---------------- | ------ | ----------------- | ---------------------------- |
| `id`          | int unsigned  PK | 否     | 自增              | 站点ID                       |
| `name`        | varchar(20)      | 是     | NULL              | 网站名称                     |
| `logo`        | varchar(500)     | 是     | NULL              | 网站Logo路径                 |
| `domain`      | varchar(30)      | 是     | NULL              | 网站域名                     |
| `email`       | varchar(50)      | 是     | NULL              | 联系邮箱                     |
| `wechat`      | varchar(30)      | 是     | NULL              | 微信号                       |
| `icp`         | varchar(100)     | 是     | NULL              | ICP备案号                    |
| `code`        | varchar(255)     | 是     | NULL              | 站点统计代码（如百度统计）   |
| `ext_config`  | text             | 是     | NULL              | 万能配置（JSON格式扩展字段） |
| `title`       | varchar(50)      | 是     | NULL              | SEO标题（页面默认）          |
| `keywords`    | varchar(100)     | 是     | NULL              | SEO关键词（页面默认）        |
| `description` | varchar(255)     | 是     | NULL              | SEO描述（页面默认）          |
| `template`    | varchar(50)      | 是     | 'default'         | 模板名称（默认 `default`） |
| `upload_way`  | tinyint unsigned | 否     | 1                 | 上传方式(1-普通、2-七牛云)   |
| `created_at`  | datetime         | 是     | CURRENT_TIMESTAMP | 创建时间                     |
| `updated_at`  | datetime         | 是     | 自动更新          | 更新时间                     |

---

### 2. cms_category — 栏目(分类)表（树形结构）

**用途**：网站栏目/分类，通过 `parent_id` 自关联实现无限级树形结构。支持列表页和单页两种类型。
**关系**：

- **自关联**：parent_id `→ id`，顶级栏目 `parent_id`=0
- **一对多**：一个栏目下有多个文章（`cms_article.cid → cms_category.id`）
- **一对多**：采集任务指定存储栏目（`plus_collect.cid` / `plus_gather.cid → cms_category.id`）

| 字段名              | 类型              | 允许空 | 默认值            | 说明                                            |
| ------------------- | ----------------- | ------ | ----------------- | ----------------------------------------------- |
| `id`              | int unsigned  PK  | 否     | 自增              | 栏目ID、主键                                    |
| `parent_id`       | int(11) unsigned | 否     | 0                 | 父级栏目ID，0 表示顶级                          |
| `seo_title`       | varchar(255)      | 是     | NULL              | SEO标题                                         |
| `seo_keywords`    | varchar(255)      | 是     | NULL              | SEO关键字                                       |
| `seo_description` | varchar(255)      | 是     | NULL              | SEO描述                                         |
| `name`            | varchar(50)       | 否     |                   | 栏目名称                                        |
| `pinyin`          | varchar(255)      | 否     |                   | 栏目标识（拼音）（用于URL伪静态）               |
| `path`            | varchar(255)      | 否     |                   | 栏目路径（如 `/about/zuozhe`）                |
| `description`     | varchar(255)      | 否     |                   | 栏目描述                                        |
| `type`            | tinyint unsigned | 是     | 0                 | 栏目类型（0-栏目、1-页面）                      |
| `url`             | varchar(255)      | 是     | NULL              | 外部链接（跳转到其他URL）                       |
| `order_by`        | int(11)           | 是     | 0                 | 排序                                            |
| `target`          | tinyint unsigned | 是     | 0                 | 打开方式（0-当前页、1-新窗口）                  |
| `status`          | tinyint unsigned | 是     | 0                 | 显示状态（0-显示、1-隐藏）                      |
| `mid`             | int unsigned      | 是     | NULL              | 关联模型ID（NULL 为默认模型）→`cms_model.id` |
| `list_view`       | varchar(100)      | 是     | 'list.html'       | 列表页模板文件名                                |
| `article_view`    | varchar(100)      | 是     | 'article.html'    | 详情页模板文件名                                |
| `created_at`      | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                                        |
| `updated_at`      | datetime          | 是     | 自动更新          | 更新时间                                        |

---

### 3. cms_article — 文章表

**用途**：CMS 核心内容表，存储所有文章数据。

**关系**：

- `cid → cms_category.id`（RESTRICT，有关联栏目时不能删除栏目）
- `tag_id` 冗余存储标签ID，同时通过 `cms_article_tag` 中间表关联
- `sub_cid` 允许一篇文章附加到多个栏目

**设计注意**：`tag_id` 字段以逗号分隔存储标签ID（如 `"1,2,3"`），同时通过 `cms_article_tag` 表做正规化关联。这是一种**双写**策略：冗余字段用于快速读取，关联表用于精确查询。但数据一致性需要应用层维护。

| 字段名           | 类型              | 允许空 | 默认值            | 说明                                             |
| ---------------- | ----------------- | ------ | ----------------- | ------------------------------------------------ |
| `id`           | int unsigned  PK  | 否     | 自增              | 文章ID                                           |
| `cid`          | int(11) FK       | 否     |                   | 所属栏目ID（外键）→`cms_category.id`          |
| `sub_cid`      | varchar(255)      | 是     | NULL              | 其他关联栏目ID（逗号分隔，一篇文章属于多个栏目） |
| `title`        | varchar(255)      | 否     |                   | 文章标题                                         |
| `short_title`  | varchar(255)      | 是     | NULL              | 短标题                                           |
| `tag_id`       | varchar(255)      | 是     | NULL              | 标签ID字符串、逗号分隔存储                       |
| `attr`         | tinyint unsigned | 是     | NULL              | 属性(1-头条、2-推荐、3-轮播、4-热门)             |
| `article_view` | varchar(100)      | 是     | NULL              | 文章详情页模板（可覆盖栏目级模板、可单独指定）   |
| `source`       | varchar(255)      | 是     | NULL              | 来源                                             |
| `author`       | varchar(255)      | 是     | NULL              | 作者                                             |
| `description`  | varchar(255)      | 是     | NULL              | 文章简述/摘要                                    |
| `img`          | varchar(255)      | 是     | NULL              | 缩略图URL                                        |
| `content`      | longtext          | 否     |                   | 文章内容/正文（HTML）                            |
| `status`       | tinyint unsigned | 是     | 0                 | 文章发布状态（0-发布、1-不发布(草稿)）           |
| `pv`           | int(10)           | 是     | 0                 | 浏览量                                           |
| `link`         | varchar(255)      | 是     | NULL              | 外部链接（跳转文章）                             |
| `created_at`   | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                                         |
| `updated_at`   | datetime          | 是     | 自动更新          | 更新时间                                         |

---

### 4. cms_tag — 标签表

**关系**：通过 `cms_article_tag` 中间表与文章建立多对多关联。

| 字段名        | 类型             | 允许空 | 默认值 | 说明                   |
| ------------- | ---------------- | ------ | ------ | ---------------------- |
| `id`        | int unsigned  PK | 否     | 自增   | 标签ID                 |
| `name`      | varchar(10)      | 是     | NULL   | 标签名称               |
| `path`      | varchar(255)     | 是     | ''     | 标签标识（URL路径）    |
| `ref_count` | int(11)          | 是     | 0      | 引用次数（冗余计数器） |

---

### 5. cms_article_tag — 文章-标签中间表

**用途**：文章与标签的多对多中间表。

**关系**：

- `aid → cms_article.id`（RESTRICT）
- `tid → cms_tag.id`（RESTRICT）
- 索引：`aid`、`tid` 分别建索引

| 字段名  | 类型             | 允许空 | 默认值 | 说明                                |
| ------- | ---------------- | ------ | ------ | ----------------------------------- |
| `id`  | int unsigned  PK | 否     | 自增   | 关联ID 主键                         |
| `aid` | int unsigned FK  | 是     | NULL   | 文章ID（外键）→` cms_article.id` |
| `tid` | int unsigned FK  | 是     | NULL   | 标签ID（外键）→` cms_tag.id`     |

---

### 6. cms_slide — 轮播图表

**关系**：独立表，无外键关联。

| 字段名         | 类型             | 允许空 | 默认值            | 说明         |
| -------------- | ---------------- | ------ | ----------------- | ------------ |
| `id`         | int unsigned  PK | 否     | 自增              | 轮播ID       |
| `title`      | varchar(255)     | 是     | NULL              | 轮播标题     |
| `img_url`    | varchar(255)     | 是     | NULL              | 轮播图URL    |
| `link_url`   | varchar(255)     | 是     | NULL              | 点击链接地址 |
| `remark`     | varchar(255)     | 是     | NULL              | 备注         |
| `created_at` | datetime         | 是     | CURRENT_TIMESTAMP | 创建时间     |
| `updated_at` | datetime         | 是     | 自动更新          | 更新时间     |

---

### 7. cms_frag — 碎片表

**用途**：灵活配置零碎文案片段（如 "关于我们简介"、"页脚版权信息"），通过 `mark` 标识在模板中调用。

**关系**：独立表，无外键关联。

| 字段名         | 类型              | 允许空 | 默认值            | 说明                                   |
| -------------- | ----------------- | ------ | ----------------- | -------------------------------------- |
| `id`         | int unsigned  PK  | 否     | 自增              | 碎片ID                                 |
| `name`       | varchar(50)       | 是     | ''                | 碎片名称（管理后台用）                 |
| `remark`     | varchar(50)       | 是     | NULL              | 碎片标识（代码调用用，如 `commoncms`） |
| `content`    | longtext          | 是     | NULL              | 内容                                   |
| `type`       | tinyint unsigned | 是     | NULL              | 类型(1-富文本、2-文本框)               |
| `created_at` | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                               |
| `updated_at` | datetime          | 是     | 自动更新          | 更新时间                               |

---

### 8. cms_friend_link — 友情链接表

**关系**：独立表，无外键关联。

| 字段名         | 类型             | 允许空 | 默认值            | 说明     |
| -------------- | ---------------- | ------ | ----------------- | -------- |
| `id`         | int unsigned  PK | 否     | 自增              | 链接ID   |
| `title`      | varchar(255)     | 是     | NULL              | 链接名称 |
| `link`       | varchar(255)     | 是     | NULL              | 链接地址 |
| `order_by`   | int(11)          | 是     | 0                 | 排序     |
| `created_at` | datetime         | 是     | CURRENT_TIMESTAMP | 创建时间 |
| `updated_at` | datetime         | 是     | 自动更新          | 更新时间 |

---

### 9. cms_message — 留言表

**关系**：独立表，无外键关联。

| 字段名           | 类型              | 允许空 | 默认值            | 说明                                       |
| ---------------- | ----------------- | ------ | ----------------- | ------------------------------------------ |
| `id`           | int unsigned  PK  | 否     | 自增              | 留言ID                                     |
| `type`         | tinyint unsigned | 是     | NULL              | 留言分类（1-咨询、2-建议、3-投诉、4-其它） |
| `title`        | varchar(255)      | 是     | NULL              | 留言标题                                   |
| `name`         | varchar(100)      | 是     | NULL              | 姓名                                       |
| `phone_number` | varchar(50)       | 是     | NULL              | 电话号码                                   |
| `wechat`       | varchar(50)       | 是     | NULL              | 微信                                       |
| `company_name` | varchar(100)      | 是     | NULL              | 公司名称                                   |
| `content`      | varchar(500)      | 是     | NULL              | 留言内容                                   |
| `created_at`   | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                                   |
| `updated_at`   | datetime          | 是     | 自动更新          | 更新时间                                   |

---

### 10. cms_model — 模型字典

此模块允许管理员**动态创建自定义内容类型**，无需修改代码。核心机制是：

1. 在 `cms_model` 中注册一个新模型
2. 在 `cms_field` 中定义该模型的字段
3. 系统自动创建对应的数据表（如 extend_model_download）
4. 栏目通过 `mid` 字段关联模型

**关系**：一对多 → `cms_field.mid`（CASCADE 删除）

**示例**：下载模型 → 对应表 `extend_model_download`

| 字段名         | 类型              | 允许空 | 默认值 | 说明           |
| -------------- | ----------------- | ------ | ------ | -------------- |
| `id`         | int unsigned  PK  | 否     | 自增   | 模型ID         |
| `model_name` | varchar(10)       | 是     | NULL   | 模型名称       |
| `table_name` | varchar(50)       | 是     | NULL   | 对应数据库表名 |
| `status`     | tinyint unsigned | 是     | '1'    | 1-开启、0-关闭 |
| `remark`     | varchar(50)       | 是     | NULL   | 备注           |

### 11. cms_field — 模型字段表

**关系**：`mid → cms_model.id`（CASCADE，删除模型时联动删除字段定义）

| 字段名          | 类型              | 允许空 | 默认值 | 说明                                                             |
| --------------- | ----------------- | ------ | ------ | ---------------------------------------------------------------- |
| `id`          | int unsigned  PK  | 否     | 自增   | 字段ID                                                           |
| `mid`         | int unsigned FK   | 是     | NULL   | 所属模型ID（外键）→`cms_model.id`（CASCADE）                  |
| `cname`       | varchar(60)       | 是     | NULL   | 字段中文名                                                       |
| `ename`       | varchar(60)       | 是     | ''     | 字段英文名（对应数据表的列名）                                   |
| `type`        | tinyint unsigned | 是     | NULL   | 表单类型(1-单行、2-多行、3-下拉、4-单选、5-多选、6-日期、7-数字) |
| `val`         | varchar(255)      | 是     | NULL   | 字段配置（下拉/单选/多选的选项JSON）                             |
| `default_val` | varchar(255)      | 是     | NULL   | 默认值                                                           |
| `order_by`    | int(11)           | 是     | 0      | 排序                                                             |
| `length`      | varchar(255)      | 是     | NULL   | 字段长度                                                         |

### 12. extend_model_download —示例下载模型扩展表

**用途**：`cms_model.id=1` 对应的数据表，展示动态模型的运作方式。

**关系**：`aid → cms_article.id`（RESTRICT）

**运转逻辑**：

1. 栏目设置 `mid=1` 表示该栏目下的文章使用下载模型
2. 编辑文章时，根据 `cms_field` 中 `mid=1` 的字段定义动态渲染表单
3. 数据存储到 extend_model_download，通过 `aid` 与文章关联

| 字段名           | 类型             | 允许空 | 默认值 | 说明                 |
| ---------------- | ---------------- | ------ | ------ | -------------------- |
| `id`           | int unsigned  PK | 否     | 自增   | 主键                 |
| `aid`          | int(11)          | 否     |        | 关联文章ID（外键）   |
| `file_name`    | varchar(250)     | 是     | ''     | 文件名称             |
| `file_version` | varchar(255)     | 是     | NULL   | 文件版本             |
| `file_link`    | varchar(250)     | 是     | ''     | 文件链接             |
| `test1`        | text             | 是     | NULL   | 测试字段（示例单选） |

## 四、内容采集模块（2 张表）

### 4.1 plus_collect — 页面采集（爬虫）

**用途**：配置网页爬虫任务，通过 cheerio 解析 HTML 页面，批量采集文章内容。

**关系**：`cid → cms_category.id`（RESTRICT）

**特别注意**：`parse_data` 字段存储的是**可执行的 JavaScript 代码字符串**，运行时通过 `eval` / `new Function` 执行，用于清洗采集到的HTML内容。这是一个安全风险点，需要确保只有受信管理员可以配置采集任务。

| 字段名          | 类型              | 允许空 | 默认值            | 说明                                            |
| --------------- | ----------------- | ------ | ----------------- | ----------------------------------------------- |
| `id`          | int unsigned  PK  | 否     | 自增              | 任务ID                                          |
| `task_name`   | varchar(255)      | 是     | NULL              | 任务名称                                        |
| `target_url`  | varchar(255)      | 是     | NULL              | 采集目标地址                                    |
| `list_tag`    | varchar(255)      | 是     | NULL              | 列表选择器（CSS选择器，如 `#rm_topline a`）   |
| `start_num`   | int(11)           | 是     | 1                 | 开始页码                                        |
| `end_num`     | int(11)           | 是     | NULL              | 结束页码                                        |
| `increment`   | varchar(255)      | 是     | '1'               | 页码增量                                        |
| `title_tag`   | varchar(255)      | 是     | NULL              | 标题标签                                        |
| `article_tag` | varchar(255)      | 是     | NULL              | 文章内容选择器                                  |
| `charset`     | tinyint unsigned | 是     | NULL              | 编码(1-utf-8、2-gb2312)                         |
| `pages`       | text              | 是     | NULL              | 指定采集地址URL集合（JSON数组）                 |
| `parse_data`  | text              | 是     | NULL              | 数据格式化函数代码（JavaScript代码）            |
| `cid`         | int unsigned      | 否     |                   | 文章存入目标栏目ID（外键）→`cms_category.id` |
| `status`      | tinyint unsigned | 是     | '1'               | 发布状态（1-草稿、2-发布）                      |
| `created_at`  | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                                        |
| `updated_at`  | datetime          | 是     | 自动更新          | 更新时间                                        |

### 4.2 plus_gather — 接口采集

**用途**：配置 API 接口采集，调用第三方 API 获取数据并存入文章。

**关系**：`cid → cms_category.id`（RESTRICT）

**示例种子数据**：每日新闻60s — 调用 `api.qqsuu.cn` 接口获取新闻列表，通过 `parse_data` 中的函数转换格式后入库。

| 字段名         | 类型              | 允许空 | 默认值            | 说明                                            |
| -------------- | ----------------- | ------ | ----------------- | ----------------------------------------------- |
| `id`         | int unsigned  PK  | 否     | 自增              | 任务ID                                          |
| `task_name`  | varchar(255)      | 是     | NULL              | 任务名称                                        |
| `target_url` | varchar(255)      | 是     | NULL              | API接口地址                                     |
| `parse_data` | text              | 是     | NULL              | 数据转换解析脚本（JavaScript代码）              |
| `cid`        | int unsigned  FK  | 否     |                   | 文章存入目标栏目ID（外键）→`cms_category.id` |
| `status`     | tinyint unsigned | 是     | '1'               | 发布状态（1-草稿、2-发布）                      |
| `created_at` | datetime          | 是     | CURRENT_TIMESTAMP | 创建时间                                        |
| `updated_at` | datetime          | 是     | 自动更新          | 更新时间                                        |

---

## 五、RBAC 权限系统模块（5 张表）

基于经典的 **用户-角色-菜单** 五表设计，实现 RBAC（基于角色的访问控制）。

### 5.1 sys_user — 系统用户表

**关系**：

- 一对多 → `sys_user_role`（通过 user_id）
- 一对多 → `sys_login_log`（uid → 登录日志）

**种子数据**：

| id | username | 角色                |
| -- | -------- | ------------------- |
| 11 | 张三     | 超级管理员（super） |
| 12 | admin    | 游客（visitor）     |
| 14 | commoncms  | 超级管理员（super） |

| 字段名              | 类型                | 允许空 | 默认值 | 说明                       |
| ------------------- | ------------------- | ------ | ------ | -------------------------- |
| `id`              | int unsigned  PK    | 否     | 自增   | 用户ID                     |
| `username`        | varchar(30) UNIQUE | 否     |        | 登录账号（唯一）           |
| `nickname`        | varchar(30)         | 是     | ''     | 昵称                       |
| `password`        | varchar(80)         | 是     | ''     | 加密密码                   |
| `salt`            | varchar(20)         | 是     | ''     | 盐值（未使用）             |
| `avatar`          | varchar(100)        | 是     | ''     | 头像路径                   |
| `gender`          | tinyint unsigned   | 是     | '0'    | 性别（0-男、1-女、2-未知） |
| `email`           | varchar(50)         | 是     | ''     | 邮箱                       |
| `phone_number`    | varchar(11)         | 是     | ''     | 手机号                     |
| `login_ip`        | varchar(128)        | 是     | ''     | 最后登录IP                 |
| `login_date`      | datetime            | 是     | NULL   | 最后登录时间               |
| `create_by`       | varchar(64)         | 是     | ''     | 创建者                     |
| `create_at`       | datetime            | 是     | NULL   | 创建时间                   |
| `update_by`       | varchar(64)         | 是     | ''     | 更新者                     |
| `update_at`       | datetime            | 是     | NULL   | 更新时间                   |
| `pwd_update_date` | datetime            | 是     | NULL   | 密码最后修改时间           |
| `status`          | tinyint unsigned   | 是     | '0'    | 账号状态（0-正常、1-停用） |
| `remark`          | varchar(500)        | 是     | NULL   | 备注                       |

### 5.2 sys_role — 角色表

**关系**：

- 多对多 ↔ `sys_user`（通过 `sys_user_role`）
- 多对多 ↔ `sys_menu`（通过 `sys_role_menu`）

| 字段名        | 类型              | 允许空 | 默认值 | 说明                                                  |
| ------------- | ----------------- | ------ | ------ | ----------------------------------------------------- |
| `id`        | int unsigned  PK  | 否     | 自增   | 角色ID                                                |
| `name`      | varchar(30)       | 否     |        | 角色名称                                              |
| `key`       | varchar(100)      | 否     |        | 角色权限字符串（`super` / `admin` / `visitor`） |
| `sort`      | int(4)            | 否     |        | 显示顺序                                              |
| `status`    | tinyint unsigned | 否     | '1'    | 状态(1-正常、2-停用)                                  |
| `del_flag`  | tinyint unsigned | 是     | '1'    | 删除标志(1-存在、2-删除)                              |
| `create_by` | varchar(64)       | 是     | ''     | 创建者                                                |
| `create_at` | datetime          | 是     | NULL   | 创建时间                                              |
| `update_by` | varchar(64)       | 是     | ''     | 更新者                                                |
| `update_at` | datetime          | 是     | NULL   | 更新时间                                              |
| `remark`    | varchar(500)      | 是     | NULL   | 备注                                                  |

### 5.3 sys_menu — 菜单权限表（树形结构）

**用途**：存储后台管理系统的菜单和按钮权限，通过 `pid` 自关联形成树形结构。既是菜单导航也是权限定义。

**关系**：自关联 `pid → id`

**权限控制流程**：

1. JWT 认证通过后，查询用户角色（`sys_user_role`）
2. 通过角色查询拥有的菜单权限（`sys_role_menu`）
3. 根据请求的 `perms` 标识（如 `api:article:del`）校验是否在用户权限列表中
4. `type='F'` 的按钮级权限通常为隐藏路由，仅用于接口鉴权

| 字段名          | 类型              | 允许空 | 默认值 | 说明                                                                             |
| --------------- | ----------------- | ------ | ------ | -------------------------------------------------------------------------------- |
| `id`          | int unsigned  PK  | 否     | 自增   | 菜单ID                                                                           |
| `pid`         | int(11)           | 是     | 0      | 父菜单ID，0 为顶级                                                               |
| `title`       | varchar(50)       | 否     |        | 菜单名称                                                                         |
| `name`        | varchar(50)       | 是     | ''     | 路由名称（Vue Router name）                                                      |
| `order_num`   | int(4)            | 是     | 0      | 显示顺序                                                                         |
| `path`        | varchar(200)      | 是     | ''     | 路由地址                                                                         |
| `component`   | varchar(255)      | 是     | NULL   | 前端组件路径（如 `@/views/cms/article/index.vue`）                             |
| `icon`        | varchar(100)      | 是     | ''     | 菜单图标                                                                         |
| `query`       | varchar(255)      | 是     | NULL   | 路由参数                                                                         |
| `permissions` | varchar(100)      | 是     | ''     | **权限标识**（如 `api:article:del`）                                     |
| `type`        | tinyint unsigned | 是     | ''     | 菜单类型（**M**-目录、**C**-菜单（页面）、**F**-按钮（操作）） |
| `is_frame`    | tinyint unsigned | 是     | '2'    | 是否外链(1-是、2-否)                                                             |
| `is_cache`    | tinyint unsigned | 是     | '2'    | 是否缓存(1-缓存、2-不缓存)                                                       |
| `is_show`     | tinyint unsigned | 是     | '1'    | 是否显示(1-显示、2-隐藏)                                                         |
| `status`      | tinyint unsigned | 是     | NULL   | 状态(1-启用、2-停用)                                                             |
| `create_by`   | varchar(64)       | 是     | ''     | 创建者                                                                           |
| `create_at`   | datetime          | 是     | NULL   | 创建时间                                                                         |
| `update_by`   | varchar(64)       | 是     | ''     | 更新者                                                                           |
| `update_at`   | datetime          | 是     | NULL   | 更新时间                                                                         |
| `remark`      | varchar(500)      | 是     | ''     | 备注                                                                             |

**菜单树示例**：

```
网站信息 (id:5, type:C) — 仪表盘
站点管理 (id:6, type:M)
  └─ 站点设置 (id:7, type:C)
  └─ 站点更新 (id:83, type:F)  [隐藏按钮]
内容管理 (id:8, type:M)
  ├─ 栏目管理 (id:9, type:C)
  │   ├─ 栏目新增 (id:10, type:C) [隐藏页面]
  │   ├─ 栏目修改 (id:11, type:C) [隐藏页面]
  │   ├─ 栏目删除 (id:12, type:F) [按钮权限]
  │   └─ 栏目查询 (id:13, type:F) [按钮权限]
  ├─ 文章管理 (id:14, type:C) ...CRUD按钮
  ├─ 轮播管理 (id:19, type:C) ...CRUD按钮
  ├─ 标签管理 (id:24, type:C) ...CRUD按钮
  ├─ 碎片管理 (id:29, type:C) ...CRUD按钮
  ├─ 友情链接 (id:56, type:C) ...CRUD按钮
  └─ 消息管理 (id:61, type:C) ...CRUD按钮
功能管理 (id:45, type:M)
  ├─ 页面采集 (id:35, type:C) ...CRUD按钮
  ├─ 接口采集 (id:40, type:C) ...CRUD按钮
  └─ 模型管理 (id:46, type:C)
      └─ 字段管理 (id:51, type:C) ...CRUD按钮
系统管理 (id:66, type:M)
  ├─ 用户管理 (id:67, type:C) ...CRUD按钮
  ├─ 角色管理 (id:72, type:C) ...CRUD按钮
  ├─ 菜单管理 (id:77, type:C) ...CRUD按钮
  ├─ 登录日志 (id:82, type:C)
  └─ 配置字典 (id:84, type:C)
      └─ 配置列表 (id:85, type:C) [隐藏页面]
```

---

### 5.4 sys_user_role — 用户-角色中间表

**关系**：联合主键 `(user_id, role_id)`

| 字段名      | 类型            | 允许空 | 默认值 | 说明                                 |
| ----------- | --------------- | ------ | ------ | ------------------------------------ |
| `user_id` | int unsigned PK | 否     |        | 用户ID →` sys_user.id`（CASCADE） |
| `role_id` | int unsigned PK | 否     |        | 角色ID →` sys_role.id`           |

---

### 5.5 sys_role_menu — 角色-菜单关联表

**关系**：联合主键 `(role_id `, `menu_id `)

| 字段名      | 类型            | 允许空 | 默认值 | 说明                                                |
| ----------- | --------------- | ------ | ------ | --------------------------------------------------- |
| `role_id` | int unsigned PK | 否     |        | 角色ID →`sys_role.id`（CASCADE）                |
| `menu_id` | int unsigned PK | 否     |        | 菜单ID →`sys_menu.id`（无外键约束，仅普通字段） |

---

## 六、系统配置模块（2 张表）

### 6.1 sys_config_type — 配置类型表

**用途**：定义配置分组（如微信小程序配置、七牛云配置等）。

**关系**：一对多 → `sys_config.type_code`（CASCADE，删除类型时联动删除配置项）

| 字段名        | 类型                | 允许空 | 默认值            | 说明                                                                |
| ------------- | ------------------- | ------ | ----------------- | ------------------------------------------------------------------- |
| `id`        | int unsigned  PK    | 否     | 自增              | 主键                                                                |
| `type_code` | varchar(50) UNIQUE | 否     |                   | 类型标识(唯一、如 `wechat_minip`、`qiniu_oss`、`cms_config`） |
| `type_name` | varchar(50)         | 否     |                   | 类型名称                                                            |
| `status`    | tinyint unsigned    | 否     | 1                 | 是否启用(1-启用、2-停用)                                            |
| `remark`    | varchar(255)        | 是     | NULL              | 备注                                                                |
| `create_at` | datetime            | 否     | CURRENT_TIMESTAMP | 创建时间                                                            |
| `update_at` | datetime            | 否     | 自动更新          | 更新时间                                                            |

---

### 6.2 sys_config — 系统配置表

**用途**：键值对形式的系统配置项。

**关系**：`type_code → sys_config_type.type_code`（CASCADE + UNIQUE 约束）

| 字段名           | 类型              | 允许空 | 默认值            | 说明                 |
| ---------------- | ----------------- | ------ | ----------------- | -------------------- |
| `id`           | int unsigned  PK  | 否     | 自增              | 主键                 |
| `type_code`    | varchar(50)       | 否     |                   | 配置类型标识（外键） |
| `config_key`   | varchar(100)      | 否     |                   | 配置键(唯一)         |
| `config_value` | text              | 否     |                   | 配置值               |
| `status`       | tinyint unsigned | 否     | '1'               | 状态(1启用 2关闭)    |
| `create_at`    | datetime          | 否     | CURRENT_TIMESTAMP | 创建时间             |
| `update_at`    | datetime          | 否     | 自动更新          | 更新时间             |
| `remark`       | varchar(255)      | 是     | NULL              | 备注                 |

---

## 七、审计日志模块（2 张表）

### 7.1 `sys_login_log — 登录日志表`

**关系**：`uid → sys_user.id`

**设计说明**：此表用于安全审计，每次用户登录时记录IP和地理位置信息（通过IP地址库解析）。已累积 100+ 条记录。

| 字段名         | 类型             | 允许空 | 默认值            | 说明                                        |
| -------------- | ---------------- | ------ | ----------------- | ------------------------------------------- |
| `id`         | int unsigned  PK | 否     | 自增              | 日志ID                                      |
| `uid`        | int unsigned FK  | 否     |                   | 用户ID（外键）→`sys_user.id`（RESTRICT） |
| `ip`         | varchar(45)      | 是     | NULL              | 登录IP地址                                  |
| `country`    | varchar(50)      | 是     | NULL              | 国家                                        |
| `province`   | varchar(50)      | 是     | NULL              | 省份                                        |
| `city`       | varchar(50)      | 是     | NULL              | 城市                                        |
| `district`   | varchar(50)      | 是     | NULL              | 区县                                        |
| `isp`        | varchar(50)      | 是     | NULL              | 网络运营商                                  |
| `lat`        | varchar(15)      | 是     | NULL              | 纬度                                        |
| `lng`        | varchar(15)      | 是     | NULL              | 经度                                        |
| `created_at` | datetime         | 是     | CURRENT_TIMESTAMP | 登录时间                                    |

### 7.2 sys_notice — 通知公告表

| 字段名        | 类型             | 允许空 | 默认值            | 说明                 |
| ------------- | ---------------- | ------ | ----------------- | -------------------- |
| `id`        | int unsigned  PK | 否     | 自增              | 公告ID               |
| `title`     | varchar(50)      | 否     |                   | 公告标题             |
| `type`      | tinyint unsigned | 否     | 1                 | 类型(1-通知、2-公告) |
| `content`   | longtext         | 否     |                   | 公告内容             |
| `status`    | tinyint unsigned | 否     | 1                 | 状态(0-关闭、1-正常) |
| `remark`    | varchar(255)     | 是     | NULL              | 备注                 |
| `create_at` | datetime         | 否     | CURRENT_TIMESTAMP | 创建时间             |
| `update_at` | datetime         | 否     | 自动更新          | 更新时间             |

**关系**：独立表，当前无数据。

## 八、会员系统模块（7 张表）

这是一个**完整的付费会员系统**雏形，包含用户、会员等级、产品、订单、阅读记录、第三方登录等功能。

### 8.1 user — 会员表（C端用户）

**用途**：前端网站注册用户，区别于后台 `sys_user`。

**关系**：

- 一对一 → `user_levelship`
- 一对多 → `user_order`
- 一对多 → `user_reading_record`
- 一对多 → `user_social_login`

| 字段名              | 类型                | 允许空 | 默认值            | 说明                      |
| ------------------- | ------------------- | ------ | ----------------- | ------------------------- |
| `id`              | int unsigned  PK    | 否     | 自增              | 用户ID                    |
| `username`        | varchar(50) UNIQUE | 是     | NULL              | 用户名(唯一)              |
| `password`        | varchar(100)        | 是     | NULL              | 密码                      |
| `gender`          | tinyint unsigned   | 是     | '0'               | 性别(0-未知 、1-男、2-女) |
| `email`           | varchar(255)        | 是     | NULL              | 邮箱                      |
| `phone_number`    | varchar(20)         | 是     | NULL              | 手机号                    |
| `avatar`          | varchar(255)        | 是     | NULL              | 头像                      |
| `login_ip`        | varchar(255)        | 是     | NULL              | 登录IP                    |
| `login_date`      | datetime            | 是     | 自动更新          | 最后登录时间              |
| `pwd_update_date` | datetime            | 是     | 自动更新          | 密码最后修改时间          |
| `created_at`      | datetime            | 是     | CURRENT_TIMESTAMP | 注册日期                  |
| `updated_at`      | datetime            | 是     | 自动更新          | 更新时间                  |
| `remark`          | varchar(255)        | 是     | NULL              | 备注                      |

---

### 8.2 user_level — 会员等级表

| 字段名         | 类型               | 允许空 | 默认值 | 说明                                                                  |
| :------------- | ------------------ | ------ | ------ | --------------------------------------------------------------------- |
| `id`         | int unsigned  PK   | 否     | 自增   | 等级ID                                                                |
| `level_code` | varchar(20) UNIQUE | 是     | NULL   | 等级代码(唯一：super0-注册 super1-月 super2-季 super3-年 super9-永久) |
| `level_name` | varchar(50)        | 是     | NULL   | 等级显示名称                                                          |
| `days_valid` | int(11)            | 是     | NULL   | 有效天数(null表示永久)                                                |

---

### 8.3 user_level_ship — 会员-等级关联表

|     字段名     | 类型         | 允许空 | 默认值 | 说明                         |
| :------------: | ------------ | ------ | ------ | ---------------------------- |
|  `user_id`  | int unsigned | 否     |        | 用户ID →` user.id`       |
|  `level_id`  | int unsigned | 否     |        | 等级ID →` user_level.id` |
| `start_date` | datetime     | 否     |        | 开始日期                     |
|  `end_date`  | datetime     | 否     |        | 结束日期                     |

---

### 8.4 user_product — 会员产品表

**用途**：可购买的会员产品。

| 字段名            | 类型             | 允许空 | 默认值 | 说明                                  |
| ----------------- | ---------------- | ------ | ------ | ------------------------------------- |
| `id`            | int unsigned  PK | 否     | 自增   | 产品ID                                |
| `name`          | varchar(50)      | 否     |        | 产品名称                              |
| `price`         | decimal(10,2)    | 否     |        | 价格                                  |
| `level_id`      | int unsigned     | 否     |        | 关联等级ID(外键) →`user_level.id` |
| `duration_days` | int(11)          | 是     | NULL   | 有效天数                              |
| `description`   | text             | 是     | NULL   | 产品描述                              |
| `status`        | tinyint unsigned | 否     | 1      | 状态(1-启用、2-停用)                  |

---

### 8.5 user_order — 订单表

| 字段名             | 类型             | 允许空 | 默认值            | 说明                                             |
| ------------------ | ---------------- | ------ | ----------------- | ------------------------------------------------ |
| `id`             | int unsigned  PK | 否     | 自增              | 订单ID                                           |
| `user_id`        | int(11) FK       | 否     |                   | 用户ID(外键) →` user.id`                     |
| `order_no`       | varchar(50)      | 否     |                   | 订单号(唯一)                                     |
| `product_id`     | int(11) FK      | 否     |                   | 产品ID(外键) →`user_product.id`              |
| `amount`         | decimal(10,2)    | 否     |                   | 金额                                             |
| `payment_method` | tinyint unsigned | 否     | 1                 | 支付方式(1-支付宝、2-微信)                       |
| `status`         | tinyint unsigned | 否     | 1                 | 订单状态(1-待支付、2-已支付、3-已过期、4-已退款) |
| `created_at`     | datetime         | 是     | CURRENT_TIMESTAMP | 创建时间                                         |
| `paid_at`        | datetime         | 是     | NULL              | 支付时间                                         |

---

### 8.6 user_reading_record — 阅读记录表

**关系**：连接 C端用户 和 CMS文章，可用于做阅读历史和内容推荐。

| 字段名         | 类型             | 允许空 | 默认值            | 说明                         |
| -------------- | ---------------- | ------ | ----------------- | ---------------------------- |
| `id`         | int unsigned  PK | 否     | 自增              | 记录ID                       |
| `user_id`    | int(11) FK       | 否     |                   | 用户ID →`user.id`         |
| `article_id` | int(11) FK       | 否     |                   | 文章ID →`cms_article.id` |
| `read_time`  | datetime         | 是     | CURRENT_TIMESTAMP | 阅读时间                     |

---

### 8.7 user_social_login — 第三方登录表

**关系**：`(platform, openid)` 联合唯一索引。

| 字段名         | 类型             | 允许空 | 默认值            | 说明                                   |
| -------------- | ---------------- | ------ | ----------------- | -------------------------------------- |
| `id`         | int unsigned  PK | 否     | 自增              | 记录ID                                 |
| `user_id`    | int(11)          | 否     |                   | 用户ID(外键) →`user.id`（CASCADE） |
| `platform`   | varchar(20)      | 否     |                   | 平台(wechat/qq)                        |
| `openid`     | varchar(255)     | 否     |                   | 平台openid                             |
| `unionid`    | varchar(255)     | 是     | NULL              | 微信 UnionID（跨应用）                 |
| `created_at` | datetime         | 是     | CURRENT_TIMESTAMP | 创建时间                               |

---

## 九、核心关系总结

| 关系                           | 说明                                                                  |
| ------------------------------ | --------------------------------------------------------------------- |
| **栏目 → 文章**         | `cms_category.id` ← `cms_article.cid` (一对多)                   |
| **文章 ↔ 标签**         | 通过 `cms_article_tag` 实现多对多                                   |
| **模型 → 字段**         | `cms_model.id` ← `cms_field.mid` (一对多)                        |
| **栏目 → 模型**         | `cms_category.mid` → `cms_model.id`                              |
| **扩展表 → 文章**       | `extend_model_download.aid` → `cms_article.id`                   |
| **用户 ↔ 角色**         | `sys_user_role` 关联 `sys_user` 和 `sys_role`                   |
| **角色 ↔ 菜单**         | `sys_role_menu` 关联 `sys_role` 和 `sys_menu`                   |
| **配置类型 → 配置项**   | `sys_config_type.type_code` ← `sys_config.type_code`             |
| **会员 → 等级**         | `user_level_ship` 关联 `user` 和 `user_level`                   |
| **订单 → 产品 → 等级** | `user_order.product_id` → `user_product.id` → `user_level.id` |

---

## 十、外键约束汇总

| 子表                    | 外键字段       | 父表                | 父表字段      | 删除规则          | 更新规则 |
| ----------------------- | -------------- | ------------------- | ------------- | ----------------- | -------- |
| `cms_article`         | `cid`        | `cms_category`    | `id`        | RESTRICT          | RESTRICT |
| `cms_articletag`      | `aid`        | `cms_article`     | `id`        | RESTRICT          | RESTRICT |
| `cms_articletag`      | `tid`        | `cms_tag`         | `id`        | RESTRICT          | RESTRICT |
| `cms_field`           | `mid`        | `cms_model`       | `id`        | **CASCADE** | CASCADE  |
| `ext_download`        | `aid`        | `cms_article`     | `id`        | RESTRICT          | RESTRICT |
| `plus_collect`        | `cid`        | `cms_category`    | `id`        | RESTRICT          | RESTRICT |
| `plus_gather`         | `cid`        | `cms_category`    | `id`        | RESTRICT          | RESTRICT |
| `sys_config`          | `type_code`  | `sys_config_type` | `type_code` | **CASCADE** | RESTRICT |
| `sys_loginlog`        | `uid`        | `sys_user`        | `id`        | RESTRICT          | RESTRICT |
| `sys_role_menu`       | `role_id`    | `sys_role`        | `id`        | **CASCADE** | RESTRICT |
| `sys_role_menu`       | `menu_id`    | `sys_menu`        | `id`        | **CASCADE** | RESTRICT |
| `sys_user_role`       | `user_id`    | `sys_user`        | `id`        | **CASCADE** | RESTRICT |
| `user_levelship`      | `user_id`    | `user`            | `id`        | RESTRICT          | RESTRICT |
| `user_levelship`      | `level_id`   | `user_level`      | `id`        | RESTRICT          | RESTRICT |
| `user_order`          | `user_id`    | `user`            | `id`        | RESTRICT          | RESTRICT |
| `user_order`          | `product_id` | `user_product`    | `id`        | RESTRICT          | RESTRICT |
| `user_product`        | `level_id`   | `user_level`      | `id`        | RESTRICT          | RESTRICT |
| `user_reading_record` | `user_id`    | `user`            | `id`        | RESTRICT          | RESTRICT |
| `user_reading_record` | `article_id` | `cms_article`     | `id`        | RESTRICT          | RESTRICT |
| `user_social_login`   | `user_id`    | `user`            | `id`        | **CASCADE** | CASCADE  |

**删除规则总结**：

- **CASCADE（6处）**：删除模型时联动删除字段定义；删除配置类型时联动删除配置项；删除角色时联动删除角色-菜单关联；删除菜单时联动删除角色-菜单关联；删除用户时联动删除用户角色关联和社会登录记录。
- **RESTRICT（13处）**：大部分核心业务表使用 RESTRICT，防止误删有关联数据的记录。

---
