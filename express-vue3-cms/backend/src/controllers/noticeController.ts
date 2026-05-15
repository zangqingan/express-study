import type { Request, Response } from 'express'
import { success, paginated, error } from '../utils/response.js'
import * as noticeService from '../services/noticeService.js'

/** Public: list active notices (no auth required) */
export async function listActive(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10

  const { list, total } = await noticeService.findActiveNotices(page, pageSize)
  paginated(res, list, total, page, pageSize)
}

/** Admin: list all notices with filters */
export async function list(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const { title, type, status } = req.query

  const { list, total } = await noticeService.findMany({
    page,
    pageSize,
    title: title as string | undefined,
    type: type !== undefined ? Number(type) : undefined,
    status: status !== undefined ? Number(status) : undefined,
  })

  paginated(res, list, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const notice = await noticeService.findById(id)
  if (!notice) return error(res, '通知不存在', 404)

  success(res, notice)
}

export async function create(req: Request, res: Response) {
  const { title, type, content, status, remark } = req.body

  const newNotice = await noticeService.create({
    title,
    type,
    content,
    status,
    remark,
  })

  success(res, newNotice, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await noticeService.findById(id)
  if (!existing) return error(res, '通知不存在', 404)

  const updatedNotice = await noticeService.update(id, {
    title: req.body.title,
    type: req.body.type,
    content: req.body.content,
    status: req.body.status,
    remark: req.body.remark,
  })

  success(res, updatedNotice, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await noticeService.findById(id)
  if (!existing) return error(res, '通知不存在', 404)

  await noticeService.remove(id)
  success(res, null, '删除成功')
}
