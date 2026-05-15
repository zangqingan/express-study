import { Router } from 'express'
import { auth, optionalAuth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { validate } from '../../../middleware/validate.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  createCategorySchema,
  updateCategorySchema,
  sortCategorySchema,
} from '../../../validations/category.validation.js'
import * as controller from '../../../controllers/categoryController.js'

export const categoryRoutes = Router()

// Public
categoryRoutes.get('/', optionalAuth, asyncHandler(controller.list))
categoryRoutes.get('/tree', optionalAuth, asyncHandler(controller.tree))

// Admin
categoryRoutes.post(
  '/',
  auth,
  requirePermission('cms:category'),
  validate(createCategorySchema),
  asyncHandler(controller.create),
)
categoryRoutes.put(
  '/:id',
  auth,
  requirePermission('cms:category'),
  validate(updateCategorySchema),
  asyncHandler(controller.update),
)
categoryRoutes.delete(
  '/:id',
  auth,
  requirePermission('cms:category'),
  asyncHandler(controller.remove),
)
categoryRoutes.patch(
  '/:id/sort',
  auth,
  requirePermission('cms:category'),
  validate(sortCategorySchema),
  asyncHandler(controller.updateSort),
)
