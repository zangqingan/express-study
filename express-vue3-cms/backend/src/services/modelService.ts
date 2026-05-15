import { prisma } from '../config/database.js'
import { logger } from '../config/logger.js'

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

export interface CreateModelInput {
  model_name: string
  table_name: string
  remark?: string
}

export interface UpdateModelInput {
  model_name?: string
  table_name?: string
  status?: number
  remark?: string
}

export interface CreateFieldInput {
  cname: string
  ename: string
  type: number
  val?: string
  default_val?: string
  order_by?: number
  length?: string
}

export interface UpdateFieldInput {
  cname?: string
  ename?: string
  type?: number
  val?: string
  default_val?: string
  order_by?: number
  length?: string
}

// ---------------------------------------------------------------------------
// Field type → MySQL column type mapping
// ---------------------------------------------------------------------------

function fieldTypeToMySQL(type: number, length?: string): string {
  switch (type) {
    case 1: // 单行文本
      return `VARCHAR(${length && /^\d+$/.test(length) ? length : 255})`
    case 2: // 多行文本
      return 'TEXT'
    case 3: // 下拉
    case 4: // 单选
    case 5: // 多选
      return 'VARCHAR(255)'
    case 6: // 日期
      return 'DATE'
    case 7: // 数字
      return 'INT'
    default:
      return 'VARCHAR(255)'
  }
}

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

// ---------------------------------------------------------------------------
// Model CRUD
// ---------------------------------------------------------------------------

export async function listModels() {
  const models = await prisma.cms_model.findMany({
    include: { cms_field: true },
    orderBy: { id: 'asc' },
  })
  return models
}

export async function getModelWithFields(id: number) {
  const model = await prisma.cms_model.findUnique({
    where: { id },
    include: { cms_field: { orderBy: { order_by: 'asc' } } },
  })
  return model
}

export async function createModel(input: CreateModelInput) {
  const { model_name, table_name, remark } = input

  // Create the model record
  const model = await prisma.cms_model.create({
    data: {
      model_name,
      table_name,
      remark: remark || '',
      status: 1,
    },
  })

  // Create the corresponding extension table
  try {
    const safeTable = sanitiseName(table_name)
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const fullTableName = `${tablePrefix}ext_${safeTable}`
    const sql = `CREATE TABLE IF NOT EXISTS \`${fullTableName}\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`aid\` INT UNSIGNED DEFAULT NULL COMMENT '关联文章ID',
  PRIMARY KEY (\`id\`),
  INDEX \`idx_aid\` (\`aid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='${model_name}扩展表'`
    await prisma.$executeRawUnsafe(sql)
    logger.info(`[ModelService] Created extension table: ${fullTableName}`)
  } catch (err: unknown) {
    // If table creation fails, remove the model record to keep consistency
    await prisma.cms_model.delete({ where: { id: model.id } }).catch(() => {})
    logger.error(`[ModelService] Failed to create extension table for model ${model.id}:`, err)
    throw err
  }

  return model
}

export async function updateModel(id: number, input: UpdateModelInput) {
  const existing = await prisma.cms_model.findUnique({ where: { id } })
  if (!existing) return null

  const data: Record<string, unknown> = {}
  if (input.model_name !== undefined) data.model_name = input.model_name
  if (input.remark !== undefined) data.remark = input.remark
  if (input.status !== undefined) data.status = input.status

  // If table_name changes, rename the extension table
  if (input.table_name !== undefined && input.table_name !== existing.table_name) {
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const oldName = `${tablePrefix}ext_${sanitiseName(existing.table_name || '')}`
    const newName = `${tablePrefix}ext_${sanitiseName(input.table_name)}`
    try {
      await prisma.$executeRawUnsafe(
        `RENAME TABLE \`${oldName}\` TO \`${newName}\``,
      )
      data.table_name = input.table_name
      logger.info(`[ModelService] Renamed extension table: ${oldName} -> ${newName}`)
    } catch (err: unknown) {
      logger.error(`[ModelService] Failed to rename extension table:`, err)
      // Don't throw — model metadata update still succeeds
    }
  }

  return prisma.cms_model.update({ where: { id }, data })
}

export async function deleteModel(id: number) {
  const model = await prisma.cms_model.findUnique({ where: { id } })
  if (!model) return null

  // The cms_field records are cascade-deleted by the FK constraint in Prisma
  // Delete the model (this will cascade-delete related cms_field rows)
  const deleted = await prisma.cms_model.delete({ where: { id } })

  // Drop the extension table
  try {
    const safeTable = sanitiseName(model.table_name || '')
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const fullTableName = `${tablePrefix}ext_${safeTable}`
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${fullTableName}\``)
    logger.info(`[ModelService] Dropped extension table: ${fullTableName}`)
  } catch (err: unknown) {
    logger.error(`[ModelService] Failed to drop extension table for model ${id}:`, err)
  }

  return deleted
}

// ---------------------------------------------------------------------------
// Field CRUD (within model context)
// ---------------------------------------------------------------------------

export async function addField(mid: number, input: CreateFieldInput) {
  // Verify model exists
  const model = await prisma.cms_model.findUnique({ where: { id: mid } })
  if (!model) {
    const err = new Error('模型不存在')
    ;(err as Record<string, unknown>).status = 404
    throw err
  }

  // Create the field record
  const field = await prisma.cms_field.create({
    data: {
      mid,
      cname: input.cname,
      ename: input.ename,
      type: input.type,
      val: input.val || '',
      default_val: input.default_val || '',
      order_by: input.order_by ?? 0,
      length: input.length || '',
    },
  })

  // ALTER TABLE ADD COLUMN
  try {
    const safeTable = sanitiseName(model.table_name || '')
    const safeCol = sanitiseName(input.ename)
    const colType = fieldTypeToMySQL(input.type, input.length)
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const fullTableName = `${tablePrefix}ext_${safeTable}`

    const defaultVal =
      input.default_val !== undefined && input.default_val !== ''
        ? `'${input.default_val.replace(/'/g, "\\'")}'`
        : null

    const sql = defaultVal
      ? `ALTER TABLE \`${fullTableName}\` ADD COLUMN \`${safeCol}\` ${colType} DEFAULT ${defaultVal}`
      : `ALTER TABLE \`${fullTableName}\` ADD COLUMN \`${safeCol}\` ${colType}`

    await prisma.$executeRawUnsafe(sql)
    logger.info(`[ModelService] Added column ${safeCol} to ${fullTableName}`)
  } catch (err: unknown) {
    // Rollback the field record if DDL fails
    await prisma.cms_field.delete({ where: { id: field.id } }).catch(() => {})
    logger.error(`[ModelService] Failed to add column for field ${field.id}:`, err)
    throw err
  }

  return field
}

export async function updateField(mid: number, fieldId: number, input: UpdateFieldInput) {
  const model = await prisma.cms_model.findUnique({ where: { id: mid } })
  if (!model) {
    const err = new Error('模型不存在')
    ;(err as Record<string, unknown>).status = 404
    throw err
  }

  const existingField = await prisma.cms_field.findFirst({
    where: { id: fieldId, mid },
  })
  if (!existingField) return null

  // Update the field record
  const data: Record<string, unknown> = {}
  if (input.cname !== undefined) data.cname = input.cname
  if (input.ename !== undefined) data.ename = input.ename
  if (input.type !== undefined) data.type = input.type
  if (input.val !== undefined) data.val = input.val
  if (input.default_val !== undefined) data.default_val = input.default_val
  if (input.order_by !== undefined) data.order_by = input.order_by
  if (input.length !== undefined) data.length = input.length

  const updatedField = await prisma.cms_field.update({
    where: { id: fieldId },
    data,
  })

  // ALTER TABLE MODIFY COLUMN
  try {
    const safeTable = sanitiseName(model.table_name || '')
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const fullTableName = `${tablePrefix}ext_${safeTable}`

    const oldCol = sanitiseName(existingField.ename || '')
    const newCol = sanitiseName(updatedField.ename || '')
    const hasEnameChange = oldCol !== newCol
    const newType = fieldTypeToMySQL(updatedField.type || 1, updatedField.length || '')

    if (hasEnameChange) {
      // Rename + modify
      const sql = `ALTER TABLE \`${fullTableName}\` CHANGE \`${oldCol}\` \`${newCol}\` ${newType}`
      await prisma.$executeRawUnsafe(sql)
      logger.info(`[ModelService] Renamed/changed column ${oldCol} -> ${newCol} in ${fullTableName}`)
    } else {
      // Only modify
      const sql = `ALTER TABLE \`${fullTableName}\` MODIFY COLUMN \`${newCol}\` ${newType}`
      await prisma.$executeRawUnsafe(sql)
      logger.info(`[ModelService] Modified column ${newCol} in ${fullTableName}`)
    }
  } catch (err: unknown) {
    logger.error(`[ModelService] Failed to modify column for field ${fieldId}:`, err)
    throw err
  }

  return updatedField
}

export async function deleteField(mid: number, fieldId: number) {
  const model = await prisma.cms_model.findUnique({ where: { id: mid } })
  if (!model) {
    const err = new Error('模型不存在')
    ;(err as Record<string, unknown>).status = 404
    throw err
  }

  const field = await prisma.cms_field.findFirst({
    where: { id: fieldId, mid },
  })
  if (!field) return null

  // Delete the field record
  await prisma.cms_field.delete({ where: { id: fieldId } })

  // ALTER TABLE DROP COLUMN
  try {
    const safeTable = sanitiseName(model.table_name || '')
    const safeCol = sanitiseName(field.ename || '')
    const tablePrefix = process.env.TABLE_PREFIX || ''
    const fullTableName = `${tablePrefix}ext_${safeTable}`
    await prisma.$executeRawUnsafe(
      `ALTER TABLE \`${fullTableName}\` DROP COLUMN \`${safeCol}\``,
    )
    logger.info(`[ModelService] Dropped column ${safeCol} from ${fullTableName}`)
  } catch (err: unknown) {
    logger.error(`[ModelService] Failed to drop column for field ${fieldId}:`, err)
    // Don't throw — field record is already deleted
  }

  return field
}
