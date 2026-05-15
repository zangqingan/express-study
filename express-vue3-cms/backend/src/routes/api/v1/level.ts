import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/levelController.js'

export const levelRoutes = Router()

// Public
levelRoutes.get('/', asyncHandler(controller.list))
levelRoutes.get('/:id', asyncHandler(controller.getById))

// Admin
levelRoutes.post('/', auth, requirePermission('member:level:create'), asyncHandler(controller.create))
levelRoutes.put('/:id', auth, requirePermission('member:level:update'), asyncHandler(controller.update))
levelRoutes.delete('/:id', auth, requirePermission('member:level:delete'), asyncHandler(controller.remove))
