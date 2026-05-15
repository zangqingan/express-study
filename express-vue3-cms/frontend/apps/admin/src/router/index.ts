import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '仪表盘', icon: 'dashboard' },
        },
        // Content management
        {
          path: 'articles',
          name: 'Articles',
          component: () => import('@/views/content/Articles.vue'),
          meta: { title: '文章管理', icon: 'article' },
        },
        {
          path: 'articles/:id',
          name: 'ArticleEdit',
          component: () => import('@/views/content/ArticleEdit.vue'),
          meta: { title: '文章编辑', hidden: true },
        },
        {
          path: 'categories',
          name: 'Categories',
          component: () => import('@/views/content/Categories.vue'),
          meta: { title: '栏目管理', icon: 'category' },
        },
        {
          path: 'tags',
          name: 'Tags',
          component: () => import('@/views/content/Tags.vue'),
          meta: { title: '标签管理', icon: 'tag' },
        },
        {
          path: 'slides',
          name: 'Slides',
          component: () => import('@/views/content/Slides.vue'),
          meta: { title: '轮播管理', icon: 'slideshow' },
        },
        {
          path: 'frags',
          name: 'Frags',
          component: () => import('@/views/content/Frags.vue'),
          meta: { title: '碎片管理', icon: 'widget' },
        },
        {
          path: 'friend-links',
          name: 'FriendLinks',
          component: () => import('@/views/content/FriendLinks.vue'),
          meta: { title: '友链管理', icon: 'link' },
        },
        {
          path: 'messages',
          name: 'Messages',
          component: () => import('@/views/content/Messages.vue'),
          meta: { title: '留言管理', icon: 'message' },
        },
        // Extension
        {
          path: 'models',
          name: 'Models',
          component: () => import('@/views/extension/Models.vue'),
          meta: { title: '模型管理', icon: 'extension' },
        },
        {
          path: 'collects',
          name: 'Collects',
          component: () => import('@/views/extension/Collects.vue'),
          meta: { title: '采集管理', icon: 'spider' },
        },
        // Members
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/member/Users.vue'),
          meta: { title: '会员列表', icon: 'people' },
        },
        {
          path: 'levels',
          name: 'Levels',
          component: () => import('@/views/member/Levels.vue'),
          meta: { title: '等级管理', icon: 'level' },
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('@/views/member/Products.vue'),
          meta: { title: '产品管理', icon: 'product' },
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/member/Orders.vue'),
          meta: { title: '订单管理', icon: 'order' },
        },
        // System
        {
          path: 'sys-users',
          name: 'SysUsers',
          component: () => import('@/views/system/SysUsers.vue'),
          meta: { title: '后台用户', icon: 'admin' },
        },
        {
          path: 'roles',
          name: 'Roles',
          component: () => import('@/views/system/Roles.vue'),
          meta: { title: '角色管理', icon: 'role' },
        },
        {
          path: 'menus',
          name: 'Menus',
          component: () => import('@/views/system/Menus.vue'),
          meta: { title: '菜单管理', icon: 'menu' },
        },
        {
          path: 'notices',
          name: 'Notices',
          component: () => import('@/views/system/Notices.vue'),
          meta: { title: '通知公告', icon: 'notice' },
        },
        {
          path: 'login-logs',
          name: 'LoginLogs',
          component: () => import('@/views/system/LoginLogs.vue'),
          meta: { title: '登录日志', icon: 'log' },
        },
        {
          path: 'site',
          name: 'Site',
          component: () => import('@/views/Site.vue'),
          meta: { title: '站点设置', icon: 'settings' },
        },
      ],
    },
  ],
})

// Auth guard
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
