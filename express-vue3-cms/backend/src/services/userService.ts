import { prisma } from '../config/database.js'

const userSelect = {
  id: true,
  username: true,
  gender: true,
  email: true,
  phone_number: true,
  avatar: true,
  login_ip: true,
  login_date: true,
  created_at: true,
  updated_at: true,
  remark: true,
}

/** Find user by username */
export async function findByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  })
}

/** Find user by ID */
export async function findById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  })
}

/** Find user with password (for login/validation) */
export async function findByIdWithPassword(id: number) {
  return prisma.user.findUnique({
    where: { id },
  })
}

/** List users with pagination */
export async function findAll(params?: {
  page?: number
  pageSize?: number
  username?: string
  email?: string
  phone_number?: string
}) {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  const where: Record<string, unknown> = {}

  if (params?.username) where.username = { contains: params.username }
  if (params?.email) where.email = { contains: params.email }
  if (params?.phone_number) where.phone_number = { contains: params.phone_number }

  const [list, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: userSelect,
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return { list, total, page, pageSize }
}

/** Create a new user */
export async function create(data: {
  username: string
  password: string
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
}) {
  return prisma.user.create({
    data: {
      username: data.username,
      password: data.password,
      email: data.email ?? '',
      phone_number: data.phone_number ?? '',
      avatar: data.avatar ?? '',
      gender: data.gender ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
      pwd_update_date: new Date(),
    },
    select: userSelect,
  })
}

/** Update user by admin */
export async function update(id: number, data: {
  username?: string
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
  password?: string
  remark?: string
}) {
  const updateData: Record<string, unknown> = { ...data, updated_at: new Date() }
  if (data.password) {
    updateData.pwd_update_date = new Date()
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  })
}

/** Update own profile */
export async function updateProfile(id: number, data: {
  email?: string
  phone_number?: string
  avatar?: string
  gender?: number
  remark?: string
}) {
  return prisma.user.update({
    where: { id },
    data: { ...data, updated_at: new Date() },
    select: userSelect,
  })
}

/** Change password */
export async function changePassword(id: number, newPassword: string) {
  return prisma.user.update({
    where: { id },
    data: {
      password: newPassword,
      pwd_update_date: new Date(),
      updated_at: new Date(),
    },
  })
}

/** Update login info */
export async function updateLoginInfo(id: number, ip: string) {
  return prisma.user.update({
    where: { id },
    data: {
      login_ip: ip,
      login_date: new Date(),
    },
  })
}

/** Delete a user */
export async function remove(id: number) {
  return prisma.user.delete({ where: { id } })
}
