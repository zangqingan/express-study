import { prisma } from '../config/database.js'

interface ProductInput {
  name: string
  price: number
  level_id: number
  duration_days?: number
  description?: string
  status?: number
}

const includeLevel = {
  user_level: {
    select: { id: true, level_code: true, level_name: true, days_valid: true },
  },
}

/** List products with optional pagination */
export async function findAll(params?: { page?: number; pageSize?: number; status?: number }) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  const where: Record<string, unknown> = {}
  if (params?.status !== undefined) {
    where.status = params.status
  }

  const [list, total] = await Promise.all([
    prisma.user_product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: includeLevel,
      orderBy: { id: 'asc' },
    }),
    prisma.user_product.count({ where }),
  ])

  return {
    list: list.map(formatProduct),
    total,
    page,
    pageSize,
  }
}

/** List all products (no pagination, for public) */
export async function listAll() {
  const list = await prisma.user_product.findMany({
    where: { status: 1 },
    include: includeLevel,
    orderBy: { id: 'asc' },
  })
  return list.map(formatProduct)
}

/** Find product by ID */
export async function findById(id: number) {
  const p = await prisma.user_product.findUnique({
    where: { id },
    include: includeLevel,
  })
  return p ? formatProduct(p) : null
}

/** Create a product */
export async function create(data: ProductInput) {
  const p = await prisma.user_product.create({
    data: {
      name: data.name,
      price: data.price,
      level_id: data.level_id,
      duration_days: data.duration_days ?? 0,
      description: data.description ?? '',
      status: data.status ?? 1,
    },
    include: includeLevel,
  })
  return formatProduct(p)
}

/** Update a product */
export async function update(id: number, data: Partial<ProductInput>) {
  const p = await prisma.user_product.update({
    where: { id },
    data,
    include: includeLevel,
  })
  return formatProduct(p)
}

/** Delete a product */
export async function remove(id: number) {
  return prisma.user_product.delete({ where: { id } })
}

/** Format product for API response (converts Decimal price to number) */
function formatProduct(p: Record<string, unknown>): Record<string, unknown> {
  return {
    ...p,
    price: p.price != null ? Number(p.price) : 0,
  }
}
