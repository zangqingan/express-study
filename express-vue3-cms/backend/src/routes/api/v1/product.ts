import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/productController.js'

export const productRoutes = Router()

// Public
productRoutes.get('/public', asyncHandler(controller.publicList))

// Admin
productRoutes.get('/', auth, requirePermission('member:product:list'), asyncHandler(controller.list))
productRoutes.get('/:id', asyncHandler(controller.getById))
productRoutes.post('/', auth, requirePermission('member:product:create'), asyncHandler(controller.create))
productRoutes.put('/:id', auth, requirePermission('member:product:update'), asyncHandler(controller.update))
productRoutes.delete('/:id', auth, requirePermission('member:product:delete'), asyncHandler(controller.remove))
