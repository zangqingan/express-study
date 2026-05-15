import { prisma } from '../config/database.js'

const defaultSelect = {
  id: true,
  title: true,
  type: true,
  content: true,
  status: true,
  remark: true,
  create_at: true,
  update_at: true,
}

export interface NoticeQuery {
  page: number
  pageSize: number
  title?: string
  type?: number
  status?: number
}

export async function findMany(query: NoticeQuery) {
  const { page, pageSize, title, type, status } = query

  const where: Record<string, unknown> = {}
  if (title) where.title = { contains: title }
  if (type !== undefined && type !== null) where.type = Number(type)
  if (status !== undefined && status !== null) where.status = Number(status)

  const [list, total] = await Promise.all([
    prisma.sys_notice.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { create_at: 'desc' },
      select: defaultSelect,
    }),
    prisma.sys_notice.count({ where }),
  ])

  return { list, total }
}

export async function findActiveNotices(page: number, pageSize: number) {
  const where: Record<string, unknown> = { status: 0 }

  const [list, total] = await Promise.all([
    prisma.sys_notice.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { create_at: 'desc' },
      select: defaultSelect,
    }),
    prisma.sys_notice.count({ where }),
  ])

  return { list, total }
}

export async function findById(id: number) {
  return prisma.sys_notice.findUnique({
    where: { id },
    select: defaultSelect,
  })
}

export interface CreateNoticeInput {
  title: string
  type?: number
  content: string
  status?: number
  remark?: string
}

export async function create(data: CreateNoticeInput) {
  return prisma.sys_notice.create({
    data: {
      title: data.title,
      type: data.type ?? 1,
      content: data.content,
      status: data.status ?? 1,
      remark: data.remark ?? null,
      create_at: new Date(),
      update_at: new Date(),
    },
    select: defaultSelect,
  })
}

export interface UpdateNoticeInput {
  title?: string
  type?: number
  content?: string
  status?: number
  remark?: string
}

export async function update(id: number, data: UpdateNoticeInput) {
  const updateData: Record<string, unknown> = {
    update_at: new Date(),
  }

  if (data.title !== undefined) updateData.title = data.title
  if (data.type !== undefined) updateData.type = data.type
  if (data.content !== undefined) updateData.content = data.content
  if (data.status !== undefined) updateData.status = data.status
  if (data.remark !== undefined) updateData.remark = data.remark

  return prisma.sys_notice.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  })
}

export async function remove(id: number) {
  return prisma.sys_notice.delete({
    where: { id },
    select: defaultSelect,
  })
}
