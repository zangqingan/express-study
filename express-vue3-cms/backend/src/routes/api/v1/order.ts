import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/orderController.js'

export const orderRoutes = Router()

// User (auth required)
orderRoutes.get('/my', auth, asyncHandler(controller.myOrders))
orderRoutes.post('/', auth, asyncHandler(controller.create))

// Admin
orderRoutes.get('/', auth, requirePermission('member:order:list'), asyncHandler(controller.list))
orderRoutes.get('/:id', auth, asyncHandler(controller.getById))
orderRoutes.put('/:id', auth, requirePermission('member:order:update'), asyncHandler(controller.update))
orderRoutes.delete('/:id', auth, requirePermission('member:order:delete'), asyncHandler(controller.remove))
