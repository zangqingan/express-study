import { prisma } from '../config/database.js'
import type { LoginLogInput } from '../types/auth.js'

export async function findByUsername(username: string) {
  return prisma.sys_user.findUnique({
    where: { username },
  })
}

export async function findById(id: number) {
  return prisma.sys_user.findUnique({
    where: { id },
  })
}

export async function findUserWithRoles(id: number) {
  return prisma.sys_user.findUnique({
    where: { id },
    include: {
      sys_user_role: {
        include: {
          sys_user: false,
        },
      },
    },
  })
}

export async function createUser(data: {
  username: string
  password: string
  nickname?: string
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
  create_by?: string
}) {
  return prisma.sys_user.create({
    data: {
      username: data.username,
      password: data.password,
      nickname: data.nickname ?? '',
      email: data.email ?? '',
      phone_number: data.phone_number ?? '',
      avatar: data.avatar ?? '',
      gender: data.gender ?? 0,
      status: 0,
      create_by: data.create_by ?? '',
      create_at: new Date(),
      update_by: '',
      update_at: new Date(),
      pwd_update_date: new Date(),
      login_ip: '',
      salt: '',
    },
    select: {
      id: true,
      username: true,
      nickname: true,
      email: true,
      phone_number: true,
      avatar: true,
      gender: true,
      status: true,
      create_at: true,
    },
  })
}

export async function updateLoginInfo(id: number, ip: string) {
  return prisma.sys_user.update({
    where: { id },
    data: {
      login_ip: ip ?? '',
      login_date: new Date(),
    },
  })
}

export async function logLogin(data: LoginLogInput) {
  return prisma.sys_login_log.create({
    data: {
      uid: data.uid,
      ip: data.ip ?? null,
      country: data.country ?? null,
      province: data.province ?? null,
      city: data.city ?? null,
      district: data.district ?? null,
      isp: data.isp ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      created_at: new Date(),
    },
  })
}

export async function getUserRoleIds(userId: number): Promise<number[]> {
  const rows = await prisma.sys_user_role.findMany({
    where: { user_id: userId },
    select: { role_id: true },
  })
  return rows.map((r) => r.role_id)
}

export async function getRoleKeysByUser(userId: number): Promise<string[]> {
  const roles = await prisma.sys_user_role.findMany({
    where: { user_id: userId },
    select: {
      role_id: true,
    },
  })
  const roleIds = roles.map((r) => r.role_id)
  if (roleIds.length === 0) return []

  const roleRecords = await prisma.sys_role.findMany({
    where: { id: { in: roleIds }, status: 0 },
    select: { key: true },
  })
  return roleRecords.map((r) => r.key)
}

export async function getPermissionsByUser(userId: number): Promise<string[]> {
  const roles = await prisma.sys_user_role.findMany({
    where: { user_id: userId },
    select: { role_id: true },
  })
  const roleIds = roles.map((r) => r.role_id)
  if (roleIds.length === 0) return []

  const menus = await prisma.sys_role_menu.findMany({
    where: { role_id: { in: roleIds } },
    select: { menu_id: true },
  })
  const menuIds = menus.map((m) => m.menu_id)
  if (menuIds.length === 0) return []

  const menuRecords = await prisma.sys_menu.findMany({
    where: { id: { in: menuIds }, status: 0 },
    select: { permissions: true },
  })
  return menuRecords
    .map((m) => m.permissions)
    .filter((p): p is string => !!p)
}
