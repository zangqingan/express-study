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
  execute,
  listGather,
  getGatherById,
  createGather,
  updateGather,
  deleteGather,
  executeGather,
} from '../../../controllers/collectController.js'

export const collectRoutes = Router()

// Apply auth + permission to all routes
collectRoutes.use(auth)
collectRoutes.use(requirePermission('ext:collect'))

// -----------------------------------------------------------------------
// Gather (接口采集) routes — MUST be registered before /:id to avoid
// Express interpreting "gather" as a numeric :id parameter
// -----------------------------------------------------------------------
collectRoutes.get('/gather', asyncHandler(listGather))
collectRoutes.get('/gather/:id', asyncHandler(getGatherById))
collectRoutes.post('/gather', asyncHandler(createGather))
collectRoutes.put('/gather/:id', asyncHandler(updateGather))
collectRoutes.delete('/gather/:id', asyncHandler(deleteGather))
collectRoutes.post('/gather/:id/execute', asyncHandler(executeGather))

// -----------------------------------------------------------------------
// Collect (页面采集) routes
// -----------------------------------------------------------------------
collectRoutes.get('/', asyncHandler(list))
collectRoutes.get('/:id', asyncHandler(getById))
collectRoutes.post('/', asyncHandler(create))
collectRoutes.put('/:id', asyncHandler(update))
collectRoutes.delete('/:id', asyncHandler(remove))
collectRoutes.post('/:id/execute', asyncHandler(execute))
