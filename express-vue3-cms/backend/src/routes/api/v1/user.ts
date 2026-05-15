import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { validate } from '../../../middleware/validate.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../../../validations/user.validation.js'
import * as controller from '../../../controllers/userController.js'

export const userRoutes = Router()

// Public
userRoutes.post('/login', validate(loginSchema), asyncHandler(controller.login))
userRoutes.post('/register', validate(registerSchema), asyncHandler(controller.register))

// Authenticated (own profile)
userRoutes.get('/me', auth, asyncHandler(controller.me))
userRoutes.put('/profile', auth, validate(updateProfileSchema), asyncHandler(controller.updateProfile))
userRoutes.put('/password', auth, validate(changePasswordSchema), asyncHandler(controller.changePassword))

// Admin
userRoutes.get('/', auth, requirePermission('member:user:list'), asyncHandler(controller.list))
userRoutes.get('/:id', auth, requirePermission('member:user:list'), asyncHandler(controller.getById))
userRoutes.put('/:id', auth, requirePermission('member:user:update'), asyncHandler(controller.update))
userRoutes.delete('/:id', auth, requirePermission('member:user:delete'), asyncHandler(controller.remove))
