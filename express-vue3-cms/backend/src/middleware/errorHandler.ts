import type { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'

/** Global error handler middleware */
export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(err.stack || err.message)

  const statusCode = err.status || 500
  const message = statusCode === 500 ? '服务器内部错误' : err.message

  res.status(statusCode).json({
    code: statusCode,
    msg: message,
    data: null,
  })
}
