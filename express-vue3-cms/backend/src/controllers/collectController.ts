import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import { logger } from '../config/logger.js'
import * as collectService from '../services/collectService.js'
import type {
  CreateCollectInput,
  UpdateCollectInput,
  CreateGatherInput,
  UpdateGatherInput,
} from '../services/collectService.js'

// ===========================================================================
// Collect (页面采集) handlers
// ===========================================================================

export async function list(req: Request, res: Response) {
  const collects = await collectService.listCollects()
  success(res, collects)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const collect = await collectService.getCollectById(id)
  if (!collect) {
    return error(res, '采集任务不存在', 404)
  }

  success(res, collect)
}

export async function create(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>

  if (!body.task_name || !body.target_url || body.cid === undefined) {
    return error(res, 'task_name、target_url、cid 为必填项', 400)
  }

  const cid = Number(body.cid)
  if (Number.isNaN(cid) || cid <= 0) {
    return error(res, 'cid 必须为正整数', 400)
  }

  const input: CreateCollectInput = {
    task_name: String(body.task_name),
    cid,
    target_url: String(body.target_url),
    list_tag: body.list_tag ? String(body.list_tag) : undefined,
    start_num: body.start_num !== undefined ? Number(body.start_num) : undefined,
    end_num: body.end_num !== undefined ? Number(body.end_num) : undefined,
    increment: body.increment ? String(body.increment) : undefined,
    title_tag: body.title_tag ? String(body.title_tag) : undefined,
    article_tag: body.article_tag ? String(body.article_tag) : undefined,
    charset: body.charset !== undefined ? Number(body.charset) : undefined,
    pages: body.pages ? String(body.pages) : undefined,
    parse_data: body.parse_data ? String(body.parse_data) : undefined,
  }

  try {
    const collect = await collectService.createCollect(input)
    success(res, collect, '创建成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '创建采集任务失败'
    logger.error('[CollectController] create error:', err)
    return error(res, message, 500)
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const body = req.body as Record<string, unknown>
  const input: UpdateCollectInput = {}

  if (body.task_name !== undefined) input.task_name = String(body.task_name)
  if (body.cid !== undefined) input.cid = Number(body.cid)
  if (body.target_url !== undefined) input.target_url = String(body.target_url)
  if (body.list_tag !== undefined) input.list_tag = String(body.list_tag)
  if (body.start_num !== undefined) input.start_num = Number(body.start_num)
  if (body.end_num !== undefined) input.end_num = Number(body.end_num)
  if (body.increment !== undefined) input.increment = String(body.increment)
  if (body.title_tag !== undefined) input.title_tag = String(body.title_tag)
  if (body.article_tag !== undefined) input.article_tag = String(body.article_tag)
  if (body.charset !== undefined) input.charset = Number(body.charset)
  if (body.pages !== undefined) input.pages = String(body.pages)
  if (body.parse_data !== undefined) input.parse_data = String(body.parse_data)
  if (body.status !== undefined) input.status = Number(body.status)

  if (Object.keys(input).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const collect = await collectService.updateCollect(id, input)
    if (!collect) {
      return error(res, '采集任务不存在', 404)
    }
    success(res, collect, '更新成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '更新采集任务失败'
    logger.error('[CollectController] update error:', err)
    return error(res, message, 500)
  }
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  try {
    const collect = await collectService.deleteCollect(id)
    if (!collect) {
      return error(res, '采集任务不存在', 404)
    }
    success(res, null, '删除成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除采集任务失败'
    logger.error('[CollectController] remove error:', err)
    return error(res, message, 500)
  }
}

export async function execute(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  try {
    const result = await collectService.executeCollect(id)
    success(res, result, `采集完成，成功 ${result.saved} 条`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '执行采集失败'
    const code =
      (err as Record<string, unknown>).status !== undefined
        ? Number((err as Record<string, unknown>).status)
        : 500
    logger.error('[CollectController] execute error:', err)
    return error(res, message, code)
  }
}

// ===========================================================================
// Gather (接口采集) handlers
// ===========================================================================

export async function listGather(req: Request, res: Response) {
  const gathers = await collectService.listGathers()
  success(res, gathers)
}

export async function getGatherById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const gather = await collectService.getGatherById(id)
  if (!gather) {
    return error(res, '接口采集任务不存在', 404)
  }

  success(res, gather)
}

export async function createGather(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>

  if (!body.task_name || !body.target_url || body.cid === undefined) {
    return error(res, 'task_name、target_url、cid 为必填项', 400)
  }

  const cid = Number(body.cid)
  if (Number.isNaN(cid) || cid <= 0) {
    return error(res, 'cid 必须为正整数', 400)
  }

  const input: CreateGatherInput = {
    task_name: String(body.task_name),
    cid,
    target_url: String(body.target_url),
    parse_data: body.parse_data ? String(body.parse_data) : undefined,
  }

  try {
    const gather = await collectService.createGather(input)
    success(res, gather, '创建成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '创建接口采集任务失败'
    logger.error('[GatherController] create error:', err)
    return error(res, message, 500)
  }
}

export async function updateGather(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const body = req.body as Record<string, unknown>
  const input: UpdateGatherInput = {}

  if (body.task_name !== undefined) input.task_name = String(body.task_name)
  if (body.cid !== undefined) input.cid = Number(body.cid)
  if (body.target_url !== undefined) input.target_url = String(body.target_url)
  if (body.parse_data !== undefined) input.parse_data = String(body.parse_data)
  if (body.status !== undefined) input.status = Number(body.status)

  if (Object.keys(input).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const gather = await collectService.updateGather(id, input)
    if (!gather) {
      return error(res, '接口采集任务不存在', 404)
    }
    success(res, gather, '更新成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '更新接口采集任务失败'
    logger.error('[GatherController] update error:', err)
    return error(res, message, 500)
  }
}

export async function deleteGather(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  try {
    const gather = await collectService.deleteGather(id)
    if (!gather) {
      return error(res, '接口采集任务不存在', 404)
    }
    success(res, null, '删除成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除接口采集任务失败'
    logger.error('[GatherController] delete error:', err)
    return error(res, message, 500)
  }
}

export async function executeGather(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  try {
    const result = await collectService.executeGather(id)
    success(res, result, `采集完成，成功 ${result.saved} 条`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '执行接口采集失败'
    const code =
      (err as Record<string, unknown>).status !== undefined
        ? Number((err as Record<string, unknown>).status)
        : 500
    logger.error('[GatherController] execute error:', err)
    return error(res, message, code)
  }
}
