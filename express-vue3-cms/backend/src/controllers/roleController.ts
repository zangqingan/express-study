import type { Request, Response } from 'express'
import { success, paginated, error } from '../utils/response.js'
import * as roleService from '../services/roleService.js'

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 10
  const { name, key, status } = req.query

  const { list, total } = await roleService.findMany({
    page,
    pageSize,
    name: name as string | undefined,
    key: key as string | undefined,
    status: status !== undefined ? Number(status) : undefined,
  })

  paginated(res, list, total, page, pageSize)
}

export async function listAll(_req: Request, res: Response) {
  const list = await roleService.findAll()
  success(res, list)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const role = await roleService.findById(id)
  if (!role) return error(res, '角色不存在', 404)

  // Also get assigned menus
  const menus = await roleService.getRoleMenus(id)
  const menuIds = menus.map((m) => m.menu_id)

  success(res, { ...role, menuIds })
}

export async function create(req: Request, res: Response) {
  const { name, key, sort, status, remark } = req.body

  const existing = await roleService.countByNameOrKey(name, key)
  if (existing > 0) {
    return error(res, '角色名称或标识已存在', 409)
  }

  const create_by = req.user?.username || 'system'

  const newRole = await roleService.create({
    name,
    key,
    sort,
    status,
    remark,
    create_by,
  })

  success(res, newRole, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await roleService.findById(id)
  if (!existing) return error(res, '角色不存在', 404)

  // Check uniqueness
  if (req.body.name || req.body.key) {
    const checkName = req.body.name || existing.name
    const checkKey = req.body.key || existing.key
    const count = await roleService.countByNameOrKey(checkName, checkKey, id)
    if (count > 0) return error(res, '角色名称或标识已存在', 409)
  }

  const updatedRole = await roleService.update(id, {
    name: req.body.name,
    key: req.body.key,
    sort: req.body.sort,
    status: req.body.status,
    remark: req.body.remark,
    update_by: req.user?.username || 'system',
  })

  success(res, updatedRole, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await roleService.findById(id)
  if (!existing) return error(res, '角色不存在', 404)

  await roleService.remove(id)
  success(res, null, '删除成功')
}

export async function assignMenus(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const { menuIds } = req.body
  if (!Array.isArray(menuIds)) {
    return error(res, '菜单ID数组不能为空', 422)
  }

  const existing = await roleService.findById(id)
  if (!existing) return error(res, '角色不存在', 404)

  const assigned = await roleService.assignMenus(id, menuIds)
  success(res, { menuIds: assigned }, '菜单分配成功')
}
