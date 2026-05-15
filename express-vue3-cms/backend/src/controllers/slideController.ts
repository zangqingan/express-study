import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as service from '../services/slideService.js'

export async function list(_req: Request, res: Response) {
  const slides = await service.list()
  success(res, slides)
}

export async function create(req: Request, res: Response) {
  const { title, img_url, link_url, remark } = req.body
  const slide = await service.create({ title, img_url, link_url, remark })
  success(res, slide, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '轮播图不存在', 404)
  }

  const { title, img_url, link_url, remark } = req.body
  const slide = await service.update(id, { title, img_url, link_url, remark })
  success(res, slide, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '轮播图不存在', 404)
  }

  await service.remove(id)
  success(res, null, '删除成功')
}

export async function toggleStatus(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '轮播图不存在', 404)
  }

  const slide = await service.toggleStatus(id)
  success(res, slide, '状态切换成功')
}
