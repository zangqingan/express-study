<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  useMessage,
  useDialog,
  NSpin,
  NPopconfirm,
} from 'naive-ui'
import dayjs from 'dayjs'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FriendLink {
  id: number
  title: string | null
  link: string | null
  order_by: number
  created_at: string
  updated_at: string
}

interface FriendLinkForm {
  title: string
  link: string
  order_by: number
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const links = ref<FriendLink[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: FriendLinkForm = {
  title: '',
  link: '',
  order_by: 0,
}
const form = reactive<FriendLinkForm>({ ...defaultForm })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(dateStr: string): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm') : '-'
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchLinks() {
  loading.value = true
  try {
    const res = (await api.get('/friend-links')) as any
    if (res.code === 0) {
      links.value = res.data || []
    }
  } catch {
    // Handled by interceptor
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Modal actions
// ---------------------------------------------------------------------------
function openCreateModal() {
  Object.assign(form, { ...defaultForm })
  isEdit.value = false
  editingId.value = null
  modalVisible.value = true
}

function openEditModal(link: FriendLink) {
  form.title = link.title || ''
  form.link = link.link || ''
  form.order_by = link.order_by ?? 0
  isEdit.value = true
  editingId.value = link.id
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
async function handleSave() {
  if (!form.title.trim()) {
    message.warning('请输入链接名称')
    return
  }
  if (!form.link.trim()) {
    message.warning('请输入链接地址')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: form.title,
      link: form.link,
      order_by: form.order_by,
    }

    if (isEdit.value && editingId.value) {
      await api.put(`/friend-links/${editingId.value}`, payload)
      message.success('友链更新成功')
    } else {
      await api.post('/friend-links', payload)
      message.success('友链创建成功')
    }

    closeModal()
    fetchLinks()
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(link: FriendLink) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除友链「${link.title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/friend-links/${link.id}`)
        message.success('删除成功')
        fetchLinks()
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
  { title: 'ID', key: 'id', width: 70 },
  { title: '链接名称', key: 'title', ellipsis: { tooltip: true } },
  { title: '链接地址', key: 'link', ellipsis: { tooltip: true } },
  { title: '排序', key: 'order_by', width: 80 },
  { title: '创建时间', key: 'created_at', width: 160 },
  { title: '操作', key: 'actions', width: 180 },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchLinks()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">友链管理</h1>
      <NSpace>
        <NButton type="primary" @click="openCreateModal">添加友链</NButton>
        <NButton @click="fetchLinks">刷新</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="links"
          size="small"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        >
          <template #body-cell-id="{ row }">
            <span class="text-xs text-gray-400">{{ row.id }}</span>
          </template>

          <template #body-cell-title="{ row }">
            <span class="text-sm text-gray-200">{{ row.title || '-' }}</span>
          </template>

          <template #body-cell-link="{ row }">
            <a
              v-if="row.link"
              :href="row.link"
              target="_blank"
              class="text-xs text-blue-400 hover:underline"
            >
              {{ row.link }}
            </a>
            <span v-else class="text-xs text-gray-500">-</span>
          </template>

          <template #body-cell-order_by="{ row }">
            <span class="text-xs text-gray-400">{{ row.order_by ?? 0 }}</span>
          </template>

          <template #body-cell-created_at="{ row }">
            <span class="text-xs text-gray-400">{{ formatTime(row.created_at) }}</span>
          </template>

          <template #body-cell-actions="{ row }">
            <NSpace>
              <NButton size="small" @click="openEditModal(row)">编辑</NButton>
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

      <div v-if="!loading && links.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">-</span>
        <p class="mt-3 text-sm">暂无友链数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="openCreateModal">添加友链</NButton>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑友链' : '添加友链'"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="链接名称" required>
          <NInput v-model:value="form.title" placeholder="网站名称" />
        </NFormItem>
        <NFormItem label="链接地址" required>
          <NInput v-model:value="form.link" placeholder="https://..." />
        </NFormItem>
        <NFormItem label="排序">
          <NInputNumber v-model:value="form.order_by" :min="0" style="width: 120px" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? '保存修改' : '创建' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
