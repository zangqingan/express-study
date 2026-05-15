import { prisma } from '../config/database.js'

const defaultSelect = {
  id: true,
  pid: true,
  title: true,
  name: true,
  order_num: true,
  path: true,
  component: true,
  icon: true,
  query: true,
  permissions: true,
  type: true,
  is_frame: true,
  is_cache: true,
  is_show: true,
  status: true,
  create_by: true,
  create_at: true,
  update_by: true,
  update_at: true,
  remark: true,
}

export type MenuItem = Awaited<ReturnType<typeof prisma.sys_menu.findFirst>> & {
  children?: MenuItem[]
}

export async function findAll(where?: Record<string, unknown>) {
  return prisma.sys_menu.findMany({
    where,
    orderBy: { order_num: 'asc' },
    select: defaultSelect,
  })
}

export async function getTree() {
  const menus = await findAll({ status: 0 })
  return buildTree(menus, 0) as MenuItem[]
}

function buildTree(menus: Record<string, unknown>[], parentId: number): Record<string, unknown>[] {
  return menus
    .filter((m) => (m.pid as number) === parentId)
    .map((m) => ({
      ...m,
      children: buildTree(menus, m.id as number),
    }))
}

export async function findById(id: number) {
  return prisma.sys_menu.findUnique({
    where: { id },
    select: defaultSelect,
  })
}

export interface CreateMenuInput {
  pid?: number
  title: string
  name?: string
  order_num?: number
  path?: string
  component?: string
  icon?: string
  query?: string
  permissions?: string
  type?: string
  is_frame?: number
  is_cache?: number
  is_show?: number
  status?: number
  remark?: string
  create_by?: string
}

export async function create(data: CreateMenuInput) {
  return prisma.sys_menu.create({
    data: {
      pid: data.pid ?? 0,
      title: data.title,
      name: data.name ?? '',
      order_num: data.order_num ?? 0,
      path: data.path ?? '',
      component: data.component ?? null,
      icon: data.icon ?? '',
      query: data.query ?? null,
      permissions: data.permissions ?? '',
      type: data.type ?? '',
      is_frame: data.is_frame ?? 2,
      is_cache: data.is_cache ?? 2,
      is_show: data.is_show ?? 1,
      status: data.status ?? 0,
      remark: data.remark ?? '',
      create_by: data.create_by ?? '',
      create_at: new Date(),
      update_by: '',
      update_at: new Date(),
    },
    select: defaultSelect,
  })
}

export interface UpdateMenuInput {
  pid?: number
  title?: string
  name?: string
  order_num?: number
  path?: string
  component?: string
  icon?: string
  query?: string
  permissions?: string
  type?: string
  is_frame?: number
  is_cache?: number
  is_show?: number
  status?: number
  remark?: string
  update_by?: string
}

export async function update(id: number, data: UpdateMenuInput) {
  const updateData: Record<string, unknown> = {
    update_at: new Date(),
  }

  if (data.pid !== undefined) updateData.pid = data.pid
  if (data.title !== undefined) updateData.title = data.title
  if (data.name !== undefined) updateData.name = data.name
  if (data.order_num !== undefined) updateData.order_num = data.order_num
  if (data.path !== undefined) updateData.path = data.path
  if (data.component !== undefined) updateData.component = data.component
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.query !== undefined) updateData.query = data.query
  if (data.permissions !== undefined) updateData.permissions = data.permissions
  if (data.type !== undefined) updateData.type = data.type
  if (data.is_frame !== undefined) updateData.is_frame = data.is_frame
  if (data.is_cache !== undefined) updateData.is_cache = data.is_cache
  if (data.is_show !== undefined) updateData.is_show = data.is_show
  if (data.status !== undefined) updateData.status = data.status
  if (data.remark !== undefined) updateData.remark = data.remark
  if (data.update_by !== undefined) updateData.update_by = data.update_by

  return prisma.sys_menu.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  })
}

export async function remove(id: number) {
  // Delete child menus
  await prisma.sys_menu.deleteMany({ where: { pid: id } })
  // Remove role-menu associations for this menu
  await prisma.sys_role_menu.deleteMany({ where: { menu_id: id } })
  // Remove role-menu associations for child menus
  const childIds = await prisma.sys_menu.findMany({
    where: { pid: id },
    select: { id: true },
  })
  for (const child of childIds) {
    await prisma.sys_role_menu.deleteMany({ where: { menu_id: child.id } })
  }

  return prisma.sys_menu.delete({
    where: { id },
    select: defaultSelect,
  })
}
