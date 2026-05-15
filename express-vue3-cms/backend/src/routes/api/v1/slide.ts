import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/slideController.js'

export const slideRoutes = Router()

// Public
slideRoutes.get('/', asyncHandler(controller.list))

// Admin
slideRoutes.post('/', auth, requirePermission('cms:slide'), asyncHandler(controller.create))
slideRoutes.put('/:id', auth, requirePermission('cms:slide'), asyncHandler(controller.update))
slideRoutes.delete('/:id', auth, requirePermission('cms:slide'), asyncHandler(controller.remove))
slideRoutes.patch('/:id/status', auth, requirePermission('cms:slide'), asyncHandler(controller.toggleStatus))
