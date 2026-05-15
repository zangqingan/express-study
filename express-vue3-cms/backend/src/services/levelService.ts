import { prisma } from '../config/database.js'

/** List all user levels */
export async function findAll() {
  return prisma.user_level.findMany({
    orderBy: { id: 'asc' },
  })
}

/** Find a level by ID */
export async function findById(id: number) {
  return prisma.user_level.findUnique({
    where: { id },
  })
}

/** Create a new level */
export async function create(data: { level_code: string; level_name: string; days_valid?: number }) {
  return prisma.user_level.create({
    data: {
      level_code: data.level_code,
      level_name: data.level_name,
      days_valid: data.days_valid ?? 365,
    },
  })
}

/** Update a level */
export async function update(id: number, data: { level_code?: string; level_name?: string; days_valid?: number }) {
  return prisma.user_level.update({
    where: { id },
    data,
  })
}

/** Delete a level */
export async function remove(id: number) {
  return prisma.user_level.delete({
    where: { id },
  })
}
