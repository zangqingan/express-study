import { prisma } from '../config/database.js'

// ---------------------------------------------------------------
// Public: list all tags
// ---------------------------------------------------------------
export async function findAll() {
  return prisma.cms_tag.findMany({
    orderBy: { id: 'asc' },
  })
}

// ---------------------------------------------------------------
// Admin: create tag
// ---------------------------------------------------------------
export async function create(data: {
  name: string
  path?: string
  ref_count?: number
}) {
  // Check for duplicate name
  const existing = await prisma.cms_tag.findFirst({
    where: { name: data.name },
  })
  if (existing) {
    throw Object.assign(new Error('标签名称已存在'), { statusCode: 400 })
  }

  return prisma.cms_tag.create({
    data: {
      name: data.name,
      path: data.path ?? '',
      ref_count: data.ref_count ?? 0,
    },
  })
}

// ---------------------------------------------------------------
// Admin: update tag
// ---------------------------------------------------------------
export async function update(
  id: number,
  data: {
    name?: string
    path?: string
    ref_count?: number
  },
) {
  const existing = await prisma.cms_tag.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('标签不存在'), { statusCode: 404 })
  }

  // Check for duplicate name if name is being changed
  if (data.name !== undefined && data.name !== existing.name) {
    const duplicate = await prisma.cms_tag.findFirst({
      where: { name: data.name },
    })
    if (duplicate) {
      throw Object.assign(new Error('标签名称已存在'), { statusCode: 400 })
    }
  }

  return prisma.cms_tag.update({
    where: { id },
    data: data as any,
  })
}

// ---------------------------------------------------------------
// Admin: delete tag (only if ref_count is 0)
// ---------------------------------------------------------------
export async function remove(id: number) {
  const existing = await prisma.cms_tag.findUnique({ where: { id } })
  if (!existing) {
    throw Object.assign(new Error('标签不存在'), { statusCode: 404 })
  }

  if (existing.ref_count > 0) {
    throw Object.assign(
      new Error('该标签仍有文章关联，无法删除'),
      { statusCode: 400 },
    )
  }

  return prisma.cms_tag.delete({ where: { id } })
}

// ---------------------------------------------------------------
// Admin: merge two tags
// Moves all article associations from sourceId to targetId,
// updates ref_count on both tags, then deletes the source tag.
// ---------------------------------------------------------------
export async function merge(sourceId: number, targetId: number) {
  if (sourceId === targetId) {
    throw Object.assign(new Error('不能将标签合并到自身'), { statusCode: 400 })
  }

  const [source, target] = await Promise.all([
    prisma.cms_tag.findUnique({ where: { id: sourceId } }),
    prisma.cms_tag.findUnique({ where: { id: targetId } }),
  ])

  if (!source) {
    throw Object.assign(new Error('源标签不存在'), { statusCode: 404 })
  }
  if (!target) {
    throw Object.assign(new Error('目标标签不存在'), { statusCode: 404 })
  }

  return prisma.$transaction(async (tx) => {
    // 1. Find all article-tag links for the source tag
    const sourceLinks = await tx.cms_article_tag.findMany({
      where: { tid: sourceId },
      select: { aid: true },
    })

    // 2. Find existing target-tag links (to avoid duplicate inserts)
    const targetLinks = await tx.cms_article_tag.findMany({
      where: { tid: targetId },
      select: { aid: true },
    })
    const targetArticleIds = new Set(targetLinks.map((l) => l.aid))

    // 3. For articles linked to source but NOT yet linked to target,
    //    add a new article_tag link to the target
    let newLinkCount = 0
    for (const link of sourceLinks) {
      if (!targetArticleIds.has(link.aid)) {
        await tx.cms_article_tag.create({
          data: { aid: link.aid, tid: targetId },
        })
        newLinkCount++
      }

      // 4. Update the article's tag_id field: replace sourceId with targetId
      const article = await tx.cms_article.findUnique({
        where: { id: link.aid },
        select: { id: true, tag_id: true },
      })
      if (article?.tag_id) {
        const tagIds = article.tag_id
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        const updatedIds = tagIds.map((t: string) =>
          t === String(sourceId) ? String(targetId) : t,
        )
        // Deduplicate (in case target already existed)
        const deduped = [...new Set(updatedIds)]
        await tx.cms_article.update({
          where: { id: article.id },
          data: { tag_id: deduped.join(',') },
        })
      }
    }

    // 5. Delete all source tag's article-tag links
    await tx.cms_article_tag.deleteMany({
      where: { tid: sourceId },
    })

    // 6. Update ref_count on the target tag (add source's count)
    await tx.cms_tag.update({
      where: { id: targetId },
      data: { ref_count: target.ref_count + source.ref_count },
    })

    // 7. Delete the source tag
    await tx.cms_tag.delete({ where: { id: sourceId } })

    return { success: true, mergedCount: sourceLinks.length, newLinks: newLinkCount }
  })
}
