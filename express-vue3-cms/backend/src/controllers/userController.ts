import type { Request, Response } from 'express'
import { success, error, paginated } from '../utils/response.js'
import { hashPassword, comparePassword } from '../utils/crypto.js'
import { signToken } from '../middleware/auth.js'
import { logger } from '../config/logger.js'
import * as userService from '../services/userService.js'

/** POST /users/login — public */
export async function login(req: Request, res: Response) {
  const { username, password } = req.body

  const user = await userService.findByUsername(username)
  if (!user) {
    return error(res, '用户名或密码错误', 401)
  }

  const valid = await comparePassword(password, user.password ?? '')
  if (!valid) {
    return error(res, '用户名或密码错误', 401)
  }

  // Update login info (non-critical)
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || ''
  try {
    await userService.updateLoginInfo(user.id, clientIp)
  } catch (err) {
    logger.warn('Failed to update user login info:', err)
  }

  const token = signToken({
    id: user.id,
    username: user.username ?? '',
    isAdmin: false,
  })

  return success(res, { token })
}

/** POST /users/register — public */
export async function register(req: Request, res: Response) {
  const { username, password, email, phone_number, avatar, gender } = req.body

  const existing = await userService.findByUsername(username)
  if (existing) {
    return error(res, '用户名已存在', 409)
  }

  const hashedPwd = await hashPassword(password)
  const user = await userService.create({
    username,
    password: hashedPwd,
    email,
    phone_number,
    avatar,
    gender,
  })

  return success(res, user, '注册成功')
}

/** GET /users/me — get own profile */
export async function me(req: Request, res: Response) {
  const userId = req.user!.id
  const user = await userService.findById(userId)
  if (!user) {
    return error(res, '用户不存在', 404)
  }
  return success(res, user)
}

/** PUT /users/profile — update own profile */
export async function updateProfile(req: Request, res: Response) {
  const userId = req.user!.id
  const { email, phone_number, avatar, gender, remark } = req.body

  const user = await userService.updateProfile(userId, {
    email,
    phone_number,
    avatar,
    gender,
    remark,
  })

  return success(res, user, '更新成功')
}

/** PUT /users/password — change own password */
export async function changePassword(req: Request, res: Response) {
  const userId = req.user!.id
  const { old_password, new_password } = req.body

  const user = await userService.findByIdWithPassword(userId)
  if (!user) {
    return error(res, '用户不存在', 404)
  }

  const valid = await comparePassword(old_password, user.password ?? '')
  if (!valid) {
    return error(res, '原密码错误', 400)
  }

  if (old_password === new_password) {
    return error(res, '新密码不能与原密码相同', 400)
  }

  const hashedPwd = await hashPassword(new_password)
  await userService.changePassword(userId, hashedPwd)

  return success(res, null, '密码修改成功')
}

/** GET /users — admin list */
export async function list(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
  const username = req.query.username as string | undefined
  const email = req.query.email as string | undefined
  const phone = req.query.phone as string | undefined

  const result = await userService.findAll({ page, pageSize, username, email, phone_number: phone })
  return paginated(res, result.list, result.total, result.page, result.pageSize)
}

/** GET /users/:id — admin get user */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }
  const user = await userService.findById(id)
  if (!user) {
    return error(res, '用户不存在', 404)
  }
  return success(res, user)
}

/** PUT /users/:id — admin update user */
export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }

  const existing = await userService.findById(id)
  if (!existing) {
    return error(res, '用户不存在', 404)
  }

  const updateData: Record<string, unknown> = {}
  if (req.body.username !== undefined) updateData.username = req.body.username
  if (req.body.email !== undefined) updateData.email = req.body.email
  if (req.body.phone_number !== undefined) updateData.phone_number = req.body.phone_number
  if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar
  if (req.body.gender !== undefined) updateData.gender = req.body.gender
  if (req.body.remark !== undefined) updateData.remark = req.body.remark
  if (req.body.password) {
    updateData.password = await hashPassword(req.body.password)
  }

  const user = await userService.update(id, updateData)
  return success(res, user, '更新成功')
}

/** DELETE /users/:id — admin delete */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return error(res, '参数错误', 422)
  }

  if (id === 1) {
    return error(res, '不能删除超级管理员', 403)
  }

  const existing = await userService.findById(id)
  if (!existing) {
    return error(res, '用户不存在', 404)
  }

  await userService.remove(id)
  return success(res, null, '删除成功')
}
