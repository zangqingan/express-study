# 内容管理系统（CMS）技术设计文档

**版本**：1.1
**日期**：2026-05-14
**关联文档**：[PRD.md](./PRD.md) | [数据库设计](./database_design.md)

---

## 1. 总体技术架构

系统采用 **前后端分离** 架构，前端分为两个独立应用：

- **前台门户**：面向游客和会员，需兼顾 SEO 和首屏性能，推荐使用 **SSR（服务端渲染）** 方案（Nuxt 3）。
- **后台管理**：面向管理员，采用 SPA 单页应用，注重交互体验和开发效率（Vue 3 + TS +  Vite）。

后端采用 **原生 Express5.x** 框架 + TS开发，提供 RESTful API 接口，包括认证鉴权、数据校验、安全、日志记录、ORM、文件上传、任务队列与消息、 进程管理和部署、开发工具与代码质量、测试、环境配置、api文档等功能。

缓存使用redis、数据库为 MySQL 8.0。

整体架构图：
┌─────────────────────────────────────────────────────────┐
│ CDN（静态资源） │
└─────────────────────────────────────────────────────────┘
│
┌──────────────┐ ┌───────────────┐ ┌───────────────┐
│ 前台 SSR │ │ 后台 SPA │ │ 移动端/其它 │
│ (Nuxt 3) │ │ (Vue 3) │ │ (预留接口) │
└──────┬───────┘ └───────┬───────┘ └───────┬───────┘
│ │ │
└───────────────────┼───────────────────┘
│
┌──────────▼──────────┐
│ API 网关 / 负载均衡 │
└──────────┬──────────┘
│
┌──────────▼──────────┐
│ 原生 Express 服务 │
│ (RESTful API) │
└──────────┬──────────┘
│
┌─────────────────┼─────────────────┐
│ │ │
┌────▼────┐ ┌─────▼─────┐ ┌─────▼─────┐
│ MySQL │ │ Redis │ │ 七牛云OSS │
│ (主库) │ │ (缓存) │ │ (图片/文件)│
└─────────┘ └───────────┘ └───────────┘

---

## 2. 前端技术栈（核心）

### 2.1 统一技术选型原则

- **语言**：TypeScript 5.x，严格模式，提供类型安全。
- **UI 库**：Naive UI（基于 Vue 3，组件丰富，主题可定制，TypeScript 友好）。
- **构建工具**：Vite 5.x，极速热更新，按需编译。
- **包管理工具**：pnpm（节省磁盘空间，快速安装）。
- **代码规范**：ESLint + Prettier + Husky + lint-staged。

### 2.2 前台门户（面向 C 端）

| 技术项               | 选型                                  | 说明                                                                        |
| -------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| **SSR 框架**   | Nuxt 3.12+                            | 基于 Vue 3 的元框架，支持服务端渲染、静态生成、SEO 友好。                   |
| **UI 组件**    | Naive UI + Tailwind CSS               | Naive UI 用于后台风格，前台使用 Tailwind 快速定制响应式界面。               |
| **状态管理**   | Pinia                                 | 轻量级，与 Vue 3 完美集成，管理用户登录状态、购物车（若有）等。             |
| **数据请求**   | `$fetch` (ofetch)                   | Nuxt 内置，支持 SSR 服务端请求直出。                                        |
| **路由**       | Nuxt 文件系统路由                     | 自动基于 `pages/` 目录生成，支持动态路由、嵌套路由。                      |
| **SEO**        | `@nuxtjs/seo` 套件                  | 自动管理 title、meta、canonical 等，配合数据库 `cms_site` 中的 SEO 配置。 |
| **图片优化**   | `@nuxt/image`                       | 自动压缩、响应式图片、懒加载。                                              |
| **富文本渲染** | `@nuxt/content` (可选) 或 DOMPurify | 安全渲染后台富文本内容（防 XSS）。                                          |
| **移动端适配** | 响应式布局 +`@nuxtjs/device`        | 检测设备类型，针对性优化。                                                  |

**关键说明**：

- 由于需要 SEO，必须使用 SSR 模式（`ssr: true`），部署时使用 Node.js 服务器（如 PM2 守护）或采用边缘渲染（Cloudflare Workers）。
- 静态资源（图片、CSS、JS）上传至七牛云 OSS，并通过 CDN 加速。

### 2.3 后台管理（面向管理员）

| 技术项                  | 选型                              | 说明                                                             |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------- |
| **核心框架**      | Vue 3.4+ (Composition API)        | 使用 `<script setup>` 语法，提高可读性。                       |
| **构建工具**      | Vite 5.x                          | 快速开发，按需编译。                                             |
| **UI 组件库**     | Naive UI                          | 提供表格、表单、弹窗、通知、数据可视化等丰富组件。               |
| **状态管理**      | Pinia                             | 管理管理员登录信息、菜单权限、系统配置等。                       |
| **路由**          | Vue Router 4                      | 动态路由基于后端返回的菜单树（`sys_menu`）生成，支持权限控制。 |
| **HTTP 请求**     | Axios                             | 拦截器统一处理 Token、错误提示、请求重试。                       |
| **富文本编辑器**  | Tinymce 6（或 WangEditor）        | 支持图片上传（七牛云/本地）。                                    |
| **图表库**        | ECharts 5                         | 仪表盘数据可视化（文章趋势、会员增长等）。                       |
| **表格/表单增强** | Naive UI 原生 + vxe-table（可选） | 处理大量数据时使用虚拟滚动表格。                                 |
| **权限控制**      | 自定义指令 `v-permission`       | 基于 `sys_menu.permissions` 控制按钮级显隐。                   |

**关键说明**：

- 后台无需 SEO，因此采用纯 SPA 模式，部署为静态文件 + Nginx 代理。
- 动态模型字段渲染：基于 `cms_field` 数据动态生成表单（使用 Naive UI 的动态组件机制）。

---

## 3. 后端技术栈（原生 Express）

后端基于 **原生 Express**，不依赖任何上层框架（如 Nest、Loopback），保持轻量、可控、高性能。

### 3.1 核心技术选型

| 技术项               | 选型                                        | 说明                                                        |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| **运行时**     | Node.js 20.16 LTS+                          | 稳定、性能良好。                                            |
| **Web 框架**   | Express 5.x+                                | 原生、中间件生态丰富、完全自主可控。                        |
| **数据库+ORM** | `prisma + mysql`                          |                                                             |
| **缓存**       | `ioredis`                                 | Redis 客户端，支持 Cluster 和 Sentinel。                    |
| **身份认证**   | `jsonwebtoken` + `bcryptjs`             | 无状态认证，token 存储于客户端（localStorage / cookie）。   |
| **参数校验**   | `joi` 或 `express-validator`            | 验证请求参数，保证数据完整性。                              |
| **文件上传**   | `multer` + `qiniu` SDK                  | 本地存储或七牛云，根据 `cms_site.upload_way` 动态选择。   |
| **采集执行**   | `cheerio` + `axios` + `vm2`           | 解析 HTML；`vm2` 沙箱执行用户自定义 `parse_data` 脚本。 |
| **定时任务**   | `node-cron`                               | 用于采集任务定时执行、会员等级过期扫描。                    |
| **日志**       | `winston` + `express-winston`           | 记录 API 请求、错误日志。                                   |
| API管理              | `swagger-jsdoc` 和 `swagger-ui-express` | 为 RESTful API 自动生成交互式文档                           |
| **进程管理**   | PM2                                         | 生产环境守护进程，支持集群模式。                            |

### 3.2 项目结构（MVC 风格）

backend/
├── public/                        # 静态资源
├── prisma/                    # Prisma 相关文件
│ ├── schema.prisma              # 数据模型定义
│ └── migrations/                   # 数据库迁移文件
├── src/                           # 源代码
│   ├── app.ts                     # Express 应用入口（挂载所有中间件与路由）
│   ├── bin/
│   │   └── www                    # 启动脚本（可被 PM2 调用）
│   ├── config/                    # 集中配置文件
│   │   ├── index.ts               # 配置入口，按环境加载
│   │   ├── database.ts            # Prisma / 数据库连接配置
│   │   ├── redis.ts               # Redis 连接配置
│   │   ├── qiniu.ts               # 七牛云配置
│   │   ├── logger.ts              # Winston 日志实例
│   │   └── passport.ts            # Passport 策略初始化
│   ├── controllers/               # 控制器层（只处理请求/响应）
│   │   ├── articleController.ts
│   │   ├── categoryController.ts
│   │   ├── authController.ts      # 登录、注册等
│   │   └── ...
│   ├── middleware/                # 自定义中间件
│   │   ├── auth.ts                # JWT 认证（Passport）
│   │   ├── rbac.ts                # 角色权限校验
│   │   ├── upload.ts              # 文件上传处理（Multer）
│   │   ├── validate.ts            # 请求数据校验（Joi）
│   │   ├── rateLimiter.ts         # 接口频率限制
│   │   └── errorHandler.ts        # 全局错误处理
│   ├── routes/                    # 路由定义
│   │   ├── index.ts               # 路由汇总
│   │   └── api/
│   │       └── v1/
│   │           ├── article.ts
│   │           ├── category.ts
│   │           ├── auth.ts
│   │           └── ...
│   ├── services/                  # 业务逻辑层
│   │   ├── articleService.ts
│   │   ├── categoryService.ts
│   │   └── authService.ts
│   ├── validations/               # 输入校验 Schema（Joi）
│   │   ├── article.validation.ts
│   │   ├── auth.validation.ts
│   │   └── ...
│   ├── utils/                     # 通用工具
│   │   ├── crypto.ts              # 加密/解密
│   │   ├── response.ts            # 统一响应格式
│   │   └── asyncHandler.ts        # 异步错误捕获包装器
│   ├── jobs/                      # 后台任务（BullMQ）
│   │   └── email.job.ts
│   ├── logs/                      # 日志文件存储目录
├── .env                       # 环境变量
├── .env.example               # 环境变量模板（可提交）
├── package.json
├── tsconfig.json              # TypeScript 配置（如使用 TS）
└── ecosystem.config.js        # PM2 配置

### 3.3 核心代码示例

中间件鉴权（middleware/auth.js）：

```js
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 401, msg: '未授权' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, msg: 'token 无效' });
  }
};
```

API 统一响应格式：

```js
// utils/response.js
const success = (res, data, msg = 'success') => {
  res.json({ code: 0, msg, data });
};
const error = (res, msg = 'error', code = 1) => {
  res.json({ code, msg });
};
module.exports = { success, error };
```

## 4. 数据库与存储

### 4.1 关系数据库 (MySQL)

* 采用提供的 `common_cms` 数据库（30 张表）。
* 字符集：`utf8mb4`，支持完整 Unicode（如表情符号）。
* 读写分离：初期单库，后期可考虑主从。

### 4.2 缓存策略 (Redis)

| 缓存内容                  | 过期策略               | 说明                       |
| ------------------------- | ---------------------- | -------------------------- |
| 站点配置 (`cms_site`)   | 永久，主动更新时失效   | 避免每次请求查询数据库。   |
| 栏目树 (`cms_category`) | 1 小时，更新栏目时删除 | 用于前台导航菜单。         |
| 文章详情 (HTML)           | 30 分钟                | 高并发下减少数据库压力。   |
| 用户会话 (Token 黑名单)   | 7 天                   | 用于登出、密码修改后失效。 |

### 4.3 对象存储 (OSS)

* **供应商** ：七牛云（已有配置）。
* **用途** ：文章缩略图、轮播图、碎片图片、采集远程图片、下载模型文件。
* **URL 风格** ：绑定自定义域名（如 `cdn.example.com`）。

---

## 5. 工程化与部署

### 5.1 前端工程化

**项目结构** (Monorepo 推荐)：
frontend/
├── apps/
│   ├── web/            # 前台门户 (Nuxt 3)
│   ├── admin/          # 后台管理 (Vue 3 + Vite)
│   └── shared/         # 共享组件/类型/工具 (workspace package)
├── packages/
│   ├── types/          # 全局 TypeScript 类型定义 (对应数据库模型)
│   ├── utils/          # 公共函数 (如日期格式化)
│   └── api/            # 自动生成的 API 客户端 (基于 OpenAPI/Swagger)
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json

 **关键配置** ：

* 使用 `unplugin-auto-import` 自动引入 Vue、Naive UI 的 API。
* 后台使用 `unplugin-vue-components` 按需加载 Naive UI 组件。
* 前台使用 Nuxt 的 `modules` 集成 Naive UI（需额外配置，或直接使用 Tailwind）。

### 5.2 部署方案

| 应用            | 部署方式                                 | 建议主机           |
| --------------- | ---------------------------------------- | ------------------ |
| 前台 SSR (Nuxt) | Node.js 服务 (PM2 集群) + Nginx 反向代理 | 云服务器 (4C8G+)   |
| 后台 SPA        | 构建为静态文件 → 上传至 OSS + CDN       | 七牛云静态托管     |
| 后端 API        | Node.js 服务 (PM2 集群) + Nginx 代理     | 同前台服务器或独立 |
| MySQL           | 云数据库 RDS 或自建                      | 阿里云/腾讯云      |
| Redis           | 云 Redis 或 Docker 自建                  | 与后端同内网       |

 **CI/CD** ：使用 GitLab CI / GitHub Actions，自动执行测试、构建、部署。

---

## 6. 性能与安全设计

### 6.1 性能优化

* **前端** ：
* 前台：SSR 直出 + 静态资源 CDN + 组件懒加载。
* 后台：路由懒加载、Naive UI 按需引入、使用虚拟列表处理长表格。
* **后端** ：
* API 接口响应数据使用 Redis 缓存（如文章列表、栏目树）。
* 数据库查询添加合适索引（已在 SQL 中定义）。

### 6.2 安全措施

| 方面                   | 实现                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| **XSS 防御**     | 后台富文本输出时使用 DOMPurify 清洗；前台展示内容转义。                 |
| **CSRF 防护**    | 使用 SameSite Cookie + Token 双重验证（或采用 JWT +`csrf`包）。       |
| **SQL 注入**     | 强制使用 `mysql2`预处理语句（`execute`方法）。                      |
| **接口限流**     | `express-rate-limit`，防止暴力破解和 DDoS。                           |
| **敏感数据**     | 密码 Bcrypt 加密（强度 10）；JWT secret 环境变量存储。                  |
| **采集脚本沙箱** | 使用 `vm2`或 `isolated-vm`限制系统权限，禁止 `require`和 `fs`。 |

---

## 7. 开发规范与工具

### 7.1 代码规范

* **ESLint** ：配置 `@antfu/eslint-config` 或自定义 Vue + TypeScript 规则。
* **Prettier** ：统一代码格式，集成到 ESLint。
* **Commitlint** ：使用 Conventional Commits（`feat`, `fix`, `docs`...）。
* **Husky + lint-staged** ：提交前自动格式化并 lint。

### 7.2 API 文档与类型生成

* 后端使用 Swagger (OpenAPI 3.0) 注解生成 API 文档（推荐 `swagger-jsdoc` + `swagger-ui-express`）。
* 使用 `openapi-typescript` 和 `openapi-fetch` 自动生成前端 TypeScript 类型定义及请求客户端，保证前后端接口一致性。

### 7.3 测试策略

| 层级     | 工具               | 覆盖范围                              |
| -------- | ------------------ | ------------------------------------- |
| 单元测试 | Vitest             | 前端组件、工具函数；后端 service 层。 |
| 集成测试 | Supertest + Vitest | API 接口（数据库/Redis 真实调用）。   |
| E2E 测试 | Playwright         | 关键业务流程（文章发布、下单支付）。  |

---

## 8. 附加推荐（可选）

* **前端监控** ：Sentry (错误追踪) + 百度统计 (流量分析)。
* **日志聚合** ：ELK Stack (Elasticsearch, Logstash, Kibana) 或 阿里云日志服务。
* **Docker 化** ：提供 `Dockerfile` 和 `docker-compose.yml`，便于快速部署和环境统一。

---

## 9. 技术风险与应对

| 风险                                  | 应对方案                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Nuxt 3 SSR 服务器负载高               | 采用 PM2 集群模式，配合 CDN 缓存静态内容；必要时迁移至 Serverless（如 Vercel、阿里云函数计算）。                       |
| 动态模型字段的 DDL 变更复杂           | 使用数据库迁移脚本（原生 SQL 或 `knex`迁移），并通过事务保证一致性；提供模型字段可视化编辑器，仅允许超级管理员操作。 |
| 采集脚本安全漏洞                      | 严格使用沙箱，限制执行时间和内存；仅允许预定义白名单函数；采集规则编辑需二次确认。                                     |
| 原生 Express 缺少结构约束，代码易混乱 | 严格遵循 MVC 目录结构，强制业务逻辑放于 services 层；使用代码审查（Code Review）保证质量。                             |

---

## 10. 总结

本技术设计采用 **Vue 3 + TypeScript + Naive UI** 作为前端核心栈，前台借助 Nuxt 3 实现 SSR 满足 SEO，后台使用 Vite + SPA 保证开发体验。后端采用 **原生 Express** + TS + prisma+mysql，保持轻量、透明、高性能，工程化方面引入 Monorepo、自动化工具和测试体系，保障团队协作和长期维护。
