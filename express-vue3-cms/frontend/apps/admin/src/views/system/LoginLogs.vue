<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NModal,
  NInput,
  NDatePicker,
  NSpace,
  NTag,
  NPopconfirm,
  NSpin,
  NEmpty,
  NPagination,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  useDialog,
} from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// --- Types ---
interface LoginLog {
  id: number
  username: string
  ip: string
  location?: string
  user_agent?: string
  created_at: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

// --- State ---
const loading = ref(false)
const logs = ref<LoginLog[]>([])
const pagination = reactive<Pagination>({ page: 1, pageSize: 10, total: 0 })
const showDetailModal = ref(false)
const currentLog = ref<LoginLog | null>(null)

const searchForm = reactive({
  username: '',
  dateRange: null as [number, number] | null,
})

// --- API ---
async function fetchLogs() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (searchForm.username.trim()) {
      params.username = searchForm.username.trim()
    }
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const res = (await api.get('/login-logs', { params })) as any
    if (res.code === 0) {
      logs.value = res.data?.list ?? res.data ?? []
      pagination.total = res.data?.pagination?.total ?? 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

// --- Search ---
function handleSearch() {
  pagination.page = 1
  fetchLogs()
}

function handleReset() {
  searchForm.username = ''
  searchForm.dateRange = null
  pagination.page = 1
  fetchLogs()
}

// --- Detail ---
function openDetailModal(log: LoginLog) {
  currentLog.value = log
  showDetailModal.value = true
}

// --- Delete ---
async function handleDelete(log: LoginLog) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除此登录日志吗？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = (await api.delete(`/login-logs/${log.id}`)) as any
        if (res.code === 0) {
          message.success('删除成功')
          await fetchLogs()
        }
      } catch {
        // handled by interceptor
      }
    },
  })
}

// --- Pagination ---
function onPageChange(page: number) {
  pagination.page = page
  fetchLogs()
}

function onPageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  fetchLogs()
}

// --- Date range ---
function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">登录日志</h1>
    </div>

    <!-- Search Bar -->
    <div class="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpace align="center" :wrap="true" :size="[16, 12]">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">用户名：</span>
          <NInput
            v-model:value="searchForm.username"
            placeholder="输入用户名搜索"
            style="width: 180px"
            clearable
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">日期范围：</span>
          <NDatePicker
            v-model:value="searchForm.dateRange"
            type="daterange"
            style="width: 240px"
            clearable
          />
        </div>
        <NButton type="primary" size="small" @click="handleSearch">
          搜索
        </NButton>
        <NButton size="small" @click="handleReset">
          重置
        </NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpin :show="loading">
        <NTable v-if="logs.length > 0" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-left text-gray-400">ID</th>
              <th class="text-left text-gray-400">用户名</th>
              <th class="text-left text-gray-400">IP 地址</th>
              <th class="text-left text-gray-400">登录地区</th>
              <th class="text-left text-gray-400">登录时间</th>
              <th class="text-left text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="border-t border-white/5">
              <td class="text-gray-300">{{ log.id }}</td>
              <td class="font-medium text-white">{{ log.username }}</td>
              <td class="text-gray-300">
                <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">{{ log.ip }}</code>
              </td>
              <td>
                <NTag size="small" :bordered="false">
                  {{ log.location || '未知' }}
                </NTag>
              </td>
              <td class="text-gray-400">{{ log.created_at }}</td>
              <td>
                <NSpace>
                  <NButton size="tiny" quaternary type="info" @click="openDetailModal(log)">
                    查看
                  </NButton>
                  <NPopconfirm @positive-click="handleDelete(log)">
                    <template #trigger>
                      <NButton size="tiny" quaternary type="error">
                        删除
                      </NButton>
                    </template>
                    确定删除此日志？
                  </NPopconfirm>
                </NSpace>
              </td>
            </tr>
          </tbody>
        </NTable>
        <NEmpty v-else description="暂无数据" />
      </NSpin>

      <div v-if="pagination.total > 0" class="mt-4 flex justify-end">
        <NPagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.total"
          :page-sizes="[5, 10, 20, 50]"
          show-size-picker
          @update:page="onPageChange"
          @update:page-size="onPageSizeChange"
        />
      </div>
    </div>

    <!-- Detail Modal -->
    <NModal
      v-model:show="showDetailModal"
      title="登录日志详情"
      preset="card"
      style="width: 520px"
    >
      <NDescriptions v-if="currentLog" label-placement="left" :column="1" bordered>
        <NDescriptionsItem label="ID">
          {{ currentLog.id }}
        </NDescriptionsItem>
        <NDescriptionsItem label="用户名">
          {{ currentLog.username }}
        </NDescriptionsItem>
        <NDescriptionsItem label="IP 地址">
          <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">{{ currentLog.ip }}</code>
        </NDescriptionsItem>
        <NDescriptionsItem label="登录地区">
          {{ currentLog.location || '未知' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="User Agent">
          <span class="break-all text-xs text-gray-400">{{ currentLog.user_agent || '-' }}</span>
        </NDescriptionsItem>
        <NDescriptionsItem label="登录时间">
          {{ currentLog.created_at }}
        </NDescriptionsItem>
      </NDescriptions>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showDetailModal = false">关闭</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
