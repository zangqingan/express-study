import Joi from 'joi'

export const createArticleSchema = Joi.object({
  cid: Joi.number().integer().required(),
  sub_cid: Joi.string().allow('', null).max(255).optional(),
  title: Joi.string().required().max(255),
  short_title: Joi.string().allow('', null).max(255).optional(),
  tag_id: Joi.string().allow('', null).max(255).optional(),
  attr: Joi.number().integer().allow(null).optional(),
  article_view: Joi.string().allow('', null).max(100).optional(),
  source: Joi.string().allow('', null).max(255).optional(),
  author: Joi.string().allow('', null).max(255).optional(),
  description: Joi.string().allow('', null).max(255).optional(),
  img: Joi.string().allow('', null).max(255).optional(),
  content: Joi.string().required(),
  status: Joi.number().integer().valid(0, 1).optional().default(0),
  link: Joi.string().allow('', null).max(255).optional(),
  // Extension table fields — passed as a flat object
  ext: Joi.object().optional().default({}),
})

export const updateArticleSchema = Joi.object({
  cid: Joi.number().integer().optional(),
  sub_cid: Joi.string().allow('', null).max(255).optional(),
  title: Joi.string().max(255).optional(),
  short_title: Joi.string().allow('', null).max(255).optional(),
  tag_id: Joi.string().allow('', null).max(255).optional(),
  attr: Joi.number().integer().allow(null).optional(),
  article_view: Joi.string().allow('', null).max(100).optional(),
  source: Joi.string().allow('', null).max(255).optional(),
  author: Joi.string().allow('', null).max(255).optional(),
  description: Joi.string().allow('', null).max(255).optional(),
  img: Joi.string().allow('', null).max(255).optional(),
  content: Joi.string().optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
  link: Joi.string().allow('', null).max(255).optional(),
  ext: Joi.object().optional().default({}),
}).min(1)
