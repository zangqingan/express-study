import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/noticeController.js'

export const noticeRoutes = Router()

// Public: list active notices (no auth needed)
noticeRoutes.get('/public', asyncHandler(controller.listActive))

// Admin routes
noticeRoutes.get('/', auth, requirePermission('sys:notice'), asyncHandler(controller.list))
noticeRoutes.get('/:id', auth, requirePermission('sys:notice'), asyncHandler(controller.getById))
noticeRoutes.post('/', auth, requirePermission('sys:notice'), asyncHandler(controller.create))
noticeRoutes.put('/:id', auth, requirePermission('sys:notice'), asyncHandler(controller.update))
noticeRoutes.delete('/:id', auth, requirePermission('sys:notice'), asyncHandler(controller.remove))
