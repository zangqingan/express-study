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
  email: Joi.string().email().max(50).optional().allow('').default(''),
  phone_number: Joi.string().max(20).optional().allow('').default(''),
  avatar: Joi.string().max(255).optional().allow('').default(''),
  gender: Joi.number().integer().min(0).max(2).optional().default(0),
})

export const updateProfileSchema = Joi.object({
  email: Joi.string().email().max(50).optional().allow(''),
  phone_number: Joi.string().max(20).optional().allow(''),
  avatar: Joi.string().max(255).optional().allow(''),
  gender: Joi.number().integer().min(0).max(2).optional(),
  remark: Joi.string().max(255).optional().allow(''),
}).min(1).messages({
  'object.min': '至少需要更新一个字段',
})

export const changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'string.empty': '原密码不能为空',
    'any.required': '原密码是必填项',
  }),
  new_password: Joi.string().min(6).max(80).required().messages({
    'string.empty': '新密码不能为空',
    'string.min': '新密码长度不能小于6',
    'string.max': '新密码长度不能超过80',
    'any.required': '新密码是必填项',
  }),
})
