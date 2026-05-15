import { prisma } from '../config/database.js'

const defaultSelect = {
  id: true,
  name: true,
  key: true,
  sort: true,
  status: true,
  del_flag: true,
  create_by: true,
  create_at: true,
  update_by: true,
  update_at: true,
  remark: true,
}

export interface RoleQuery {
  page: number
  pageSize: number
  name?: string
  key?: string
  status?: number
}

export async function findMany(query: RoleQuery) {
  const { page, pageSize, name, key, status } = query

  const where: Record<string, unknown> = {}
  if (name) where.name = { contains: name }
  if (key) where.key = { contains: key }
  if (status !== undefined && status !== null) where.status = Number(status)

  const [list, total] = await Promise.all([
    prisma.sys_role.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { sort: 'asc' },
      select: defaultSelect,
    }),
    prisma.sys_role.count({ where }),
  ])

  return { list, total }
}

export async function findAll() {
  return prisma.sys_role.findMany({
    where: { status: 0 },
    orderBy: { sort: 'asc' },
    select: { id: true, name: true, key: true },
  })
}

export async function findById(id: number) {
  return prisma.sys_role.findUnique({
    where: { id },
    select: defaultSelect,
  })
}

export interface CreateRoleInput {
  name: string
  key: string
  sort?: number
  status?: number
  remark?: string
  create_by?: string
}

export async function create(data: CreateRoleInput) {
  return prisma.sys_role.create({
    data: {
      name: data.name,
      key: data.key,
      sort: data.sort ?? 0,
      status: data.status ?? 0,
      remark: data.remark ?? '',
      del_flag: 1,
      create_by: data.create_by ?? '',
      create_at: new Date(),
      update_by: '',
      update_at: new Date(),
    },
    select: defaultSelect,
  })
}

export interface UpdateRoleInput {
  name?: string
  key?: string
  sort?: number
  status?: number
  remark?: string
  update_by?: string
}

export async function update(id: number, data: UpdateRoleInput) {
  const updateData: Record<string, unknown> = {
    update_at: new Date(),
  }

  if (data.name !== undefined) updateData.name = data.name
  if (data.key !== undefined) updateData.key = data.key
  if (data.sort !== undefined) updateData.sort = data.sort
  if (data.status !== undefined) updateData.status = data.status
  if (data.remark !== undefined) updateData.remark = data.remark
  if (data.update_by !== undefined) updateData.update_by = data.update_by

  return prisma.sys_role.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  })
}

export async function remove(id: number) {
  // Clean up role associations
  await prisma.sys_role_menu.deleteMany({ where: { role_id: id } })
  await prisma.sys_user_role.deleteMany({ where: { role_id: id } })
  return prisma.sys_role.delete({
    where: { id },
    select: defaultSelect,
  })
}

export async function getRoleMenus(roleId: number) {
  return prisma.sys_role_menu.findMany({
    where: { role_id: roleId },
    select: { menu_id: true },
  })
}

export async function assignMenus(roleId: number, menuIds: number[]) {
  // Remove existing
  await prisma.sys_role_menu.deleteMany({ where: { role_id: roleId } })

  if (menuIds.length === 0) return []

  const data = menuIds.map((menuId) => ({
    role_id: roleId,
    menu_id: menuId,
  }))

  await prisma.sys_role_menu.createMany({ data })
  return menuIds
}

export async function countByNameOrKey(name: string, key: string, excludeId?: number) {
  const where: Record<string, unknown>[] = []
  if (excludeId) {
    where.push({ name, id: { not: excludeId } })
    where.push({ key, id: { not: excludeId } })
  } else {
    where.push({ name })
    where.push({ key })
  }
  return prisma.sys_role.count({ where: { OR: where } })
}
