import type { Request, Response } from 'express'
import { success, error, paginated } from '../utils/response.js'
import * as recordService from '../services/readingRecordService.js'

/** GET /reading-records — admin list */
export async function list(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  const userId = req.query.userId !== undefined ? Number(req.query.userId) : undefined
  const articleId = req.query.articleId !== undefined ? Number(req.query.articleId) : undefined

  const result = await recordService.findAll({ page, pageSize, user_id: userId, article_id: articleId })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /reading-records/my — user's own records */
export async function myRecords(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))

  const result = await recordService.findByUser(req.user!.id, { page, pageSize })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /reading-records/:id — detail */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const record = await recordService.findById(id)
  if (!record) {
    return error(res, '阅读记录不存在', 404)
  }
  return success(res, record)
}

/** POST /reading-records — create */
export async function create(req: Request, res: Response) {
  const { article_id, read_time } = req.body

  if (!article_id) {
    return error(res, '文章ID不能为空', 422)
  }

  try {
    const record = await recordService.create({
      user_id: req.user!.id,
      article_id,
      read_time: read_time ? new Date(read_time) : undefined,
    })
    return success(res, record, '记录成功')
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) {
      return error(res, '文章不存在', 404)
    }
    throw err
  }
}

/** DELETE /reading-records/:id — admin delete */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const existing = await recordService.findById(id)
  if (!existing) {
    return error(res, '阅读记录不存在', 404)
  }
  await recordService.remove(id)
  return success(res, null, '删除成功')
}
