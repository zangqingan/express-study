import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/roleController.js'

export const roleRoutes = Router()

roleRoutes.get('/', auth, requirePermission('sys:role'), asyncHandler(controller.list))
roleRoutes.get('/all', auth, requirePermission('sys:role'), asyncHandler(controller.listAll))
roleRoutes.get('/:id', auth, requirePermission('sys:role'), asyncHandler(controller.getById))
roleRoutes.post('/', auth, requirePermission('sys:role'), asyncHandler(controller.create))
roleRoutes.put('/:id', auth, requirePermission('sys:role'), asyncHandler(controller.update))
roleRoutes.delete('/:id', auth, requirePermission('sys:role'), asyncHandler(controller.remove))
roleRoutes.post('/:id/menus', auth, requirePermission('sys:role'), asyncHandler(controller.assignMenus))
