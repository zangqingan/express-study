import { prisma } from '../config/database.js'

/**
 * Message type values:
 *   0 — pending (待审核)
 *   1 — approved / published (已通过)
 *   2 — rejected (已拒绝)
 */

/** Public list — only show approved messages */
export async function list() {
  return prisma.cms_message.findMany({
    where: { type: 1 },
    orderBy: { created_at: 'desc' },
  })
}

/** Admin list all messages with pagination */
export async function listAll(page = 1, pageSize = 20, type?: number) {
  const where: Record<string, unknown> = {}
  if (type !== undefined) {
    where.type = type
  }

  const skip = (page - 1) * pageSize
  const [list, total] = await Promise.all([
    prisma.cms_message.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.cms_message.count({ where }),
  ])

  return { list, total }
}

export async function getById(id: number) {
  return prisma.cms_message.findUnique({
    where: { id },
  })
}

export async function create(data: {
  name: string
  content: string
  title?: string
  phone_number?: string
  wechat?: string
  company_name?: string
}) {
  return prisma.cms_message.create({
    data: {
      ...data,
      type: 0, // default: pending
    },
  })
}

/** Update message status (approve / reject / set-pending) */
export async function updateStatus(id: number, type: number) {
  return prisma.cms_message.update({
    where: { id },
    data: { type },
  })
}

export async function remove(id: number) {
  return prisma.cms_message.delete({
    where: { id },
  })
}
