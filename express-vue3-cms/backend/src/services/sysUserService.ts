import { prisma } from '../config/database.js'

const defaultSelect = {
  id: true,
  username: true,
  nickname: true,
  avatar: true,
  gender: true,
  email: true,
  phone_number: true,
  status: true,
  login_ip: true,
  login_date: true,
  create_by: true,
  create_at: true,
  update_by: true,
  update_at: true,
  remark: true,
}

export interface SysUserQuery {
  page: number
  pageSize: number
  username?: string
  nickname?: string
  email?: string
  phone_number?: string
  status?: number
}

export async function findMany(query: SysUserQuery) {
  const { page, pageSize, username, nickname, email, phone_number, status } = query

  const where: Record<string, unknown> = {}
  if (username) where.username = { contains: username }
  if (nickname) where.nickname = { contains: nickname }
  if (email) where.email = { contains: email }
  if (phone_number) where.phone_number = { contains: phone_number }
  if (status !== undefined && status !== null) where.status = Number(status)

  const [list, total] = await Promise.all([
    prisma.sys_user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { create_at: 'desc' },
      select: defaultSelect,
    }),
    prisma.sys_user.count({ where }),
  ])

  return { list, total }
}

export async function findById(id: number) {
  return prisma.sys_user.findUnique({
    where: { id },
    select: defaultSelect,
  })
}

export interface CreateSysUserInput {
  username: string
  nickname?: string
  password: string
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
  status?: number
  remark?: string
  create_by?: string
}

export async function create(data: CreateSysUserInput) {
  return prisma.sys_user.create({
    data: {
      username: data.username,
      nickname: data.nickname ?? '',
      password: data.password,
      email: data.email ?? '',
      phone_number: data.phone_number ?? '',
      avatar: data.avatar ?? '',
      gender: data.gender ?? 0,
      status: data.status ?? 0,
      remark: data.remark ?? '',
      create_by: data.create_by ?? '',
      create_at: new Date(),
      update_by: '',
      update_at: new Date(),
      pwd_update_date: new Date(),
      login_ip: '',
      salt: '',
    },
    select: defaultSelect,
  })
}

export interface UpdateSysUserInput {
  username?: string
  nickname?: string
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
  status?: number
  remark?: string
  password?: string
  update_by?: string
}

export async function update(id: number, data: UpdateSysUserInput) {
  const updateData: Record<string, unknown> = {
    update_at: new Date(),
  }

  if (data.username !== undefined) updateData.username = data.username
  if (data.nickname !== undefined) updateData.nickname = data.nickname
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone_number !== undefined) updateData.phone_number = data.phone_number
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  if (data.gender !== undefined) updateData.gender = data.gender
  if (data.status !== undefined) updateData.status = data.status
  if (data.remark !== undefined) updateData.remark = data.remark
  if (data.update_by !== undefined) updateData.update_by = data.update_by
  if (data.password) {
    updateData.password = data.password
    updateData.pwd_update_date = new Date()
  }

  return prisma.sys_user.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  })
}

export async function remove(id: number) {
  // Also clean up user-role associations
  await prisma.sys_user_role.deleteMany({ where: { user_id: id } })
  return prisma.sys_user.delete({
    where: { id },
    select: defaultSelect,
  })
}

export async function assignRoles(userId: number, roleIds: number[]) {
  // Remove existing role assignments
  await prisma.sys_user_role.deleteMany({ where: { user_id: userId } })

  if (roleIds.length === 0) return []

  // Create new assignments
  const data = roleIds.map((roleId) => ({
    user_id: userId,
    role_id: roleId,
  }))

  await prisma.sys_user_role.createMany({ data })
  return roleIds
}

export async function getUserRoles(userId: number) {
  return prisma.sys_user_role.findMany({
    where: { user_id: userId },
    select: { role_id: true },
  })
}

export async function countByUsername(username: string, excludeId?: number) {
  const where: Record<string, unknown> = { username }
  if (excludeId) where.id = { not: excludeId }
  return prisma.sys_user.count({ where })
}
