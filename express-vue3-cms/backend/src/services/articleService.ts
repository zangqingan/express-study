import { prisma } from '../config/database.js'

// ---------------------------------------------------------------
// Public: paginated list with filters
// ---------------------------------------------------------------
export async function findMany(options: {
  page: number
  pageSize: number
  cid?: string
  status?: string
  keyword?: string
  tag?: string
  attr?: string
}) {
  const { page, pageSize, cid, status, keyword, tag, attr } = options
  const skip = (page - 1) * pageSize

  // Build Prisma where clause for simple filters
  const where: Record<string, unknown> = {}

  if (cid) {
    where.cid = Number(cid)
  }

  if (status !== undefined && status !== '') {
    where.status = Number(status)
  } else {
    // Public list defaults to published only
    where.status = 0
  }

  if (keyword) {
    where.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
      { short_title: { contains: keyword } },
    ]
  }

  if (tag) {
    // tag_id stores comma-separated tag IDs like "1,2,3"
    // FIND_IN_SET would be ideal but Prisma doesn't natively support it,
    // so we use contains for approximate matching
    where.tag_id = { contains: tag }
  }

  // For attr (bit flags), we need bitwise AND which Prisma doesn't support directly.
  // Use raw SQL for the combined query when attr filter is present.
  if (attr) {
    return findByManyWithAttrRaw({ page, pageSize, cid, status, keyword, tag, attr })
  }

  const [list, total] = await Promise.all([
    prisma.cms_article.findMany({
      where: where as any,
      skip,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    }),
    prisma.cms_article.count({ where: where as any }),
  ])

  return { list, total }
}

// ---------------------------------------------------------------
// Raw SQL query for list with attr (bit flag) filter
// ---------------------------------------------------------------
async function findByManyWithAttrRaw(options: {
  page: number
  pageSize: number
  cid?: string
  status?: string
  keyword?: string
  tag?: string
  attr: string
}) {
  const { page, pageSize, cid, status, keyword, tag, attr } = options
  const skip = (page - 1) * pageSize
  const attrNum = Number(attr)

  const conditions: string[] = []
  const params: (number | string)[] = []

  if (cid) {
    conditions.push('cid = ?')
    params.push(Number(cid))
  }
  if (status !== undefined && status !== '') {
    conditions.push('status = ?')
    params.push(Number(status))
  } else {
    conditions.push('status = 0')
  }
  if (keyword) {
    conditions.push('(title LIKE ? OR description LIKE ? OR short_title LIKE ?)')
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }
  if (tag) {
    conditions.push('FIND_IN_SET(?, tag_id) > 0')
    params.push(tag)
  }
  // Bitwise AND: (attr & N) = N
  conditions.push('(attr & ?) = ?')
  params.push(attrNum, attrNum)

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  const countSql = `SELECT COUNT(*) as total FROM cms_article ${whereClause}`
  const listSql = `SELECT * FROM cms_article ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`

  const [countResults, listResults] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ total: bigint }>>(countSql, ...params),
    prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(listSql, ...params, pageSize, skip),
  ])

  const total = Number(countResults[0].total)

  return { list: listResults as unknown[], total }
}

// ---------------------------------------------------------------
// Public: article detail with PV auto-increment
// ---------------------------------------------------------------
export async function findById(id: number) {
  // Atomically increment pv
  await prisma.$executeRaw`UPDATE cms_article SET pv = pv + 1 WHERE id = ${id}`

  const article = await prisma.cms_article.findUnique({
    where: { id },
    include: {
      cms_category: true,
      cms_article_tag: {
        include: {
          cms_tag: true,
        },
      },
    },
  })

  if (!article) {
    return null
  }

  // If the category has a model, also fetch extension table data
  let extData: Record<string, unknown> | null = null
  if (article.cms_category?.mid) {
    const model = await prisma.cms_model.findUnique({
      where: { id: article.cms_category.mid },
      include: { cms_field: { orderBy: { order_by: 'asc' } } },
    })
    if (model && model.table_name) {
      try {
        const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
          `SELECT * FROM \`${model.table_name}\` WHERE aid = ? LIMIT 1`,
          id,
        )
        if (rows.length > 0) {
          extData = rows[0]
        }
      } catch {
        // Extension table may not exist yet
        extData = null
      }
    }
    return { ...article, extData, model }
  }

  return { ...article, extData: null, model: null }
}

// ---------------------------------------------------------------
// Admin: create article
// ---------------------------------------------------------------
export async function create(data: {
  title: string
  cid: number
  content: string
  sub_cid?: string | null
  short_title?: string | null
  tag_id?: string | null
  attr?: number | null
  article_view?: string | null
  source?: string | null
  author?: string | null
  description?: string | null
  img?: string | null
  status?: number
  link?: string | null
  ext?: Record<string, unknown>
}) {
  const {
    title, cid, content, sub_cid, short_title, tag_id,
    attr, article_view, source, author, description,
    img, status, link, ext,
  } = data

  // Get category info (check if it has a model)
  const category = await prisma.cms_category.findUnique({
    where: { id: cid },
  })

  if (!category) {
    throw Object.assign(new Error('栏目不存在'), { statusCode: 400 })
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create the article
    const article = await tx.cms_article.create({
      data: {
        title,
        cid,
        content,
        sub_cid: sub_cid || null,
        short_title: short_title || null,
        tag_id: tag_id || null,
        attr: attr ?? null,
        article_view: article_view || null,
        source: source || null,
        author: author || null,
        description: description || null,
        img: img || null,
        status: status ?? 0,
        link: link || null,
        pv: 0,
      },
    })

    // 2. Handle tag associations
    if (tag_id) {
      await syncTagsForArticle(tx, article.id, tag_id, null)
    }

    // 3. Handle extension table fields if category has a model
    if (category.mid && ext && Object.keys(ext).length > 0) {
      await upsertExtensionData(tx, category.mid, article.id, ext)
    }

    return article
  })
}

// ---------------------------------------------------------------
// Admin: update article
// ---------------------------------------------------------------
export async function update(id: number, data: {
  title?: string
  cid?: number
  content?: string
  sub_cid?: string | null
  short_title?: string | null
  tag_id?: string | null
  attr?: number | null
  article_view?: string | null
  source?: string | null
  author?: string | null
  description?: string | null
  img?: string | null
  status?: number
  link?: string | null
  ext?: Record<string, unknown>
}) {
  const existing = await prisma.cms_article.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('文章不存在'), { statusCode: 404 })
  }

  // Determine effective cid
  const effectiveCid = data.cid ?? existing.cid
  const category = await prisma.cms_category.findUnique({
    where: { id: effectiveCid },
  })

  const oldTagId = existing.tag_id

  return prisma.$transaction(async (tx) => {
    // 1. Prepare article update data
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.cid !== undefined) updateData.cid = data.cid
    if (data.content !== undefined) updateData.content = data.content
    if (data.sub_cid !== undefined) updateData.sub_cid = data.sub_cid
    if (data.short_title !== undefined) updateData.short_title = data.short_title
    if (data.tag_id !== undefined) updateData.tag_id = data.tag_id
    if (data.attr !== undefined) updateData.attr = data.attr
    if (data.article_view !== undefined) updateData.article_view = data.article_view
    if (data.source !== undefined) updateData.source = data.source
    if (data.author !== undefined) updateData.author = data.author
    if (data.description !== undefined) updateData.description = data.description
    if (data.img !== undefined) updateData.img = data.img
    if (data.status !== undefined) updateData.status = data.status
    if (data.link !== undefined) updateData.link = data.link

    // 2. Update the article
    const article = await tx.cms_article.update({
      where: { id },
      data: updateData as any,
    })

    // 3. Sync tag associations if tag_id changed
    const newTagId = data.tag_id !== undefined ? data.tag_id : oldTagId
    if (data.tag_id !== undefined && data.tag_id !== (oldTagId ?? '')) {
      await syncTagsForArticle(tx, id, newTagId ?? '', oldTagId ?? '')
    }

    // 4. Handle extension table fields
    if (category?.mid && data.ext && Object.keys(data.ext).length > 0) {
      await upsertExtensionData(tx, category.mid, id, data.ext)
    }

    return article
  })
}

// ---------------------------------------------------------------
// Admin: delete article
// ---------------------------------------------------------------
export async function remove(id: number) {
  const existing = await prisma.cms_article.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          cms_article_tag: true,
        },
      },
    },
  })

  if (!existing) {
    throw Object.assign(new Error('文章不存在'), { statusCode: 404 })
  }

  // Check foreign key restrictions in extension tables and reading records
  const category = await prisma.cms_category.findUnique({
    where: { id: existing.cid },
  })

  return prisma.$transaction(async (tx) => {
    // 1. Clean up cms_article_tag associations
    if (existing._count.cms_article_tag > 0) {
      // Decrement ref_count for all associated tags
      const tagLinks = await tx.cms_article_tag.findMany({
        where: { aid: id },
        select: { tid: true },
      })

      await tx.cms_article_tag.deleteMany({ where: { aid: id } })

      for (const link of tagLinks) {
        if (link.tid) {
          await tx.$executeRaw`UPDATE cms_tag SET ref_count = GREATEST(ref_count - 1, 0) WHERE id = ${link.tid}`
        }
      }
    }

    // 2. Clean up extension table data if article belongs to a model
    if (category?.mid) {
      const model = await tx.cms_model.findUnique({ where: { id: category.mid } })
      if (model?.table_name) {
        try {
          await tx.$executeRawUnsafe(`DELETE FROM \`${model.table_name}\` WHERE aid = ?`, id)
        } catch {
          // Table may not exist
        }
      }
    }

    // 3. Clean up extend_model_download (explicit)
    try {
      await tx.extend_model_download.deleteMany({ where: { aid: id } })
    } catch {
      // May not exist
    }

    // 4. Delete the article
    // Note: user_reading_record has FK RESTRICT, so if there are reading records,
    // this will fail. In production, you might want to clean those up first.
    try {
      await tx.user_reading_record.deleteMany({ where: { article_id: id } })
    } catch {
      // May not exist or table may not have data
    }

    await tx.cms_article.delete({ where: { id } })

    return { success: true }
  })
}

// ---------------------------------------------------------------
// Admin: toggle article status (publish/draft)
// ---------------------------------------------------------------
export async function updateStatus(id: number) {
  const existing = await prisma.cms_article.findUnique({
    where: { id },
    select: { id: true, status: true },
  })

  if (!existing) {
    throw Object.assign(new Error('文章不存在'), { statusCode: 404 })
  }

  // Toggle: 0 (published) -> 1 (draft), 1 (draft) -> 0 (published)
  const newStatus = existing.status === 0 ? 1 : 0

  return prisma.cms_article.update({
    where: { id },
    data: { status: newStatus },
  })
}

// ---------------------------------------------------------------
// Tag sync helpers
// ---------------------------------------------------------------

/**
 * Sync cms_article_tag entries and cms_tag.ref_count for an article.
 * Removes old tags (from oldTagIds) and inserts new tags (from newTagIds).
 */
async function syncTagsForArticle(
  tx: any,
  articleId: number,
  newTagIds: string,
  oldTagIds: string | null,
) {
  const newIds = parseCommaSeparated(newTagIds)
  const oldIds = parseCommaSeparated(oldTagIds ?? '')

  // Tags to remove (in old but not in new)
  const toRemove = oldIds.filter((id) => !newIds.includes(id))
  // Tags to add (in new but not in old)
  const toAdd = newIds.filter((id) => !oldIds.includes(id))

  for (const tid of toRemove) {
    await tx.cms_article_tag.deleteMany({
      where: { aid: articleId, tid },
    })
    await tx.$executeRaw`UPDATE cms_tag SET ref_count = GREATEST(ref_count - 1, 0) WHERE id = ${tid}`
  }

  for (const tid of toAdd) {
    // Ensure tag exists
    const tag = await tx.cms_tag.findUnique({ where: { id: tid } })
    if (tag) {
      await tx.cms_article_tag.create({
        data: { aid: articleId, tid },
      })
      await tx.cms_tag.update({
        where: { id: tid },
        data: { ref_count: { increment: 1 } },
      })
    }
  }
}

// ---------------------------------------------------------------
// Extension table helpers
// ---------------------------------------------------------------

/**
 * Upsert extension table data for an article.
 * Looks up the model, gets its fields, and dynamically inserts/updates
 * the extension table record.
 */
async function upsertExtensionData(
  tx: any,
  mid: number,
  articleId: number,
  extData: Record<string, unknown>,
) {
  const model = await tx.cms_model.findUnique({
    where: { id: mid },
    include: { cms_field: true },
  })

  if (!model || !model.table_name) return

  const tableName = model.table_name

  // Check if record exists
  const existing = await tx.$queryRawUnsafe<Array<{ cnt: bigint }>>(
    `SELECT COUNT(*) as cnt FROM \`${tableName}\` WHERE aid = ?`,
    articleId,
  )

  // Filter extData to only include fields defined in cms_field
  const fieldNames = model.cms_field.map((f: { ename: string | null }) =>
    f.ename?.trim(),
  ).filter(Boolean)

  const filteredData: Record<string, unknown> = {}
  for (const fieldName of fieldNames) {
    if (fieldName && extData[fieldName] !== undefined) {
      filteredData[fieldName] = extData[fieldName]
    }
  }

  if (Object.keys(filteredData).length === 0) return

  const count = Number(existing[0]?.cnt ?? 0)

  if (count > 0) {
    // Update
    const setClauses = Object.keys(filteredData)
      .map((key) => `\`${key}\` = ?`)
      .join(', ')
    const values = Object.values(filteredData)
    await tx.$queryRawUnsafe(
      `UPDATE \`${tableName}\` SET ${setClauses} WHERE aid = ?`,
      ...values,
      articleId,
    )
  } else {
    // Insert
    const columns = Object.keys(filteredData)
    const placeholders = columns.map(() => '?').join(', ')
    const values = Object.values(filteredData)
    await tx.$queryRawUnsafe(
      `INSERT INTO \`${tableName}\` (aid, ${columns.map((c) => `\`${c}\``).join(', ')}) VALUES (?, ${placeholders})`,
      articleId,
      ...values,
    )
  }
}

// ---------------------------------------------------------------
// Utility
// ---------------------------------------------------------------

function parseCommaSeparated(str: string): number[] {
  if (!str || !str.trim()) return []
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0)
}
