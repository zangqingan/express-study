import { prisma } from '../config/database.js'

export async function list() {
  return prisma.cms_friend_link.findMany({
    orderBy: { order_by: 'asc' },
  })
}

export async function getById(id: number) {
  return prisma.cms_friend_link.findUnique({
    where: { id },
  })
}

export async function create(data: {
  title?: string
  link?: string
  order_by?: number
}) {
  return prisma.cms_friend_link.create({
    data,
  })
}

export async function update(
  id: number,
  data: {
    title?: string
    link?: string
    order_by?: number
  },
) {
  return prisma.cms_friend_link.update({
    where: { id },
    data,
  })
}

export async function remove(id: number) {
  return prisma.cms_friend_link.delete({
    where: { id },
  })
}
