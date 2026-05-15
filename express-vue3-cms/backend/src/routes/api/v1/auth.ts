import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { validate } from '../../../middleware/validate.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { loginSchema, registerSchema } from '../../../validations/auth.validation.js'
import * as controller from '../../../controllers/authController.js'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), asyncHandler(controller.login))
authRoutes.post('/logout', asyncHandler(controller.logout))
authRoutes.get('/me', auth, asyncHandler(controller.me))
authRoutes.post('/register', auth, validate(registerSchema), asyncHandler(controller.register))
