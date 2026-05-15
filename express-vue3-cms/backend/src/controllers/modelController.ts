import type { Request, Response } from 'express'
import { success, error } from '../utils/response.js'
import { logger } from '../config/logger.js'
import * as modelService from '../services/modelService.js'
import type {
  CreateModelInput,
  UpdateModelInput,
  CreateFieldInput,
  UpdateFieldInput,
} from '../services/modelService.js'

// ---------------------------------------------------------------------------
// Model handlers
// ---------------------------------------------------------------------------

export async function list(req: Request, res: Response) {
  const models = await modelService.listModels()
  success(res, models)
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const model = await modelService.getModelWithFields(id)
  if (!model) {
    return error(res, '模型不存在', 404)
  }

  success(res, model)
}

export async function create(req: Request, res: Response) {
  const { model_name, table_name, remark } = req.body as Record<string, unknown>

  if (!model_name || !table_name) {
    return error(res, 'model_name 和 table_name 为必填项', 400)
  }

  const input: CreateModelInput = {
    model_name: String(model_name),
    table_name: String(table_name),
    remark: remark ? String(remark) : undefined,
  }

  try {
    const model = await modelService.createModel(input)
    success(res, model, '创建成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '创建模型失败'
    logger.error('[ModelController] create error:', err)
    return error(res, message, 500)
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  const body = req.body as Record<string, unknown>
  const input: UpdateModelInput = {}

  if (body.model_name !== undefined) input.model_name = String(body.model_name)
  if (body.table_name !== undefined) input.table_name = String(body.table_name)
  if (body.status !== undefined) input.status = Number(body.status)
  if (body.remark !== undefined) input.remark = String(body.remark)

  if (Object.keys(input).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const model = await modelService.updateModel(id, input)
    if (!model) {
      return error(res, '模型不存在', 404)
    }
    success(res, model, '更新成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '更新模型失败'
    logger.error('[ModelController] update error:', err)
    return error(res, message, 500)
  }
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return error(res, '无效的ID', 400)
  }

  try {
    const model = await modelService.deleteModel(id)
    if (!model) {
      return error(res, '模型不存在', 404)
    }
    success(res, null, '删除成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除模型失败'
    logger.error('[ModelController] remove error:', err)
    return error(res, message, 500)
  }
}

// ---------------------------------------------------------------------------
// Field handlers
// ---------------------------------------------------------------------------

export async function listFields(req: Request, res: Response) {
  const mid = Number(req.params.mid)
  if (Number.isNaN(mid)) {
    return error(res, '无效的模型ID', 400)
  }

  const model = await modelService.getModelWithFields(mid)
  if (!model) {
    return error(res, '模型不存在', 404)
  }

  success(res, model.cms_field)
}

export async function createField(req: Request, res: Response) {
  const mid = Number(req.params.mid)
  if (Number.isNaN(mid)) {
    return error(res, '无效的模型ID', 400)
  }

  const body = req.body as Record<string, unknown>

  if (!body.cname || !body.ename || body.type === undefined) {
    return error(res, 'cname、ename、type 为必填项', 400)
  }

  const type = Number(body.type)
  if (type < 1 || type > 7) {
    return error(res, 'type 必须在 1-7 之间', 400)
  }

  const input: CreateFieldInput = {
    cname: String(body.cname),
    ename: String(body.ename),
    type,
    val: body.val ? String(body.val) : undefined,
    default_val: body.default_val ? String(body.default_val) : undefined,
    order_by: body.order_by !== undefined ? Number(body.order_by) : undefined,
    length: body.length ? String(body.length) : undefined,
  }

  try {
    const field = await modelService.addField(mid, input)
    success(res, field, '添加字段成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '添加字段失败'
    logger.error('[ModelController] createField error:', err)
    return error(res, message, 500)
  }
}

export async function updateField(req: Request, res: Response) {
  const mid = Number(req.params.mid)
  const fieldId = Number(req.params.id)
  if (Number.isNaN(mid) || Number.isNaN(fieldId)) {
    return error(res, '无效的参数', 400)
  }

  const body = req.body as Record<string, unknown>
  const input: UpdateFieldInput = {}

  if (body.cname !== undefined) input.cname = String(body.cname)
  if (body.ename !== undefined) input.ename = String(body.ename)
  if (body.type !== undefined) input.type = Number(body.type)
  if (body.val !== undefined) input.val = String(body.val)
  if (body.default_val !== undefined) input.default_val = String(body.default_val)
  if (body.order_by !== undefined) input.order_by = Number(body.order_by)
  if (body.length !== undefined) input.length = String(body.length)

  if (Object.keys(input).length === 0) {
    return error(res, '没有需要更新的字段', 400)
  }

  try {
    const field = await modelService.updateField(mid, fieldId, input)
    if (!field) {
      return error(res, '字段不存在', 404)
    }
    success(res, field, '更新字段成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '更新字段失败'
    logger.error('[ModelController] updateField error:', err)
    return error(res, message, 500)
  }
}

export async function deleteField(req: Request, res: Response) {
  const mid = Number(req.params.mid)
  const fieldId = Number(req.params.id)
  if (Number.isNaN(mid) || Number.isNaN(fieldId)) {
    return error(res, '无效的参数', 400)
  }

  try {
    const field = await modelService.deleteField(mid, fieldId)
    if (!field) {
      return error(res, '字段不存在', 404)
    }
    success(res, null, '删除字段成功')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除字段失败'
    logger.error('[ModelController] deleteField error:', err)
    return error(res, message, 500)
  }
}
