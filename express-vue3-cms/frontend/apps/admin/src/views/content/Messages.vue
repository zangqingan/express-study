<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NSpace,
  NTag,
  NModal,
  useMessage,
  useDialog,
  NSpin,
  NPopconfirm,
  NPagination,
} from 'naive-ui'
import dayjs from 'dayjs'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MessageItem {
  id: number
  type: number | null
  title: string | null
  name: string | null
  phone_number: string | null
  wechat: string | null
  company_name: string | null
  content: string | null
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const messages = ref<MessageItem[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
  page: 1,
  pageSize: 15,
  total: 0,
  totalPages: 0,
})

// Detail modal
const detailVisible = ref(false)
const detailMessage = ref<MessageItem | null>(null)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getTypeLabel(type: number | null): string {
  switch (type) {
    case 1:
      return '咨询'
    case 2:
      return '建议'
    case 3:
      return '投诉'
    case 4:
      return '其它'
    default:
      return '未分类'
  }
}

function getTypeTagType(type: number | null): 'info' | 'success' | 'warning' | 'error' | 'default' {
  switch (type) {
    case 1:
      return 'info'
    case 2:
      return 'success'
    case 3:
      return 'error'
    case 4:
      return 'default'
    default:
      return 'default'
  }
}

function truncateContent(content: string | null, maxLen = 60): string {
  if (!content) return '-'
  return content.length > maxLen ? content.slice(0, maxLen) + '...' : content
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchMessages() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    const res = (await api.get('/messages/all', { params })) as any
    if (res.code === 0) {
      messages.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
      pagination.totalPages = res.data.pagination?.totalPages || 0
    }
  } catch {
    // Handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchMessages()
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------
function openDetailModal(msg: MessageItem) {
  detailMessage.value = msg
  detailVisible.value = true
}

function closeDetailModal() {
  detailVisible.value = false
  detailMessage.value = null
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
async function handleDelete(msg: MessageItem) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除「${msg.title || msg.name}」的留言吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/messages/${msg.id}`)
        message.success('删除成功')
        fetchMessages()
      } catch {
        // Handled by interceptor
      } finally {
        d.loading = false
      }
    },
  })
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------
const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 70,
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render(row: MessageItem) {
      return (
        <NTag size="small" type={getTypeTagType(row.type)} bordered={false}>
          {getTypeLabel(row.type)}
        </NTag>
      )
    },
  },
  {
    title: '标题',
    key: 'title',
    width: 180,
    ellipsis: { tooltip: true },
    render(row: MessageItem) {
      return row.title || '-'
    },
  },
  {
    title: '姓名',
    key: 'name',
    width: 100,
    render(row: MessageItem) {
      return row.name || '-'
    },
  },
  {
    title: '电话',
    key: 'phone_number',
    width: 130,
    render(row: MessageItem) {
      return row.phone_number || '-'
    },
  },
  {
    title: '留言内容',
    key: 'content',
    ellipsis: { tooltip: true },
    render(row: MessageItem) {
      return truncateContent(row.content)
    },
  },
  {
    title: '留言时间',
    key: 'created_at',
    width: 160,
    render(row: MessageItem) {
      return row.created_at ? dayjs(row.created_at).format('YYYY-MM-DD HH:mm') : '-'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render(row: MessageItem) {
      return (
        <NSpace>
          <NButton size="small" onClick={() => openDetailModal(row)}>查看</NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row)}>
            {{
              trigger: () => (
                <NButton size="small" type="error">删除</NButton>
              ),
              default: () => `确定删除该留言吗？`,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">留言管理</h1>
      <NButton @click="fetchMessages">刷新</NButton>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="messages"
          :size="'small'"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        />
      </NSpin>

      <div v-if="!loading && messages.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">💬</span>
        <p class="mt-3 text-sm">暂无留言数据</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="mt-4 flex justify-end">
      <NPagination
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :item-count="pagination.total"
        :page-slot="7"
        @update:page="handlePageChange"
      />
    </div>

    <!-- Detail Modal -->
    <NModal
      v-model:show="detailVisible"
      title="留言详情"
      preset="card"
      style="width: 560px"
      :mask-closable="true"
    >
      <template v-if="detailMessage">
        <div class="mb-4 rounded-lg border border-blue-400/20 bg-blue-400/5 p-3 text-xs text-blue-300">
          留言时间：{{
            detailMessage.created_at
              ? dayjs(detailMessage.created_at).format('YYYY-MM-DD HH:mm:ss')
              : '-'
          }}
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">类型</div>
          <NTag size="small" :type="getTypeTagType(detailMessage.type)" bordered={false}>
            {{ getTypeLabel(detailMessage.type) }}
          </NTag>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">标题</div>
          <div class="text-sm text-white">{{ detailMessage.title || '-' }}</div>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">姓名</div>
          <div class="text-sm text-white">{{ detailMessage.name || '-' }}</div>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">电话</div>
          <div class="text-sm text-white">{{ detailMessage.phone_number || '-' }}</div>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">微信</div>
          <div class="text-sm text-white">{{ detailMessage.wechat || '-' }}</div>
        </div>

        <div class="mb-4">
          <div class="mb-2 text-xs font-medium text-gray-400">公司名称</div>
          <div class="text-sm text-white">{{ detailMessage.company_name || '-' }}</div>
        </div>

        <div>
          <div class="mb-2 text-xs font-medium text-gray-400">留言内容</div>
          <div
            class="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-200"
          >
            {{ detailMessage.content || '（无内容）' }}
          </div>
        </div>
      </template>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDetailModal">关闭</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
