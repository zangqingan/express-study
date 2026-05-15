import { prisma } from '../config/database.js'

interface RecordInput {
  user_id: number
  article_id: number
  read_time?: Date
}

const includeRelations = {
  user: {
    select: { id: true, username: true, avatar: true },
  },
  cms_article: {
    select: { id: true, title: true, img: true, description: true },
  },
}

/** List all reading records with pagination (admin) */
export async function findAll(params?: {
  page?: number
  pageSize?: number
  user_id?: number
  article_id?: number
}) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  const where: Record<string, unknown> = {}

  if (params?.user_id !== undefined) where.user_id = params.user_id
  if (params?.article_id !== undefined) where.article_id = params.article_id

  const [list, total] = await Promise.all([
    prisma.user_reading_record.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: includeRelations,
      orderBy: { read_time: 'desc' },
    }),
    prisma.user_reading_record.count({ where }),
  ])

  return { list, total, page, pageSize }
}

/** List user's own reading records */
export async function findByUser(userId: number, params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20

  const where = { user_id: userId }
  const [list, total] = await Promise.all([
    prisma.user_reading_record.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        cms_article: includeRelations.cms_article,
      },
      orderBy: { read_time: 'desc' },
    }),
    prisma.user_reading_record.count({ where }),
  ])

  return { list, total, page, pageSize }
}

/** Find record by ID */
export async function findById(id: number) {
  return prisma.user_reading_record.findUnique({
    where: { id },
    include: includeRelations,
  })
}

/** Create a reading record — validates article exists */
export async function create(data: RecordInput) {
  // Verify article exists
  const article = await prisma.cms_article.findUnique({
    where: { id: data.article_id },
    select: { id: true },
  })
  if (!article) {
    throw Object.assign(new Error('文章不存在'), { status: 404 })
  }

  return prisma.user_reading_record.create({
    data: {
      user_id: data.user_id,
      article_id: data.article_id,
      read_time: data.read_time ?? new Date(),
    },
    include: includeRelations,
  })
}

/** Delete a reading record */
export async function remove(id: number) {
  return prisma.user_reading_record.delete({ where: { id } })
}
