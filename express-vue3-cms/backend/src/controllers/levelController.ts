import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as levelService from '../services/levelService.js'

/** GET /levels — public list */
export async function list(_req: Request, res: Response) {
  const levels = await levelService.findAll()
  return success(res, levels)
}

/** GET /levels/:id — public detail */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const level = await levelService.findById(id)
  if (!level) {
    return error(res, '等级不存在', 404)
  }
  return success(res, level)
}

/** POST /levels — admin create */
export async function create(req: Request, res: Response) {
  const { level_code, level_name, days_valid } = req.body
  if (!level_code || !level_name) {
    return error(res, '等级编码和名称不能为空', 422)
  }
  const level = await levelService.create({ level_code, level_name, days_valid })
  return success(res, level, '创建成功')
}

/** PUT /levels/:id — admin update */
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await levelService.findById(id)
  if (!existing) {
    return error(res, '等级不存在', 404)
  }
  const level = await levelService.update(id, req.body)
  return success(res, level, '更新成功')
}

/** DELETE /levels/:id — admin delete */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await levelService.findById(id)
  if (!existing) {
    return error(res, '等级不存在', 404)
  }
  await levelService.remove(id)
  return success(res, null, '删除成功')
}
