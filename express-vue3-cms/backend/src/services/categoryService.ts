import { prisma } from '../config/database.js'

// ---------------------------------------------------------------
// Public: flat list of all categories
// ---------------------------------------------------------------
export async function findAll() {
  return prisma.cms_category.findMany({
    orderBy: { order_by: 'asc' },
  })
}

// ---------------------------------------------------------------
// Public: tree structure built from flat list
// ---------------------------------------------------------------
export async function findTree() {
  const all = await prisma.cms_category.findMany({
    orderBy: { order_by: 'asc' },
  })

  // Build tree: attach children to their parent
  const map = new Map<number, Record<string, unknown>>()
  const roots: Record<string, unknown>[] = []

  for (const cat of all) {
    map.set(cat.id, { ...cat, children: [] as Record<string, unknown>[] })
  }

  for (const [, node] of map) {
    const parentId = (node as any).parent_id as number
    if (parentId === 0 || !map.has(parentId)) {
      roots.push(node)
    } else {
      const parent = map.get(parentId)!
      ;(parent.children as Record<string, unknown>[]).push(node)
    }
  }

  return roots
}

// ---------------------------------------------------------------
// Admin: create category
// ---------------------------------------------------------------
export async function create(data: {
  parent_id?: number
  name: string
  pinyin: string
  path: string
  description?: string
  type?: number
  url?: string
  order_by?: number
  target?: number
  status?: number
  mid?: number | null
  list_view?: string
  article_view?: string
  seo_title?: string
  seo_keywords?: string
  seo_description?: string
}) {
  // Validate parent exists if specified
  if (data.parent_id && data.parent_id > 0) {
    const parent = await prisma.cms_category.findUnique({
      where: { id: data.parent_id },
    })
    if (!parent) {
      throw Object.assign(new Error('父级栏目不存在'), { statusCode: 400 })
    }
  }

  // Validate mid (model) exists if specified
  if (data.mid) {
    const model = await prisma.cms_model.findUnique({
      where: { id: data.mid },
    })
    if (!model) {
      throw Object.assign(new Error('关联模型不存在'), { statusCode: 400 })
    }
  }

  return prisma.cms_category.create({
    data: {
      parent_id: data.parent_id ?? 0,
      name: data.name,
      pinyin: data.pinyin,
      path: data.path,
      description: data.description ?? '',
      type: data.type ?? 0,
      url: data.url ?? '',
      order_by: data.order_by ?? 0,
      target: data.target ?? 0,
      status: data.status ?? 0,
      mid: data.mid ?? null,
      list_view: data.list_view ?? 'list.html',
      article_view: data.article_view ?? 'article.html',
      seo_title: data.seo_title ?? '',
      seo_keywords: data.seo_keywords ?? '',
      seo_description: data.seo_description ?? '',
    },
  })
}

// ---------------------------------------------------------------
// Admin: update category
// ---------------------------------------------------------------
export async function update(
  id: number,
  data: {
    parent_id?: number
    name?: string
    pinyin?: string
    path?: string
    description?: string
    type?: number
    url?: string
    order_by?: number
    target?: number
    status?: number
    mid?: number | null
    list_view?: string
    article_view?: string
    seo_title?: string
    seo_keywords?: string
    seo_description?: string
  },
) {
  const existing = await prisma.cms_category.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('栏目不存在'), { statusCode: 404 })
  }

  // Prevent circular parent reference
  if (data.parent_id !== undefined) {
    if (data.parent_id === id) {
      throw Object.assign(new Error('不能将自身设为父级栏目'), { statusCode: 400 })
    }
    if (data.parent_id > 0) {
      // Make sure the new parent is not a descendant of this category
      const descendants = await getDescendantIds(id)
      if (descendants.has(data.parent_id)) {
        throw Object.assign(new Error('不能将子栏目设为父级栏目'), { statusCode: 400 })
      }
      const parent = await prisma.cms_category.findUnique({
        where: { id: data.parent_id },
      })
      if (!parent) {
        throw Object.assign(new Error('父级栏目不存在'), { statusCode: 400 })
      }
    }
  }

  // Validate mid if changed
  if (data.mid !== undefined && data.mid !== null) {
    const model = await prisma.cms_model.findUnique({
      where: { id: data.mid },
    })
    if (!model) {
      throw Object.assign(new Error('关联模型不存在'), { statusCode: 400 })
    }
  }

  return prisma.cms_category.update({
    where: { id },
    data: data as any,
  })
}

// ---------------------------------------------------------------
// Admin: delete category (checks children and articles first)
// ---------------------------------------------------------------
export async function remove(id: number) {
  const existing = await prisma.cms_category.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('栏目不存在'), { statusCode: 404 })
  }

  // Check for child categories
  const childCount = await prisma.cms_category.count({
    where: { parent_id: id },
  })
  if (childCount > 0) {
    throw Object.assign(new Error('请先删除子栏目'), { statusCode: 400 })
  }

  // Check for articles in this category
  const articleCount = await prisma.cms_article.count({
    where: { cid: id },
  })
  if (articleCount > 0) {
    throw Object.assign(new Error('栏目下存在文章，无法删除'), { statusCode: 400 })
  }

  return prisma.cms_category.delete({ where: { id } })
}

// ---------------------------------------------------------------
// Admin: update category sort order
// ---------------------------------------------------------------
export async function updateSort(id: number, order_by: number) {
  const existing = await prisma.cms_category.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('栏目不存在'), { statusCode: 404 })
  }

  return prisma.cms_category.update({
    where: { id },
    data: { order_by },
  })
}

// ---------------------------------------------------------------
// Utility: get all descendant IDs of a category
// ---------------------------------------------------------------
async function getDescendantIds(parentId: number): Promise<Set<number>> {
  const ids = new Set<number>()
  const queue = [parentId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const children = await prisma.cms_category.findMany({
      where: { parent_id: currentId },
      select: { id: true },
    })
    for (const child of children) {
      if (!ids.has(child.id)) {
        ids.add(child.id)
        queue.push(child.id)
      }
    }
  }

  return ids
}
