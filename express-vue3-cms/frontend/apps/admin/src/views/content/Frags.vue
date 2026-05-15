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
  NSelect,
  NTag,
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
interface Frag {
  id: number
  name: string
  remark: string | null
  content: string | null
  type: number | null
  created_at: string
  updated_at: string
}

interface FragForm {
  name: string
  remark: string
  content: string
  type: number | null
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const frags = ref<Frag[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: FragForm = {
  name: '',
  remark: '',
  content: '',
  type: 1,
}
const form = reactive<FragForm>({ ...defaultForm })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function truncateContent(content: string | null, maxLen = 80): string {
  if (!content) return '-'
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

function getTypeLabel(type: number | null): string {
  if (type === 1) return '富文本'
  if (type === 2) return '文本框'
  return '未知'
}

function getTypeTagType(type: number | null): 'success' | 'default' {
  return type === 1 ? 'success' : 'default'
}

function formatTime(dateStr: string): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm') : '-'
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchFrags() {
  loading.value = true
  try {
    const res = (await api.get('/frags')) as any
    if (res.code === 0) {
      frags.value = res.data || []
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

function openEditModal(frag: Frag) {
  form.name = frag.name || ''
  form.remark = frag.remark || ''
  form.content = frag.content || ''
  form.type = frag.type
  isEdit.value = true
  editingId.value = frag.id
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
async function handleSave() {
  if (!form.name.trim()) {
    message.warning('请输入碎片名称')
    return
  }
  if (!form.remark.trim()) {
    message.warning('请输入碎片标识')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      remark: form.remark,
      content: form.content || undefined,
      type: form.type,
    }

    if (isEdit.value && editingId.value) {
      await api.put(`/frags/${editingId.value}`, payload)
      message.success('碎片更新成功')
    } else {
      await api.post('/frags', payload)
      message.success('碎片创建成功')
    }

    closeModal()
    fetchFrags()
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(frag: Frag) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除碎片「${frag.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/frags/${frag.id}`)
        message.success('删除成功')
        fetchFrags()
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
  { title: '碎片名称', key: 'name', width: 160, ellipsis: { tooltip: true } },
  { title: '标识', key: 'remark', width: 140 },
  { title: '类型', key: 'type', width: 90 },
  { title: '内容预览', key: 'content', ellipsis: { tooltip: true } },
  { title: '更新时间', key: 'updated_at', width: 160 },
  { title: '操作', key: 'actions', width: 180 },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchFrags()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">碎片管理</h1>
      <NSpace>
        <NButton type="primary" @click="openCreateModal">添加碎片</NButton>
        <NButton @click="fetchFrags">刷新</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="frags"
          size="small"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        >
          <template #body-cell-id="{ row }">
            <span class="text-xs text-gray-400">{{ row.id }}</span>
          </template>

          <template #body-cell-name="{ row }">
            <span class="text-sm text-gray-200">{{ row.name || '-' }}</span>
          </template>

          <template #body-cell-remark="{ row }">
            <NTag size="small" type="info" :bordered="false">
              {{ row.remark || '-' }}
            </NTag>
          </template>

          <template #body-cell-type="{ row }">
            <NTag size="small" :type="getTypeTagType(row.type)" :bordered="false">
              {{ getTypeLabel(row.type) }}
            </NTag>
          </template>

          <template #body-cell-content="{ row }">
            <span class="text-xs text-gray-400">{{ truncateContent(row.content) }}</span>
          </template>

          <template #body-cell-updated_at="{ row }">
            <span class="text-xs text-gray-400">{{ formatTime(row.updated_at) }}</span>
          </template>

          <template #body-cell-actions="{ row }">
            <NSpace>
              <NButton size="small" @click="openEditModal(row)">编辑</NButton>
              <NPopconfirm @positive-click="handleDelete(row)">
                <template #trigger>
                  <NButton size="small" type="error">删除</NButton>
                </template>
                确定删除「{{ row.name }}」吗？
              </NPopconfirm>
            </NSpace>
          </template>
        </NTable>
      </NSpin>

      <div v-if="!loading && frags.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">-</span>
        <p class="mt-3 text-sm">暂无碎片数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="openCreateModal">添加碎片</NButton>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑碎片' : '添加碎片'"
      preset="card"
      style="width: 600px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="碎片名称" required>
          <NInput v-model:value="form.name" placeholder="后台管理用名称" />
        </NFormItem>

        <NFormItem label="碎片标识" required>
          <NInput v-model:value="form.remark" placeholder="代码调用标识（唯一）" />
        </NFormItem>

        <NFormItem label="碎片类型">
          <NSelect
            v-model:value="form.type"
            :options="[
              { label: '富文本', value: 1 },
              { label: '文本框', value: 2 },
            ]"
          />
        </NFormItem>

        <NFormItem label="碎片内容">
          <NInput
            v-model:value="form.content"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 16 }"
            placeholder="碎片内容（支持HTML）"
          />
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
