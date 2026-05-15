import { Router } from 'express'
import { auth, optionalAuth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { validate } from '../../../middleware/validate.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  createArticleSchema,
  updateArticleSchema,
} from '../../../validations/article.validation.js'
import * as controller from '../../../controllers/articleController.js'

export const articleRoutes = Router()

// Public
articleRoutes.get('/', optionalAuth, asyncHandler(controller.list))
articleRoutes.get('/:id', optionalAuth, asyncHandler(controller.detail))

// Admin
articleRoutes.post(
  '/',
  auth,
  requirePermission('cms:article'),
  validate(createArticleSchema),
  asyncHandler(controller.create),
)
articleRoutes.put(
  '/:id',
  auth,
  requirePermission('cms:article'),
  validate(updateArticleSchema),
  asyncHandler(controller.update),
)
articleRoutes.delete(
  '/:id',
  auth,
  requirePermission('cms:article'),
  asyncHandler(controller.remove),
)
articleRoutes.patch(
  '/:id/status',
  auth,
  requirePermission('cms:article'),
  asyncHandler(controller.toggleStatus),
)
