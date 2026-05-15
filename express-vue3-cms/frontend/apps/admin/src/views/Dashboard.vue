<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NGrid,
  NGi,
  NStatistic,
  useMessage,
} from 'naive-ui'
import api from '@/api'

interface Stats {
  totalArticles: number
  todayArticles: number
  totalMembers: number
  totalOrders: number
  pendingMessages: number
  recentOrders: any[]
}

const stats = ref<Stats>({
  totalArticles: 0,
  todayArticles: 0,
  totalMembers: 0,
  totalOrders: 0,
  pendingMessages: 0,
  recentOrders: [],
})

async function fetchStats() {
  try {
    // Fetch summary stats from various endpoints
    const [articlesRes, usersRes, ordersRes, messagesRes] = await Promise.all([
      api.get('/articles', { params: { pageSize: 1 } }),
      api.get('/users', { params: { pageSize: 1 } }),
      api.get('/orders', { params: { pageSize: 1 } }),
      api.get('/messages', { params: { pageSize: 1 } }),
    ]) as any[]

    stats.value.totalArticles = articlesRes.data?.pagination?.total || 0
    stats.value.totalMembers = usersRes.data?.pagination?.total || 0
    stats.value.totalOrders = ordersRes.data?.pagination?.total || 0
    stats.value.pendingMessages = messagesRes.data?.pagination?.total || 0
  } catch {
    // Stats fetch failure is non-critical
  }
}

onMounted(() => fetchStats())
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">仪表盘</h1>

    <n-grid :cols="5" :x-gap="16" :y-gap="16" responsive="screen">
      <n-gi>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <n-statistic label="总文章数" :value="stats.totalArticles" />
        </div>
      </n-gi>
      <n-gi>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <n-statistic label="会员总数" :value="stats.totalMembers" />
        </div>
      </n-gi>
      <n-gi>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <n-statistic label="总订单数" :value="stats.totalOrders" />
        </div>
      </n-gi>
      <n-gi>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <n-statistic label="待处理留言" :value="stats.pendingMessages" />
        </div>
      </n-gi>
      <n-gi>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <n-statistic label="今日新增文章" :value="stats.todayArticles" />
        </div>
      </n-gi>
    </n-grid>

    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h3 class="mb-4 text-base font-semibold text-white">快速入口</h3>
        <div class="grid grid-cols-2 gap-3">
          <router-link
            to="/articles"
            class="rounded-lg border border-white/10 p-4 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-blue-400"
          >
            发布文章 →
          </router-link>
          <router-link
            to="/users"
            class="rounded-lg border border-white/10 p-4 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-blue-400"
          >
            会员管理 →
          </router-link>
          <router-link
            to="/orders"
            class="rounded-lg border border-white/10 p-4 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-blue-400"
          >
            查看订单 →
          </router-link>
          <router-link
            to="/collects"
            class="rounded-lg border border-white/10 p-4 text-sm text-gray-300 transition hover:border-blue-400/50 hover:text-blue-400"
          >
            内容采集 →
          </router-link>
        </div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h3 class="mb-4 text-base font-semibold text-white">系统信息</h3>
        <div class="space-y-2 text-sm text-gray-400">
          <p>前端框架：Vue 3 + Vite + Naive UI</p>
          <p>后端框架：Express 5 + TypeScript</p>
          <p>数据库：MySQL 8.0 + Prisma ORM</p>
          <p>缓存系统：Redis</p>
          <p>文件存储：七牛云 OSS</p>
        </div>
      </div>
    </div>
  </div>
</template>
