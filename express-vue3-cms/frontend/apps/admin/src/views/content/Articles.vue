<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NTable,
  NButton,
  NSpace,
  NTag,
  NInput,
  NSelect,
  useMessage,
  useDialog,
  NPagination,
  NSpin,
} from 'naive-ui'
import dayjs from 'dayjs'
import api from '@/api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Article {
  id: number
  cid: number
  sub_cid: string | null
  title: string
  short_title: string | null
  tag_id: string | null
  attr: number | null
  article_view: string | null
  source: string | null
  author: string | null
  description: string | null
  img: string | null
  content: string
  status: number
  pv: number
  link: string | null
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
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
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
  page: 1,
  pageSize: 15,
  total: 0,
  totalPages: 0,
})

const filters = reactive({
  keyword: '',
  cid: null as number | null,
  status: null as number | null,
  attr: null as number | null,
})

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------
const categoryMap = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  for (const cat of categories.value) {
    map[cat.id] = cat.name
  }
  return map
})

const statusOptions = [
  { label: '全部状态', value: null },
  { label: '已发布', value: 0 },
  { label: '草稿', value: 1 },
]

const attrOptions = [
  { label: '全部属性', value: null },
  { label: '头条', value: 1 },
  { label: '推荐', value: 2 },
  { label: '轮播', value: 4 },
  { label: '热门', value: 8 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getAttrBadges(attr: number | null): { label: string; type: string }[] {
  if (!attr) return []
  const badges: { label: string; type: string }[] = []
  if (attr & 1) badges.push({ label: '头条', type: 'error' })
  if (attr & 2) badges.push({ label: '推荐', type: 'warning' })
  if (attr & 4) badges.push({ label: '轮播', type: 'info' })
  if (attr & 8) badges.push({ label: '热门', type: 'success' })
  return badges
}

function formatTime(dateStr: string): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm') : '-'
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchArticles() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.cid !== null) params.cid = filters.cid
    if (filters.status !== null) params.status = filters.status
    if (filters.attr !== null) params.attr = filters.attr

    const res = (await api.get('/articles', { params })) as any
    if (res.code === 0) {
      articles.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
      pagination.totalPages = res.data.pagination?.totalPages || 0
    }
  } catch {
    // Error already handled by interceptor
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = (await api.get('/categories')) as any
    if (res.code === 0) {
      categories.value = res.data.list || res.data || []
    }
  } catch {
    // Non-critical
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
function handleSearch() {
  pagination.page = 1
  fetchArticles()
}

function handleReset() {
  filters.keyword = ''
  filters.cid = null
  filters.status = null
  filters.attr = null
  pagination.page = 1
  fetchArticles()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchArticles()
}

function handleEdit(id: number) {
  router.push(`/articles/${id}`)
}

function handleCreate() {
  router.push('/articles/new')
}

async function handleDelete(article: Article) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除文章「${article.title}」吗？此操作不可撤销。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/articles/${article.id}`)
        message.success('删除成功')
        fetchArticles()
      } catch {
        // Handled by interceptor
      } finally {
        d.loading = false
      }
    },
  })
}

async function handleToggleStatus(article: Article) {
  const newStatus = article.status === 0 ? 1 : 0
  const actionLabel = newStatus === 0 ? '发布' : '设为草稿'
  try {
    const res = (await api.patch(`/articles/${article.id}/status`, { status: newStatus })) as any
    if (res.code === 0) {
      message.success(`${actionLabel}成功`)
      article.status = newStatus
    }
  } catch {
    // Handled by interceptor
  }
}

// ---------------------------------------------------------------------------
// Table columns (flat keys only; rendering via template slots below)
// ---------------------------------------------------------------------------
const columns = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '栏目', key: 'cid', width: 120 },
  { title: '属性', key: 'attr', width: 180 },
  { title: '状态', key: 'status', width: 90 },
  { title: 'PV', key: 'pv', width: 80 },
  { title: '创建时间', key: 'created_at', width: 160 },
  { title: '操作', key: 'actions', width: 260 },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchCategories()
  fetchArticles()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">文章管理</h1>
      <NSpace>
        <NButton type="primary" @click="handleCreate">写文章</NButton>
        <NButton @click="fetchArticles">刷新</NButton>
      </NSpace>
    </div>

    <!-- Search bar -->
    <div class="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpace align="center" wrap>
        <NInput
          v-model:value="filters.keyword"
          placeholder="搜索标题..."
          clearable
          style="width: 200px"
          @keydown.enter="handleSearch"
        />
        <NSelect
          v-model:value="filters.cid"
          :options="[{ label: '全部栏目', value: null }, ...categories.map(c => ({ label: c.name, value: c.id }))]"
          placeholder="栏目筛选"
          clearable
          style="width: 140px"
        />
        <NSelect
          v-model:value="filters.status"
          :options="statusOptions"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
        />
        <NSelect
          v-model:value="filters.attr"
          :options="attrOptions"
          placeholder="属性筛选"
          clearable
          style="width: 120px"
        />
        <NButton type="primary" @click="handleSearch">搜索</NButton>
        <NButton @click="handleReset">重置</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="articles"
          size="small"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        >
          <!-- ID -->
          <template #body-cell-id="{ row }">
            <span class="text-xs text-gray-400">{{ row.id }}</span>
          </template>

          <!-- Title -->
          <template #body-cell-title="{ row }">
            <span class="text-sm text-gray-200">{{ row.title }}</span>
          </template>

          <!-- Category -->
          <template #body-cell-cid="{ row }">
            <span class="text-xs text-gray-400">{{ categoryMap[row.cid] || `ID:${row.cid}` }}</span>
          </template>

          <!-- Attr badges -->
          <template #body-cell-attr="{ row }">
            <NSpace v-if="getAttrBadges(row.attr).length" :size="4">
              <NTag
                v-for="b in getAttrBadges(row.attr)"
                :key="b.label"
                size="small"
                :type="b.type as any"
                :bordered="false"
              >
                {{ b.label }}
              </NTag>
            </NSpace>
            <span v-else class="text-xs text-gray-500">-</span>
          </template>

          <!-- Status -->
          <template #body-cell-status="{ row }">
            <NTag
              size="small"
              :type="row.status === 0 ? 'success' : 'default'"
              :bordered="false"
            >
              {{ row.status === 0 ? '已发布' : '草稿' }}
            </NTag>
          </template>

          <!-- PV -->
          <template #body-cell-pv="{ row }">
            <span class="text-xs text-gray-400">{{ row.pv ?? 0 }}</span>
          </template>

          <!-- Created at -->
          <template #body-cell-created_at="{ row }">
            <span class="text-xs text-gray-400">{{ formatTime(row.created_at) }}</span>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="{ row }">
            <NSpace>
              <NButton size="small" @click="handleEdit(row.id)">编辑</NButton>
              <NButton
                size="small"
                :type="row.status === 0 ? 'warning' : 'primary'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 0 ? '下架' : '发布' }}
              </NButton>
              <NPopconfirm @positive-click="handleDelete(row)">
                <template #trigger>
                  <NButton size="small" type="error">删除</NButton>
                </template>
                确定删除「{{ row.title }}」吗？
              </NPopconfirm>
            </NSpace>
          </template>
        </NTable>
      </NSpin>

      <!-- Empty state -->
      <div v-if="!loading && articles.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">-</span>
        <p class="mt-3 text-sm">暂无文章数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="handleCreate">写文章</NButton>
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
  </div>
</template>
