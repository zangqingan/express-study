import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { validate } from '../../../middleware/validate.js'
import { apiLimiter } from '../../../middleware/rateLimiter.js'
import {
  createMessageSchema,
  updateMessageStatusSchema,
} from '../../../validations/message.validation.js'
import * as controller from '../../../controllers/messageController.js'

export const messageRoutes = Router()

// ── Public ───────────────────────────────────────────────────────────────────

// Submit a message — rate-limited, no auth
messageRoutes.post(
  '/',
  apiLimiter,
  validate(createMessageSchema),
  asyncHandler(controller.create),
)

// Public list — only approved messages
messageRoutes.get('/', asyncHandler(controller.list))

// ── Admin ────────────────────────────────────────────────────────────────────

// List all messages with pagination
messageRoutes.get(
  '/all',
  auth,
  requirePermission('cms:message'),
  asyncHandler(controller.listAll),
)

// Update message status (approve/reject)
messageRoutes.put(
  '/:id',
  auth,
  requirePermission('cms:message'),
  validate(updateMessageStatusSchema),
  asyncHandler(controller.updateStatus),
)

// Delete a message
messageRoutes.delete(
  '/:id',
  auth,
  requirePermission('cms:message'),
  asyncHandler(controller.remove),
)
