import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import * as menuService from '../services/menuService.js'

export async function tree(_req: Request, res: Response) {
  const tree = await menuService.getTree()
  success(res, tree)
}

export async function list(_req: Request, res: Response) {
  const menus = await menuService.findAll()
  success(res, menus)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const menu = await menuService.findById(id)
  if (!menu) return error(res, '菜单不存在', 404)

  success(res, menu)
}

export async function create(req: Request, res: Response) {
  const {
    pid, title, name, order_num, path, component, icon, query,
    permissions, type, is_frame, is_cache, is_show, status, remark,
  } = req.body

  const create_by = req.user?.username || 'system'

  const newMenu = await menuService.create({
    pid,
    title,
    name,
    order_num,
    path,
    component,
    icon,
    query,
    permissions,
    type,
    is_frame,
    is_cache,
    is_show,
    status,
    remark,
    create_by,
  })

  success(res, newMenu, '创建成功')
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await menuService.findById(id)
  if (!existing) return error(res, '菜单不存在', 404)

  const {
    pid, title, name, order_num, path, component, icon, query,
    permissions, type, is_frame, is_cache, is_show, status, remark,
  } = req.body

  const updatedMenu = await menuService.update(id, {
    pid,
    title,
    name,
    order_num,
    path,
    component,
    icon,
    query,
    permissions,
    type,
    is_frame,
    is_cache,
    is_show,
    status,
    remark,
    update_by: req.user?.username || 'system',
  })

  success(res, updatedMenu, '更新成功')
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) return error(res, '参数错误', 400)

  const existing = await menuService.findById(id)
  if (!existing) return error(res, '菜单不存在', 404)

  await menuService.remove(id)
  success(res, null, '删除成功')
}
