import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as tagService from '../services/tagService.js'

// ---------------------------------------------------------------
// Public: list all tags
// ---------------------------------------------------------------
export async function list(_req: Request, res: Response) {
  const tags = await tagService.findAll()
  success(res, tags)
}

// ---------------------------------------------------------------
// Admin: create tag
// ---------------------------------------------------------------
export async function create(req: Request, res: Response) {
  const { name, path, ref_count } = req.body

  try {
    const tag = await tagService.create({ name, path, ref_count })
    success(res, tag, '创建成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: update tag
// ---------------------------------------------------------------
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的标签ID', 400)
  }

  const { name, path, ref_count } = req.body

  // Build update object from provided fields only
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (path !== undefined) data.path = path
  if (ref_count !== undefined) data.ref_count = ref_count

  if (Object.keys(data).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const tag = await tagService.update(id, data as any)
    success(res, tag, '更新成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: delete tag (only if ref_count is 0)
// ---------------------------------------------------------------
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的标签ID', 400)
  }

  try {
    await tagService.remove(id)
    success(res, null, '删除成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: merge two tags
// ---------------------------------------------------------------
export async function merge(req: Request, res: Response) {
  const { sourceId, targetId } = req.body

  try {
    const result = await tagService.merge(sourceId, targetId)
    success(res, result, '合并成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}
