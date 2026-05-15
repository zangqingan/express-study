import type { Request, Response } from 'express'
import { success, error, paginated } from '../utils/response.js'
import * as articleService from '../services/articleService.js'

// ---------------------------------------------------------------
// Public: paginated article list with filters
// ---------------------------------------------------------------
export async function list(req: Request, res: Response) {
  const {
    page = '1',
    pageSize = '10',
    cid,
    status,
    keyword,
    tag,
    attr,
  } = req.query as Record<string, string | undefined>

  const pageNum = Math.max(1, Number(page) || 1)
  const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10))

  const result = await articleService.findMany({
    page: pageNum,
    pageSize: pageSizeNum,
    cid,
    status,
    keyword,
    tag,
    attr,
  })

  paginated(res, result.list, result.total, pageNum, pageSizeNum)
}

// ---------------------------------------------------------------
// Public: article detail with PV increment
// ---------------------------------------------------------------
export async function detail(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的文章ID', 400)
  }

  const article = await articleService.findById(id)
  if (!article) {
    return error(res, '文章不存在', 404)
  }

  success(res, article)
}

// ---------------------------------------------------------------
// Admin: create article
// ---------------------------------------------------------------
export async function create(req: Request, res: Response) {
  const { user } = req
  if (!user) {
    return error(res, '请先登录', 401)
  }

  const {
    cid,
    sub_cid,
    title,
    short_title,
    tag_id,
    attr,
    article_view,
    source,
    author,
    description,
    img,
    content,
    status,
    link,
    ext,
  } = req.body

  try {
    const article = await articleService.create({
      title,
      cid,
      content,
      sub_cid,
      short_title,
      tag_id,
      attr,
      article_view,
      source,
      author,
      description,
      img,
      status,
      link,
      ext,
    })
    success(res, article, '创建成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: update article
// ---------------------------------------------------------------
export async function update(req: Request, res: Response) {
  const { user } = req
  if (!user) {
    return error(res, '请先登录', 401)
  }

  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的文章ID', 400)
  }

  const {
    cid,
    sub_cid,
    title,
    short_title,
    tag_id,
    attr,
    article_view,
    source,
    author,
    description,
    img,
    content,
    status,
    link,
    ext,
  } = req.body

  try {
    const article = await articleService.update(id, {
      title,
      cid,
      content,
      sub_cid,
      short_title,
      tag_id,
      attr,
      article_view,
      source,
      author,
      description,
      img,
      status,
      link,
      ext,
    })
    success(res, article, '更新成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: delete article
// ---------------------------------------------------------------
export async function remove(req: Request, res: Response) {
  const { user } = req
  if (!user) {
    return error(res, '请先登录', 401)
  }

  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的文章ID', 400)
  }

  try {
    await articleService.remove(id)
    success(res, null, '删除成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}

// ---------------------------------------------------------------
// Admin: toggle article status (publish/draft)
// ---------------------------------------------------------------
export async function toggleStatus(req: Request, res: Response) {
  const { user } = req
  if (!user) {
    return error(res, '请先登录', 401)
  }

  const id = Number(req.params.id)
  if (Number.isNaN(id) || id <= 0) {
    return error(res, '无效的文章ID', 400)
  }

  try {
    const article = await articleService.updateStatus(id)
    success(res, article, '状态更新成功')
  } catch (err: unknown) {
    if (err instanceof Error && (err as any).statusCode) {
      return error(res, err.message, (err as any).statusCode)
    }
    throw err
  }
}
