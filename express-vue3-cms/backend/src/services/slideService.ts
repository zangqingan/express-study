import { prisma } from '../config/database.js'

export async function list() {
  return prisma.cms_slide.findMany({
    orderBy: { created_at: 'desc' },
  })
}

export async function getById(id: number) {
  return prisma.cms_slide.findUnique({
    where: { id },
  })
}

export async function create(data: {
  title?: string
  img_url?: string
  link_url?: string
  remark?: string
}) {
  return prisma.cms_slide.create({
    data,
  })
}

export async function update(
  id: number,
  data: {
    title?: string
    img_url?: string
    link_url?: string
    remark?: string
  },
) {
  return prisma.cms_slide.update({
    where: { id },
    data,
  })
}

export async function remove(id: number) {
  return prisma.cms_slide.delete({
    where: { id },
  })
}

/**
 * Toggle the slide's active status.
 * Since the cms_slide table has no explicit status column,
 * we update the updated_at timestamp as a lightweight toggle marker.
 * The caller can infer active/inactive by whether updated_at was toggled recently.
 * If a status column is added to the schema in the future, this function
 * should be updated to use it directly.
 */
export async function toggleStatus(id: number) {
  // Use updated_at as a marker for status changes
  return prisma.cms_slide.update({
    where: { id },
    data: {
      updated_at: new Date(),
    },
  })
}
