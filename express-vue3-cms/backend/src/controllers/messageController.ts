import type { Request, Response } from 'express'
import { success, paginated, error } from '../utils/response.js'
import * as service from '../services/messageService.js'

// ──── Public ─────────────────────────────────────────────────────────────────

/** Submit a message (no auth required) */
export async function create(req: Request, res: Response) {
  const { name, content, title, phone_number, wechat, company_name } = req.body
  const message = await service.create({
    name,
    content,
    title,
    phone_number,
    wechat,
    company_name,
  })
  success(res, message, '留言提交成功')
}

/** Public list — only approved messages */
export async function list(_req: Request, res: Response) {
  const messages = await service.list()
  success(res, messages)
}

// ──── Admin ─────────────────────────────────────────────────────────────────

/** Admin: list all messages with pagination and optional type filter */
export async function listAll(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20))
  const type = req.query.type ? Number(req.query.type) : undefined

  const { list, total } = await service.listAll(page, pageSize, type)
  paginated(res, list, total, page, pageSize)
}

/** Admin: update message status (approve / reject / set-pending) */
export async function updateStatus(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '留言不存在', 404)
  }

  const { type } = req.body
  const message = await service.updateStatus(id, type)

  const statusLabels: Record<number, string> = { 0: '待审核', 1: '通过', 2: '拒绝' }
  success(res, message, `留言已${statusLabels[type] || '更新'}`)
}

/** Admin: delete a message */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!id) {
    return error(res, '参数错误')
  }

  const existing = await service.getById(id)
  if (!existing) {
    return error(res, '留言不存在', 404)
  }

  await service.remove(id)
  success(res, null, '删除成功')
}
