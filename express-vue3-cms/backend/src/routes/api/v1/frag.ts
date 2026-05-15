import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/fragController.js'

export const fragRoutes = Router()

// Public
fragRoutes.get('/', asyncHandler(controller.list))
fragRoutes.get('/:id', asyncHandler(controller.detail))

// Admin
fragRoutes.post('/', auth, requirePermission('cms:frag'), asyncHandler(controller.create))
fragRoutes.put('/:id', auth, requirePermission('cms:frag'), asyncHandler(controller.update))
fragRoutes.delete('/:id', auth, requirePermission('cms:frag'), asyncHandler(controller.remove))
