import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as service from '../services/fragService.js'

export async function list(req: Request, res: Response) {
  const type = req.query.type ? Number(req.query.type) : undefined
  const frags = await service.list(type)
  success(res, frags)
}

export async function detail(req: Request, res: Response) {
  const param = req.params.id

  // Support lookup by numeric ID or by remark string
  const numericId = Number(param)
  if (!Number.isNaN(numericId)) {
    const frag = await service.getById(numericId)
    if (!frag) {
      return error(res, '碎片不存在', 404)
    }
    return success(res, frag)
  }

  // Try lookup by remark code
  const frag = await service.getByRemark(param)
  if (!frag) {
    return error(res, '碎片不存在', 404)
  }
  success(res, frag)
}

export async function create(req: Request, res: Response) {
  const { name, remark, content, type } = req.body
  const frag = await service.create({ name, remark, content, type })
  success(res, frag, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '碎片不存在', 404)
  }

  const { name, remark, content, type } = req.body
  const frag = await service.update(id, { name, remark, content, type })
  success(res, frag, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '碎片不存在', 404)
  }

  await service.remove(id)
  success(res, null, '删除成功')
}
