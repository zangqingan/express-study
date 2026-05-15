import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/menuController.js'

export const menuRoutes = Router()

menuRoutes.get('/tree', auth, requirePermission('sys:menu'), asyncHandler(controller.tree))
menuRoutes.get('/', auth, requirePermission('sys:menu'), asyncHandler(controller.list))
menuRoutes.get('/:id', auth, requirePermission('sys:menu'), asyncHandler(controller.getById))
menuRoutes.post('/', auth, requirePermission('sys:menu'), asyncHandler(controller.create))
menuRoutes.put('/:id', auth, requirePermission('sys:menu'), asyncHandler(controller.update))
menuRoutes.delete('/:id', auth, requirePermission('sys:menu'), asyncHandler(controller.remove))
