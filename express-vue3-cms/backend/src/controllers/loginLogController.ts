import type { Request, Response } from 'express'
import { success, paginated, error } from '../utils/response.js'
import * as loginLogService from '../services/loginLogService.js'

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const { username, startDate, endDate } = req.query

  const { list, total } = await loginLogService.findMany({
    page,
    pageSize,
    username: username as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  })

  paginated(res, list, total, page, pageSize)
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const log = await loginLogService.findById(id)
  if (!log) return error(res, '日志不存在', 404)

  await loginLogService.remove(id)
  success(res, null, '删除成功')
}
