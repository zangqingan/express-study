import type { Request, Response } from 'express'
import { success, error, paginated } from '../utils/response.js'
import * as orderService from '../services/orderService.js'

/** GET /orders — admin list */
export async function list(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  const status = req.query.status !== undefined ? Number(req.query.status) : undefined
  const userId = req.query.userId !== undefined ? Number(req.query.userId) : undefined
  const orderNo = req.query.orderNo as string | undefined

  const result = await orderService.findAll({ page, pageSize, status, user_id: userId, order_no: orderNo })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /orders/my — user's own orders */
export async function myOrders(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))

  const result = await orderService.findByUser(req.user!.id, { page, pageSize })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /orders/:id — detail */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const order = await orderService.findById(id)
  if (!order) {
    return error(res, '订单不存在', 404)
  }

  // Only the order owner or admin can view
  if (req.user!.id !== 1 && (order as Record<string, unknown>).user_id !== req.user!.id) {
    return error(res, '无权限查看该订单', 403)
  }

  return success(res, order)
}

/** POST /orders — create */
export async function create(req: Request, res: Response) {
  const { product_id, payment_method } = req.body
  if (!product_id) {
    return error(res, '产品ID不能为空', 422)
  }

  try {
    const order = await orderService.create({
      user_id: req.user!.id,
      product_id,
      payment_method,
    })
    return success(res, order, '下单成功')
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) {
      return error(res, '产品不存在', 404)
    }
    throw err
  }
}

/** PUT /orders/:id — admin update */
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await orderService.findById(id)
  if (!existing) {
    return error(res, '订单不存在', 404)
  }
  const order = await orderService.update(id, req.body)
  return success(res, order, '更新成功')
}

/** DELETE /orders/:id — admin delete */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await orderService.findById(id)
  if (!existing) {
    return error(res, '订单不存在', 404)
  }
  await orderService.remove(id)
  return success(res, null, '删除成功')
}
