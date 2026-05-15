<script setup lang="ts">
import { ref, computed, h, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NSpace,
  NDropdown,
  NAvatar,
  useMessage,
  type MenuOption,
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

const collapsed = ref(false)

const menuOptions: MenuOption[] = [
  {
    label: '仪表盘',
    key: '/dashboard',
    icon: () => h('i', { class: 'i-mdi-view-dashboard' }),
  },
  {
    label: '内容管理',
    key: 'content',
    icon: () => h('i', { class: 'i-mdi-file-document' }),
    children: [
      { label: '文章管理', key: '/articles' },
      { label: '栏目管理', key: '/categories' },
      { label: '标签管理', key: '/tags' },
      { label: '轮播管理', key: '/slides' },
      { label: '碎片管理', key: '/frags' },
      { label: '友链管理', key: '/friend-links' },
      { label: '留言管理', key: '/messages' },
    ],
  },
  {
    label: '扩展模块',
    key: 'extension',
    icon: () => h('i', { class: 'i-mdi-puzzle' }),
    children: [
      { label: '模型管理', key: '/models' },
      { label: '采集管理', key: '/collects' },
    ],
  },
  {
    label: '会员管理',
    key: 'member',
    icon: () => h('i', { class: 'i-mdi-account-group' }),
    children: [
      { label: '会员列表', key: '/users' },
      { label: '等级管理', key: '/levels' },
      { label: '产品管理', key: '/products' },
      { label: '订单管理', key: '/orders' },
    ],
  },
  {
    label: '系统管理',
    key: 'system',
    icon: () => h('i', { class: 'i-mdi-cog' }),
    children: [
      { label: '后台用户', key: '/sys-users' },
      { label: '角色管理', key: '/roles' },
      { label: '菜单管理', key: '/menus' },
      { label: '通知公告', key: '/notices' },
      { label: '登录日志', key: '/login-logs' },
    ],
  },
  {
    label: '站点设置',
    key: '/site',
    icon: () => h('i', { class: 'i-mdi-cog-outline' }),
  },
]

function handleMenuChange(key: string) {
  router.push(key)
}

const userOptions = [
  {
    label: '修改密码',
    key: 'password',
  },
  {
    type: 'divider' as const,
    key: 'd1',
  },
  {
    label: '退出登录',
    key: 'logout',
  },
]

function handleUserSelect(key: string) {
  if (key === 'logout') {
    authStore.logout()
    message.success('已退出登录')
    router.push('/login')
  }
}
</script>

<template>
  <n-layout class="min-h-screen">
    <!-- Sidebar -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      class="border-r border-white/10"
    >
      <div class="flex h-14 items-center justify-center border-b border-white/10">
        <span
          v-if="!collapsed"
          class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent"
        >
          CMS Admin
        </span>
        <span v-else class="text-lg font-bold text-blue-400">C</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="route.path"
        @update:value="handleMenuChange"
      />
    </n-layout-sider>

    <!-- Main -->
    <n-layout>
      <!-- Header -->
      <n-layout-header bordered class="flex items-center justify-between px-4 border-b border-white/10 h-14">
        <n-button text @click="collapsed = !collapsed">
          <span class="text-lg">{{ collapsed ? '☰' : '☰' }}</span>
        </n-button>

        <n-dropdown :options="userOptions" @select="handleUserSelect">
          <n-space align="center" class="cursor-pointer">
            <n-avatar size="small">
              {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'A' }}
            </n-avatar>
            <span class="text-sm">{{ authStore.user?.username || 'Admin' }}</span>
          </n-space>
        </n-dropdown>
      </n-layout-header>

      <!-- Content -->
      <n-layout-content class="p-6">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
