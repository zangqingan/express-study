import type { Request, Response, NextFunction } from 'express'

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

/** Wrap async route handlers to catch errors and forward to error middleware */
export function asyncHandler(fn: AsyncFn) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
