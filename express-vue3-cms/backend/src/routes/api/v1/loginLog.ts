import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/loginLogController.js'

export const loginLogRoutes = Router()

loginLogRoutes.get('/', auth, requirePermission('sys:loginLog'), asyncHandler(controller.list))
loginLogRoutes.delete('/:id', auth, requirePermission('sys:loginLog'), asyncHandler(controller.remove))
