import { prisma } from '../config/database.js'

export async function list(type?: number) {
  const where = type !== undefined ? { type } : {}
  return prisma.cms_frag.findMany({
    where,
    orderBy: { created_at: 'desc' },
  })
}

export async function getById(id: number) {
  return prisma.cms_frag.findUnique({
    where: { id },
  })
}

export async function getByRemark(remark: string) {
  return prisma.cms_frag.findFirst({
    where: { remark },
  })
}

export async function create(data: {
  name?: string
  remark?: string
  content?: string
  type?: number
}) {
  return prisma.cms_frag.create({
    data,
  })
}

export async function update(
  id: number,
  data: {
    name?: string
    remark?: string
    content?: string
    type?: number
  },
) {
  return prisma.cms_frag.update({
    where: { id },
    data,
  })
}

export async function remove(id: number) {
  return prisma.cms_frag.delete({
    where: { id },
  })
}
