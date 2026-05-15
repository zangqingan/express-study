import type { Request, Response } from 'express'
import { success, error, paginated } from '../utils/response.js'
import * as productService from '../services/productService.js'

/** GET /products — public list (only active products) */
export async function publicList(_req: Request, res: Response) {
  const list = await productService.listAll()
  return success(res, list)
}

/** GET /products — admin list with pagination */
export async function list(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  const status = req.query.status !== undefined ? Number(req.query.status) : undefined

  const result = await productService.findAll({ page, pageSize, status })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /products/:id — detail */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const product = await productService.findById(id)
  if (!product) {
    return error(res, '产品不存在', 404)
  }
  return success(res, product)
}

/** POST /products — admin create */
export async function create(req: Request, res: Response) {
  const { name, price, level_id, duration_days, description, status } = req.body
  if (!name || price == null || !level_id) {
    return error(res, '产品名称、价格和所属等级不能为空', 422)
  }
  const product = await productService.create({
    name,
    price,
    level_id,
    duration_days,
    description,
    status,
  })
  return success(res, product, '创建成功')
}

/** PUT /products/:id — admin update */
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await productService.findById(id)
  if (!existing) {
    return error(res, '产品不存在', 404)
  }
  const product = await productService.update(id, req.body)
  return success(res, product, '更新成功')
}

/** DELETE /products/:id — admin delete */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await productService.findById(id)
  if (!existing) {
    return error(res, '产品不存在', 404)
  }
  await productService.remove(id)
  return success(res, null, '删除成功')
}
