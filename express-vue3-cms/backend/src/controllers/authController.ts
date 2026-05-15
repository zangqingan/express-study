import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import { hashPassword, comparePassword } from '../utils/crypto.js'
import { signToken } from '../middleware/auth.js'
import { logger } from '../config/logger.js'
import * as authService from '../services/authService.js'

export async function login(req: Request, res: Response) {
  const { username, password } = req.body

  const user = await authService.findByUsername(username)
  if (!user) {
    return error(res, '用户名或密码错误', 401)
  }

  if (user.status !== 0) {
    return error(res, '该账号已被禁用', 403)
  }

  const valid = await comparePassword(password, user.password ?? '')
  if (!valid) {
    return error(res, '用户名或密码错误', 401)
  }

  // Record login log
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || ''

  try {
    await authService.logLogin({
      uid: user.id,
      ip: clientIp,
    })
  } catch (err) {
    logger.warn('Failed to record login log:', err)
  }

  // Update login info
  try {
    await authService.updateLoginInfo(user.id, clientIp)
  } catch (err) {
    logger.warn('Failed to update login info:', err)
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    isAdmin: user.id === 1,
  })

  return success(res, { token })
}

export async function me(req: Request, res: Response) {
  const userId = req.user!.id

  const user = await authService.findById(userId)
  if (!user) {
    return error(res, '用户不存在', 404)
  }

  const [roleIds, permissions] = await Promise.all([
    authService.getUserRoleIds(userId),
    authService.getPermissionsByUser(userId),
  ])

  return success(res, {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    email: user.email,
    phone_number: user.phone_number,
    gender: user.gender,
    status: user.status,
    create_at: user.create_at,
    roles: roleIds,
    permissions,
  })
}

export async function register(req: Request, res: Response) {
  const { username, password, nickname, email, phone_number, avatar, gender } = req.body

  const existing = await authService.findByUsername(username)
  if (existing) {
    return error(res, '用户名已存在', 409)
  }

  const hashedPwd = await hashPassword(password)
  const create_by = req.user?.username || 'system'

  const newUser = await authService.createUser({
    username,
    password: hashedPwd,
    nickname,
    email,
    phone_number,
    avatar,
    gender,
    create_by,
  })

  return success(res, newUser, '注册成功')
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless — logout is handled client-side by discarding the token.
  // For a real implementation with token blacklist, you would add the token to Redis.
  return success(res, null, '退出成功')
}
