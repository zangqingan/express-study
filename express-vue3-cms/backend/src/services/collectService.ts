import axios from 'axios'
import * as cheerio from 'cheerio'
import { VM } from 'vm2'
import { prisma } from '../config/database.js'
import { logger } from '../config/logger.js'

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

export interface CreateCollectInput {
  task_name: string
  cid: number
  target_url: string
  list_tag?: string
  start_num?: number
  end_num?: number
  increment?: string
  title_tag?: string
  article_tag?: string
  charset?: number
  pages?: string
  parse_data?: string
}

export interface UpdateCollectInput {
  task_name?: string
  cid?: number
  target_url?: string
  list_tag?: string
  start_num?: number
  end_num?: number
  increment?: string
  title_tag?: string
  article_tag?: string
  charset?: number
  pages?: string
  parse_data?: string
  status?: number
}

export interface CreateGatherInput {
  task_name: string
  cid: number
  target_url: string
  parse_data?: string
}

export interface UpdateGatherInput {
  task_name?: string
  cid?: number
  target_url?: string
  parse_data?: string
  status?: number
}

interface ScrapedItem {
  title: string
  content: string
  link?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Collect (页面采集) CRUD
// ---------------------------------------------------------------------------

export async function listCollects() {
  return prisma.plus_collect.findMany({ orderBy: { id: 'desc' } })
}

export async function getCollectById(id: number) {
  return prisma.plus_collect.findUnique({ where: { id } })
}

export async function createCollect(input: CreateCollectInput) {
  return prisma.plus_collect.create({
    data: {
      task_name: input.task_name,
      cid: input.cid,
      target_url: input.target_url,
      list_tag: input.list_tag || '',
      start_num: input.start_num ?? 1,
      end_num: input.end_num ?? 0,
      increment: input.increment || '1',
      title_tag: input.title_tag || '',
      article_tag: input.article_tag || '',
      charset: input.charset ?? 1,
      pages: input.pages || '',
      parse_data: input.parse_data || '',
      status: 1,
    },
  })
}

export async function updateCollect(id: number, input: UpdateCollectInput) {
  const existing = await prisma.plus_collect.findUnique({ where: { id } })
  if (!existing) return null

  const data: Record<string, unknown> = {}
  if (input.task_name !== undefined) data.task_name = input.task_name
  if (input.cid !== undefined) data.cid = input.cid
  if (input.target_url !== undefined) data.target_url = input.target_url
  if (input.list_tag !== undefined) data.list_tag = input.list_tag
  if (input.start_num !== undefined) data.start_num = input.start_num
  if (input.end_num !== undefined) data.end_num = input.end_num
  if (input.increment !== undefined) data.increment = input.increment
  if (input.title_tag !== undefined) data.title_tag = input.title_tag
  if (input.article_tag !== undefined) data.article_tag = input.article_tag
  if (input.charset !== undefined) data.charset = input.charset
  if (input.pages !== undefined) data.pages = input.pages
  if (input.parse_data !== undefined) data.parse_data = input.parse_data
  if (input.status !== undefined) data.status = input.status

  return prisma.plus_collect.update({ where: { id }, data })
}

export async function deleteCollect(id: number) {
  const existing = await prisma.plus_collect.findUnique({ where: { id } })
  if (!existing) return null
  return prisma.plus_collect.delete({ where: { id } })
}

// ---------------------------------------------------------------------------
// Collect execution
// ---------------------------------------------------------------------------

async function fetchPage(url: string, charset: number): Promise<string> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CMS-Collect/1.0)' },
  })
  // charset: 1=UTF-8, 2=GBK, 3=GB2312
  const encodingMap: Record<number, string> = {
    1: 'utf-8',
    2: 'gbk',
    3: 'gb2312',
  }
  const encoding = encodingMap[charset] || 'utf-8'
  const decoder = new TextDecoder(encoding)
  return decoder.decode(response.data)
}

function generatePageUrls(
  baseUrl: string,
  startNum: number,
  endNum: number,
  increment: string,
): string[] {
  const urls: string[] = []
  // increment can be a number (e.g. "1", "5") or a placeholder pattern
  const step = parseInt(increment, 10) || 1

  if (baseUrl.includes('{page}')) {
    for (let i = startNum; i <= endNum; i += step) {
      urls.push(baseUrl.replace(/\{page\}/g, String(i)))
    }
  } else if (baseUrl.includes('[*]')) {
    for (let i = startNum; i <= endNum; i += step) {
      urls.push(baseUrl.replace(/\[\*\]/g, String(i)))
    }
  } else {
    // Single page mode — just the base URL
    urls.push(baseUrl)
  }

  return urls
}

/**
 * Execute a collect task — scrapes HTML pages, extracts articles, and saves
 * them to cms_article.
 */
export async function executeCollect(id: number): Promise<{ saved: number; errors: string[] }> {
  const task = await prisma.plus_collect.findUnique({ where: { id } })
  if (!task) {
    throw Object.assign(new Error('采集任务不存在'), { status: 404 })
  }

  // Verify the category exists
  const category = await prisma.cms_category.findUnique({ where: { id: task.cid } })
  if (!category) {
    throw Object.assign(new Error('目标栏目不存在'), { status: 400 })
  }

  const errors: string[] = []
  let saved = 0

  // Generate the list of page URLs to scrape
  const pageUrls = generatePageUrls(
    task.target_url || '',
    task.start_num || 1,
    task.end_num || 0,
    task.increment || '1',
  )

  logger.info(
    `[CollectService] Executing task "${task.task_name}" — ${pageUrls.length} page(s)`,
  )

  for (const pageUrl of pageUrls) {
    try {
      logger.info(`[CollectService] Fetching: ${pageUrl}`)
      const html = await fetchPage(pageUrl, task.charset || 1)
      const $ = cheerio.load(html)
      const items: ScrapedItem[] = []

      // If a list_tag is provided, use it to select list items
      // Otherwise, parse the page as a single article
      if (task.list_tag) {
        const listElements = $(task.list_tag)
        listElements.each((_i, el) => {
          const $el = $(el)
          const title = task.title_tag
            ? $el.find(task.title_tag).first().text().trim()
            : $el.text().trim().substring(0, 100)
          const link = $el.find('a').first().attr('href') || ''
          const item: ScrapedItem = { title, content: '', link }
          items.push(item)
        })

        // Fetch each linked article individually
        for (const item of items) {
          if (!item.link) continue
          try {
            const resolvedUrl = item.link.startsWith('http')
              ? item.link
              : new URL(item.link, pageUrl).href
            const articleHtml = await fetchPage(resolvedUrl, task.charset || 1)
            const $article = cheerio.load(articleHtml)
            item.content = task.article_tag
              ? $article(task.article_tag).html() || ''
              : $article('body').html() || ''
          } catch (fetchErr: unknown) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
            errors.push(`获取文章页面失败 [${item.link}]: ${msg}`)
            // Still try to save with empty content
            item.content = ''
          }
        }
      } else {
        // Single page: extract title and content directly
        const title = task.title_tag
          ? $(task.title_tag).first().text().trim()
          : $('title').first().text().trim()
        const content = task.article_tag
          ? $(task.article_tag).html() || ''
          : $('body').html() || ''
        items.push({ title, content, link: pageUrl })
      }

      // Apply vm2 sandbox transform if parse_data script is provided
      for (const item of items) {
        let processedItem = { ...item }

        if (task.parse_data && task.parse_data.trim()) {
          try {
            const vm = new VM({
              timeout: 10000,
              sandbox: { data: processedItem, console },
            })
            const result = vm.run(`(function(data) { ${task.parse_data} })(data)`)
            if (result && typeof result === 'object') {
              processedItem = result as ScrapedItem
            }
          } catch (vmErr: unknown) {
            const msg = vmErr instanceof Error ? vmErr.message : String(vmErr)
            errors.push(`脚本执行失败 [${item.title}]: ${msg}`)
          }
        }

        // Save to cms_article
        try {
          await prisma.cms_article.create({
            data: {
              cid: task.cid,
              title: processedItem.title || '未命名文章',
              content: processedItem.content || '',
              source: processedItem.link || pageUrl,
              status: 1,
            },
          })
          saved++
        } catch (saveErr: unknown) {
          const msg = saveErr instanceof Error ? saveErr.message : String(saveErr)
          errors.push(`保存文章失败 [${processedItem.title}]: ${msg}`)
        }
      }
    } catch (pageErr: unknown) {
      const msg = pageErr instanceof Error ? pageErr.message : String(pageErr)
      errors.push(`抓取页面失败 [${pageUrl}]: ${msg}`)
      logger.error(`[CollectService] Page fetch error for ${pageUrl}:`, pageErr)
    }
  }

  // Update the task's updated_at
  await prisma.plus_collect
    .update({ where: { id }, data: { updated_at: new Date() } })
    .catch(() => {})

  logger.info(`[CollectService] Task "${task.task_name}" done — saved=${saved}, errors=${errors.length}`)
  return { saved, errors }
}

// ---------------------------------------------------------------------------
// Gather (接口采集) CRUD
// ---------------------------------------------------------------------------

export async function listGathers() {
  return prisma.plus_gather.findMany({ orderBy: { id: 'desc' } })
}

export async function getGatherById(id: number) {
  return prisma.plus_gather.findUnique({ where: { id } })
}

export async function createGather(input: CreateGatherInput) {
  return prisma.plus_gather.create({
    data: {
      task_name: input.task_name,
      cid: input.cid,
      target_url: input.target_url,
      parse_data: input.parse_data || '',
      status: 1,
    },
  })
}

export async function updateGather(id: number, input: UpdateGatherInput) {
  const existing = await prisma.plus_gather.findUnique({ where: { id } })
  if (!existing) return null

  const data: Record<string, unknown> = {}
  if (input.task_name !== undefined) data.task_name = input.task_name
  if (input.cid !== undefined) data.cid = input.cid
  if (input.target_url !== undefined) data.target_url = input.target_url
  if (input.parse_data !== undefined) data.parse_data = input.parse_data
  if (input.status !== undefined) data.status = input.status

  return prisma.plus_gather.update({ where: { id }, data })
}

export async function deleteGather(id: number) {
  const existing = await prisma.plus_gather.findUnique({ where: { id } })
  if (!existing) return null
  return prisma.plus_gather.delete({ where: { id } })
}

// ---------------------------------------------------------------------------
// Gather execution
// ---------------------------------------------------------------------------

/**
 * Execute a gather task — fetches an API endpoint, transforms data through
 * a vm2 sandbox, and saves results to cms_article.
 */
export async function executeGather(id: number): Promise<{ saved: number; errors: string[] }> {
  const task = await prisma.plus_gather.findUnique({ where: { id } })
  if (!task) {
    throw Object.assign(new Error('接口采集任务不存在'), { status: 404 })
  }

  // Verify the category exists
  const category = await prisma.cms_category.findUnique({ where: { id: task.cid } })
  if (!category) {
    throw Object.assign(new Error('目标栏目不存在'), { status: 400 })
  }

  const errors: string[] = []
  let saved = 0

  logger.info(`[GatherService] Executing task "${task.task_name}" — ${task.target_url}`)

  try {
    // Fetch the API response
    const response = await axios.get(task.target_url || '', {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CMS-Gather/1.0)' },
      responseType: 'json',
    })

    let rawData: unknown = response.data

    // Apply vm2 sandbox transform if parse_data script is provided
    if (task.parse_data && task.parse_data.trim()) {
      try {
        const vm = new VM({
          timeout: 10000,
          sandbox: { data: rawData, console },
        })
        rawData = vm.run(`(function(data) { ${task.parse_data} })(data)`)
      } catch (vmErr: unknown) {
        const msg = vmErr instanceof Error ? vmErr.message : String(vmErr)
        throw Object.assign(new Error(`脚本执行失败: ${msg}`), { status: 500 })
      }
    }

    // Normalize rawData to an array of articles
    const articles: Array<{ title?: string; content?: string; link?: string; [key: string]: unknown }> = []
    if (Array.isArray(rawData)) {
      for (const item of rawData) {
        if (typeof item === 'object' && item !== null) {
          articles.push(item as Record<string, unknown>)
        }
      }
    } else if (typeof rawData === 'object' && rawData !== null) {
      const obj = rawData as Record<string, unknown>
      // Check common API wrapper formats: { data: { list: [...] } }, { list: [...] }, { data: [...] }
      const list =
        (obj.data as Record<string, unknown>)?.list ||
        obj.list ||
        obj.data
      if (Array.isArray(list)) {
        for (const item of list) {
          if (typeof item === 'object' && item !== null) {
            articles.push(item as Record<string, unknown>)
          }
        }
      } else {
        // Single object — treat as one article
        articles.push(obj)
      }
    }

    // Save articles
    for (const item of articles) {
      try {
        await prisma.cms_article.create({
          data: {
            cid: task.cid,
            title: String(item.title || '未命名文章'),
            content: String(item.content || JSON.stringify(item)),
            source: String(item.link || task.target_url || ''),
            status: 1,
          },
        })
        saved++
      } catch (saveErr: unknown) {
        const msg = saveErr instanceof Error ? saveErr.message : String(saveErr)
        errors.push(`保存文章失败: ${msg}`)
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error(`[GatherService] Execution error for task ${id}:`, err)
    throw Object.assign(new Error(msg), { status: (err as Record<string, unknown>).status || 500 })
  }

  // Update the task's updated_at
  await prisma.plus_gather
    .update({ where: { id }, data: { updated_at: new Date() } })
    .catch(() => {})

  logger.info(`[GatherService] Task "${task.task_name}" done — saved=${saved}, errors=${errors.length}`)
  return { saved, errors }
}
