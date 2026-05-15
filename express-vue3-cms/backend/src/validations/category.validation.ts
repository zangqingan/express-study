import Joi from 'joi'

export const createCategorySchema = Joi.object({
  parent_id: Joi.number().integer().optional().default(0),
  name: Joi.string().required().max(50),
  pinyin: Joi.string().required().max(255),
  path: Joi.string().required().max(255),
  description: Joi.string().allow('', null).max(255).optional().default(''),
  type: Joi.number().integer().valid(0, 1).optional().default(0),
  url: Joi.string().allow('', null).max(255).optional(),
  order_by: Joi.number().integer().optional().default(0),
  target: Joi.number().integer().valid(0, 1).optional().default(0),
  status: Joi.number().integer().valid(0, 1).optional().default(0),
  mid: Joi.number().integer().allow(null).optional(),
  list_view: Joi.string().allow('', null).max(100).optional().default('list.html'),
  article_view: Joi.string().allow('', null).max(100).optional().default('article.html'),
  seo_title: Joi.string().allow('', null).max(255).optional(),
  seo_keywords: Joi.string().allow('', null).max(255).optional(),
  seo_description: Joi.string().allow('', null).max(255).optional(),
})

export const updateCategorySchema = Joi.object({
  parent_id: Joi.number().integer().optional(),
  name: Joi.string().max(50).optional(),
  pinyin: Joi.string().max(255).optional(),
  path: Joi.string().max(255).optional(),
  description: Joi.string().allow('', null).max(255).optional(),
  type: Joi.number().integer().valid(0, 1).optional(),
  url: Joi.string().allow('', null).max(255).optional(),
  order_by: Joi.number().integer().optional(),
  target: Joi.number().integer().valid(0, 1).optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
  mid: Joi.number().integer().allow(null).optional(),
  list_view: Joi.string().allow('', null).max(100).optional(),
  article_view: Joi.string().allow('', null).max(100).optional(),
  seo_title: Joi.string().allow('', null).max(255).optional(),
  seo_keywords: Joi.string().allow('', null).max(255).optional(),
  seo_description: Joi.string().allow('', null).max(255).optional(),
}).min(1)

export const sortCategorySchema = Joi.object({
  order_by: Joi.number().integer().required(),
})
