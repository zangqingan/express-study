import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { config } from './index.js'

const adapter = new PrismaMariaDb(config.database.url)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (config.env !== 'production') {
  globalForPrisma.prisma = prisma
}
