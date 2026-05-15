import type { Response } from 'express'

export function success<T>(res: Response, data: T, msg = 'success') {
  res.json({ code: 0, msg, data })
}

export function error(res: Response, msg = 'error', code = 1) {
  res.json({ code, msg, data: null })
}

/** Paginated response helper */
export function paginated<T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  res.json({
    code: 0,
    msg: 'success',
    data: {
      list,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    },
  })
}
