import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/friendLinkController.js'

export const friendLinkRoutes = Router()

// Public
friendLinkRoutes.get('/', asyncHandler(controller.list))

// Admin
friendLinkRoutes.post('/', auth, requirePermission('cms:friendlink'), asyncHandler(controller.create))
friendLinkRoutes.put('/:id', auth, requirePermission('cms:friendlink'), asyncHandler(controller.update))
friendLinkRoutes.delete('/:id', auth, requirePermission('cms:friendlink'), asyncHandler(controller.remove))
