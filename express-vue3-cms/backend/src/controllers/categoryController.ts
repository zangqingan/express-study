import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as categoryService from '../services/categoryService.js'

// ---------------------------------------------------------------
// Public: flat list of all categories
// ---------------------------------------------------------------
export async function list(_req: Request, res: Response) {
  const categories = await categoryService.findAll()
  success(res, categories)
}

// ---------------------------------------------------------------
// Public: tree structure
// ---------------------------------------------------------------
export async function tree(_req: Request, res: Response) {
  const treeData = await categoryService.findTree()
  success(res, treeData)
}

// ---------------------------------------------------------------
// Admin: create category
// ---------------------------------------------------------------
export async function create(req: Request, res: Response) {
  const {
    parent_id,
    name,
    pinyin,
    path,
    description,
    type,
    url,
    order_by,
    target,
    status,
    mid,
    list_view,
    article_view,
    seo_title,
    seo_keywords,
    seo_description,
  } = req.body

  try {
    const category = await categoryService.create({
      parent_id,
      name,
      pinyin,
      path,
      description,
      type,
      url,
      order_by,
      target,
      status,
      mid,
      list_view,
      article_view,
      seo_title,
      seo_keywords,
      seo_description,
    })
    success(res, category, '创建成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: update category
// ---------------------------------------------------------------
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的栏目ID', 400)
  }

  const {
    parent_id,
    name,
    pinyin,
    path,
    description,
    type,
    url,
    order_by,
    target,
    status,
    mid,
    list_view,
    article_view,
    seo_title,
    seo_keywords,
    seo_description,
  } = req.body

  // Build update object from provided fields only
  const data: Record<string, unknown> = {}
  if (parent_id !== undefined) data.parent_id = parent_id
  if (name !== undefined) data.name = name
  if (pinyin !== undefined) data.pinyin = pinyin
  if (path !== undefined) data.path = path
  if (description !== undefined) data.description = description
  if (type !== undefined) data.type = type
  if (url !== undefined) data.url = url
  if (order_by !== undefined) data.order_by = order_by
  if (target !== undefined) data.target = target
  if (status !== undefined) data.status = status
  if (mid !== undefined) data.mid = mid
  if (list_view !== undefined) data.list_view = list_view
  if (article_view !== undefined) data.article_view = article_view
  if (seo_title !== undefined) data.seo_title = seo_title
  if (seo_keywords !== undefined) data.seo_keywords = seo_keywords
  if (seo_description !== undefined) data.seo_description = seo_description

  if (Object.keys(data).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const category = await categoryService.update(id, data as any)
    success(res, category, '更新成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: delete category
// ---------------------------------------------------------------
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的栏目ID', 400)
  }

  try {
    await categoryService.remove(id)
    success(res, null, '删除成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: update category sort order
// ---------------------------------------------------------------
export async function updateSort(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的栏目ID', 400)
  }

  const { order_by } = req.body

  try {
    const category = await categoryService.updateSort(id, order_by)
    success(res, category, '排序更新成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}
