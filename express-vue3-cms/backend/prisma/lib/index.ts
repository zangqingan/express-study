/** 
 * 实例化 PrismaClient 实例，并导出以供全局使用。
 * 这里我们使用了 PrismaMariaDb 适配器来连接 MySQL/MariaDB 数据库。
 * 如果你使用的是 PostgreSQL，可以安装 @prisma/adapter-postgres 并导入 PrismaPostgres 替换 PrismaMariaDb。
 */

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };