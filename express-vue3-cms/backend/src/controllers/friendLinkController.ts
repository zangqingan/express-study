import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as service from '../services/friendLinkService.js'

export async function list(_req: Request, res: Response) {
  const links = await service.list()
  success(res, links)
}

export async function create(req: Request, res: Response) {
  const { title, link, order_by } = req.body
  const friendLink = await service.create({ title, link, order_by })
  success(res, friendLink, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '友链不存在', 404)
  }

  const { title, link, order_by } = req.body
  const friendLink = await service.update(id, { title, link, order_by })
  success(res, friendLink, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '友链不存在', 404)
  }

  await service.remove(id)
  success(res, null, '删除成功')
}
