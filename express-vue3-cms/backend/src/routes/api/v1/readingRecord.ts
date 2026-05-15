import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as controller from '../../../controllers/readingRecordController.js'

export const readingRecordRoutes = Router()

// User (auth required)
readingRecordRoutes.get('/my', auth, asyncHandler(controller.myRecords))
readingRecordRoutes.post('/', auth, asyncHandler(controller.create))

// Admin
readingRecordRoutes.get('/', auth, requirePermission('member:reading:list'), asyncHandler(controller.list))
readingRecordRoutes.get('/:id', auth, asyncHandler(controller.getById))
readingRecordRoutes.delete('/:id', auth, requirePermission('member:reading:delete'), asyncHandler(controller.remove))
