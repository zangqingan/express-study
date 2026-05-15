import { prisma } from '../config/database.js'

export interface LoginLogQuery {
  page: number
  pageSize: number
  username?: string
  startDate?: string
  endDate?: string
}

export async function findMany(query: LoginLogQuery) {
  const { page, pageSize, username, startDate, endDate } = query

  const where: Record<string, unknown> = {}

  if (username) {
    where.sys_user = { username: { contains: username } }
  }

  if (startDate || endDate) {
    const created_at: Record<string, Date> = {}
    if (startDate) created_at.gte = new Date(startDate)
    if (endDate) {
      // Include the entire end date by setting time to end of day
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      created_at.lte = end
    }
    if (Object.keys(created_at).length > 0) {
      where.created_at = created_at
    }
  }

  const [list, total] = await Promise.all([
    prisma.sys_login_log.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      include: {
        sys_user: {
          select: { username: true, nickname: true },
        },
      },
    }),
    prisma.sys_login_log.count({ where }),
  ])

  return { list, total }
}

export async function remove(id: number) {
  return prisma.sys_login_log.delete({
    where: { id },
  })
}

export async function findById(id: number) {
  return prisma.sys_login_log.findUnique({
    where: { id },
    include: {
      sys_user: {
        select: { username: true, nickname: true },
      },
    },
  })
}
