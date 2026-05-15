import type { Request, Response } from 'express'
import { success, paginated, error } from '../utils/response.js'
import { hashPassword } from '../utils/crypto.js'
import * as sysUserService from '../services/sysUserService.js'
import * as authService from '../services/authService.js'

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const { username, nickname, email, phone_number, status } = req.query

  const { list, total } = await sysUserService.findMany({
    page,
    pageSize,
    username: username as string | undefined,
    nickname: nickname as string | undefined,
    email: email as string | undefined,
    phone_number: phone_number as string | undefined,
    status: status !== undefined ? Number(status) : undefined,
  })

  paginated(res, list, total, page, pageSize)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const user = await sysUserService.findById(id)
  if (!user) return error(res, '用户不存在', 404)

  // Also get the user's role ids
  const roles = await sysUserService.getUserRoles(id)
  const roleIds = roles.map((r) => r.role_id)

  success(res, { ...user, roleIds })
}

export async function create(req: Request, res: Response) {
  const { username, password, nickname, email, phone_number, avatar, gender, status, remark } = req.body

  const existing = await authService.findByUsername(username)
  if (existing) {
    return error(res, '用户名已存在', 409)
  }

  const hashedPwd = await hashPassword(password)
  const create_by = req.user?.username || 'system'

  const newUser = await sysUserService.create({
    username,
    password: hashedPwd,
    nickname,
    email,
    phone_number,
    avatar,
    gender,
    status,
    remark,
    create_by,
  })

  success(res, newUser, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await sysUserService.findById(id)
  if (!existing) return error(res, '用户不存在', 404)

  // If updating username, check uniqueness
  if (req.body.username) {
    const count = await sysUserService.countByUsername(req.body.username, id)
    if (count > 0) return error(res, '用户名已存在', 409)
  }

  const data: sysUserService.UpdateSysUserInput = {
    username: req.body.username,
    nickname: req.body.nickname,
    email: req.body.email,
    phone_number: req.body.phone_number,
    avatar: req.body.avatar,
    gender: req.body.gender,
    status: req.body.status,
    remark: req.body.remark,
    update_by: req.user?.username || 'system',
  }

  // Handle password update separately — hash it
  if (req.body.password) {
    data.password = await hashPassword(req.body.password)
  }

  const updatedUser = await sysUserService.update(id, data)

  success(res, updatedUser, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  // Prevent deleting super admin
  if (id === 1) return error(res, '不能删除超级管理员', 403)

  const existing = await sysUserService.findById(id)
  if (!existing) return error(res, '用户不存在', 404)

  await sysUserService.remove(id)
  success(res, null, '删除成功')
}

export async function assignRoles(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const { roleIds } = req.body
  if (!Array.isArray(roleIds)) {
    return error(res, '角色ID数组不能为空', 422)
  }

  const existing = await sysUserService.findById(id)
  if (!existing) return error(res, '用户不存在', 404)

  const assigned = await sysUserService.assignRoles(id, roleIds)
  success(res, { roleIds: assigned }, '角色分配成功')
}
