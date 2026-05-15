import { Router } from 'express'
import { auth, optionalAuth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { validate } from '../../../middleware/validate.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  createTagSchema,
  updateTagSchema,
  mergeTagSchema,
} from '../../../validations/tag.validation.js'
import * as controller from '../../../controllers/tagController.js'

export const tagRoutes = Router()

// Public
tagRoutes.get('/', optionalAuth, asyncHandler(controller.list))

// Admin
tagRoutes.post(
  '/',
  auth,
  requirePermission('cms:tag'),
  validate(createTagSchema),
  asyncHandler(controller.create),
)
tagRoutes.put(
  '/:id',
  auth,
  requirePermission('cms:tag'),
  validate(updateTagSchema),
  asyncHandler(controller.update),
)
tagRoutes.delete(
  '/:id',
  auth,
  requirePermission('cms:tag'),
  asyncHandler(controller.remove),
)
tagRoutes.post(
  '/merge',
  auth,
  requirePermission('cms:tag'),
  validate(mergeTagSchema),
  asyncHandler(controller.merge),
)
