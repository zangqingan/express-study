import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/sysUserController.js'

export const sysUserRoutes = Router()

sysUserRoutes.get('/', auth, requirePermission('sys:user'), asyncHandler(controller.list))
sysUserRoutes.get('/:id', auth, requirePermission('sys:user'), asyncHandler(controller.getById))
sysUserRoutes.post('/', auth, requirePermission('sys:user'), asyncHandler(controller.create))
sysUserRoutes.put('/:id', auth, requirePermission('sys:user'), asyncHandler(controller.update))
sysUserRoutes.delete('/:id', auth, requirePermission('sys:user'), asyncHandler(controller.remove))
sysUserRoutes.post('/:id/roles', auth, requirePermission('sys:user'), asyncHandler(controller.assignRoles))
