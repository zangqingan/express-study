import Joi from 'joi'

export const createTagSchema = Joi.object({
  name: Joi.string().required().max(10),
  path: Joi.string().allow('', null).max(255).optional().default(''),
  ref_count: Joi.number().integer().optional().default(0),
})

export const updateTagSchema = Joi.object({
  name: Joi.string().max(10).optional(),
  path: Joi.string().allow('', null).max(255).optional(),
  ref_count: Joi.number().integer().optional(),
}).min(1)

export const mergeTagSchema = Joi.object({
  sourceId: Joi.number().integer().required(),
  targetId: Joi.number().integer().required(),
})
