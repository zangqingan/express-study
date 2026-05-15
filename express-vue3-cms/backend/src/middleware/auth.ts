import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config } from '../config/index.js'
import { error } from '../utils/response.js'

export interface JwtPayload {
  id: number
  username: string
  isAdmin: boolean
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/** JWT authentication middleware — verifies Bearer token */
export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return error(res, '请先登录', 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = decoded
    next()
  } catch {
    return error(res, '登录已过期，请重新登录', 401)
  }
}

/** Optional auth — sets req.user if token present, but doesn't block */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
      req.user = decoded
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

/** Generate JWT token */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}
