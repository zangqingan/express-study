import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database.js'
import { error } from '../utils/response.js'
import { logger } from '../config/logger.js'

/** RBAC middleware — checks user has the required permission via sys_role_menu */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return error(res, '请先登录', 401)
    }

    // Super admin (id=1 or specific flag) bypasses permission checks
    if (req.user.id === 1) {
      return next()
    }

    try {
      // Query user's roles → menu permissions
      const userRoles = await prisma.sys_user_role.findMany({
        where: { user_id: req.user.id },
        select: { role_id: true },
      })

      if (userRoles.length === 0) {
        logger.warn(`[RBAC] User ${req.user.username} has no role assigned`)
        return error(res, '无权限访问', 403)
      }

      const roleIds = userRoles.map((r) => r.role_id)

      const menuCount = await prisma.sys_role_menu.count({
        where: {
          role_id: { in: roleIds },
          sys_menu: { permissions: permission },
        },
      })

      if (menuCount === 0) {
        logger.warn(`[RBAC] User ${req.user.username} lacks permission: ${permission}`)
        return error(res, '无权限访问', 403)
      }

      next()
    } catch (err) {
      logger.error('[RBAC] Error checking permissions:', err)
      return error(res, '权限校验失败', 500)
    }
  }
}
