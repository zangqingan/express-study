import Joi from 'joi'

export const loginSchema = Joi.object({
  username: Joi.string().min(2).max(30).required().messages({
    'string.empty': '用户名不能为空',
    'string.min': '用户名长度不能小于2',
    'string.max': '用户名长度不能超过30',
    'any.required': '用户名是必填项',
  }),
  password: Joi.string().min(6).max(80).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能小于6',
    'string.max': '密码长度不能超过80',
    'any.required': '密码是必填项',
  }),
})

export const registerSchema = Joi.object({
  username: Joi.string().min(2).max(30).required().messages({
    'string.empty': '用户名不能为空',
    'string.min': '用户名长度不能小于2',
    'string.max': '用户名长度不能超过30',
    'any.required': '用户名是必填项',
  }),
  password: Joi.string().min(6).max(80).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能小于6',
    'string.max': '密码长度不能超过80',
    'any.required': '密码是必填项',
  }),
  nickname: Joi.string().max(30).optional().allow('').default(''),
  email: Joi.string().email().max(50).optional().allow('').default(''),
  phone_number: Joi.string().max(11).optional().allow('').default(''),
  avatar: Joi.string().max(100).optional().allow('').default(''),
  gender: Joi.number().integer().min(0).max(2).optional().default(0),
})
