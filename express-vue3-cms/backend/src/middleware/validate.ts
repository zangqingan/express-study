import type { Request, Response, NextFunction } from 'express'
import type { Schema } from 'joi'
import { error } from '../utils/response.js'

type ValidationTarget = 'body' | 'query' | 'params'

/** Joi validation middleware factory */
export function validate(schema: Schema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error: err, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    })
    if (err) {
      const messages = err.details.map((d) => d.message).join('; ')
      return error(res, messages, 422)
    }
    req[target] = value
    next()
  }
}
