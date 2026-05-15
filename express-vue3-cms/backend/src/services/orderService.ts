import { prisma } from '../config/database.js'

interface CreateOrderInput {
  user_id: number
  product_id: number
  payment_method?: number
}

const includeRelations = {
  user: {
    select: { id: true, username: true, phone_number: true, email: true, avatar: true },
  },
  user_product: {
    include: {
      user_level: {
        select: { id: true, level_code: true, level_name: true, days_valid: true },
      },
    },
  },
}

/** List orders with pagination (admin) */
export async function findAll(params: {
  page?: number
  pageSize?: number
  status?: number
  user_id?: number
  order_no?: string
}) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const where: Record<string, unknown> = {}

  if (params.status !== undefined) where.status = params.status
  if (params.user_id !== undefined) where.user_id = params.user_id
  if (params.order_no) where.order_no = { contains: params.order_no }

  const [list, total] = await Promise.all([
    prisma.user_order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
    }),
    prisma.user_order.count({ where }),
  ])

  return {
    list: list.map(formatOrder),
    total,
    page,
    pageSize,
  }
}

/** List user's own orders */
export async function findByUser(userId: number, params?: { page?: number; pageSize?: number }) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20

  const where = { user_id: userId }
  const [list, total] = await Promise.all([
    prisma.user_order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
    }),
    prisma.user_order.count({ where }),
  ])

  return {
    list: list.map(formatOrder),
    total,
    page,
    pageSize,
  }
}

/** Find order by ID */
export async function findById(id: number) {
  const o = await prisma.user_order.findUnique({
    where: { id },
    include: includeRelations,
  })
  return o ? formatOrder(o) : null
}

/** Create an order — looks up product price internally */
export async function create(data: CreateOrderInput) {
  // Look up product to get price
  const product = await prisma.user_product.findUnique({
    where: { id: data.product_id },
    select: { id: true, price: true, name: true },
  })
  if (!product) {
    throw Object.assign(new Error('产品不存在'), { status: 404 })
  }

  // Generate order number
  const orderNo = `OR${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const o = await prisma.user_order.create({
    data: {
      user_id: data.user_id,
      order_no: orderNo,
      product_id: data.product_id,
      amount: Number(product.price ?? 0),
      payment_method: data.payment_method ?? 1,
      status: 1,
      created_at: new Date(),
    },
    include: includeRelations,
  })
  return formatOrder(o)
}

/** Update order (typically status) */
export async function update(id: number, data: { status?: number; payment_method?: number; paid_at?: Date }) {
  const updateData: Record<string, unknown> = { ...data }
  if (data.status === 2 && !data.paid_at) {
    updateData.paid_at = new Date()
  }
  const o = await prisma.user_order.update({
    where: { id },
    data: updateData,
    include: includeRelations,
  })
  return formatOrder(o)
}

/** Delete an order */
export async function remove(id: number) {
  return prisma.user_order.delete({ where: { id } })
}

/** Format order for API response */
function formatOrder(o: Record<string, unknown>): Record<string, unknown> {
  return {
    ...o,
    amount: o.amount != null ? Number(o.amount) : 0,
    user_product: o.user_product != null && typeof o.user_product === 'object'
      ? { ...(o.user_product as Record<string, unknown>), price: Number((o.user_product as Record<string, unknown>).price ?? 0) }
      : o.user_product,
  }
}
