import Joi from 'joi'

/** Submit a message (public) */
export const createMessageSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'string.max': '姓名长度不能超过100个字符',
    'any.required': '姓名不能为空',
  }),
  content: Joi.string().max(500).required().messages({
    'string.max': '留言内容不能超过500个字符',
    'any.required': '留言内容不能为空',
  }),
  title: Joi.string().max(255).optional().allow(''),
  phone_number: Joi.string().max(50).optional().allow(''),
  wechat: Joi.string().max(50).optional().allow(''),
  company_name: Joi.string().max(100).optional().allow(''),
})

/** Admin update message status */
export const updateMessageStatusSchema = Joi.object({
  type: Joi.number().valid(0, 1, 2).required().messages({
    'any.only': '消息状态值无效，有效值为 0(待审核)、1(已通过)、2(已拒绝)',
    'any.required': '消息状态不能为空',
  }),
})
