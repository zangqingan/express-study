import { Router } from 'express'
import { auth } from '../../../middleware/auth.js'
import { requirePermission } from '../../../middleware/rbac.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import {
  list,
  getById,
  create,
  update,
  remove,
  listFields,
  createField,
  updateField,
  deleteField,
} from '../../../controllers/modelController.js'

export const modelRoutes = Router()

// Apply auth + admin permission to all model routes
modelRoutes.use(auth)
modelRoutes.use(requirePermission('ext:model'))

// Model CRUD
modelRoutes.get('/', asyncHandler(list))
modelRoutes.get('/:id', asyncHandler(getById))
modelRoutes.post('/', asyncHandler(create))
modelRoutes.put('/:id', asyncHandler(update))
modelRoutes.delete('/:id', asyncHandler(remove))

// Field CRUD (nested under model)
modelRoutes.get('/:mid/fields', asyncHandler(listFields))
modelRoutes.post('/:mid/fields', asyncHandler(createField))
modelRoutes.put('/:mid/fields/:id', asyncHandler(updateField))
modelRoutes.delete('/:mid/fields/:id', asyncHandler(deleteField))
