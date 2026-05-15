import { Router } from 'express'
import { articleRoutes } from './api/v1/article.js'
import { categoryRoutes } from './api/v1/category.js'
import { tagRoutes } from './api/v1/tag.js'
import { slideRoutes } from './api/v1/slide.js'
import { fragRoutes } from './api/v1/frag.js'
import { friendLinkRoutes } from './api/v1/friendLink.js'
import { messageRoutes } from './api/v1/message.js'
import { authRoutes } from './api/v1/auth.js'
import { modelRoutes } from './api/v1/model.js'
import { collectRoutes } from './api/v1/collect.js'
import { userRoutes } from './api/v1/user.js'
import { levelRoutes } from './api/v1/level.js'
import { productRoutes } from './api/v1/product.js'
import { orderRoutes } from './api/v1/order.js'
import { readingRecordRoutes } from './api/v1/readingRecord.js'
import { sysUserRoutes } from './api/v1/sysUser.js'
import { roleRoutes } from './api/v1/role.js'
import { menuRoutes } from './api/v1/menu.js'
import { loginLogRoutes } from './api/v1/loginLog.js'
import { noticeRoutes } from './api/v1/notice.js'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/articles', articleRoutes)
routes.use('/categories', categoryRoutes)
routes.use('/tags', tagRoutes)
routes.use('/slides', slideRoutes)
routes.use('/frags', fragRoutes)
routes.use('/friend-links', friendLinkRoutes)
routes.use('/messages', messageRoutes)
routes.use('/models', modelRoutes)
routes.use('/collects', collectRoutes)
routes.use('/users', userRoutes)
routes.use('/levels', levelRoutes)
routes.use('/products', productRoutes)
routes.use('/orders', orderRoutes)
routes.use('/reading-records', readingRecordRoutes)
routes.use('/sys-users', sysUserRoutes)
routes.use('/roles', roleRoutes)
routes.use('/menus', menuRoutes)
routes.use('/login-logs', loginLogRoutes)
routes.use('/notices', noticeRoutes)
