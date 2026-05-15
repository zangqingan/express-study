<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NTag,
  NPopconfirm,
  NSpin,
  NEmpty,
  NPagination,
  useMessage,
  useDialog,
} from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// --- Types ---
interface Notice {
  id: number
  title: string
  content: string
  status: number
  created_at: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

// --- State ---
const loading = ref(false)
const saving = ref(false)
const notices = ref<Notice[]>([])
const pagination = reactive<Pagination>({ page: 1, pageSize: 10, total: 0 })
const showModal = ref(false)
const isEdit = ref(false)
const currentNotice = ref<Notice | null>(null)

const form = reactive({
  title: '',
  content: '',
  status: 1,
})

const statusOptions = [
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
]

// --- Helpers ---
function truncate(text: string, maxLen: number): string {
  if (!text) return '-'
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

// --- API ---
async function fetchNotices() {
  loading.value = true
  try {
    const res = (await api.get('/notices', {
      params: { page: pagination.page, pageSize: pagination.pageSize },
    })) as any
    if (res.code === 0) {
      notices.value = res.data?.list ?? res.data ?? []
      pagination.total = res.data?.pagination?.total ?? 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

// --- Modal handlers ---
function openCreateModal() {
  isEdit.value = false
  currentNotice.value = null
  form.title = ''
  form.content = ''
  form.status = 1
  showModal.value = true
}

function openEditModal(notice: Notice) {
  isEdit.value = true
  currentNotice.value = notice
  form.title = notice.title
  form.content = notice.content
  form.status = notice.status
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!form.title.trim()) {
    message.warning('请输入通知标题')
    return
  }
  if (!form.content.trim()) {
    message.warning('请输入通知内容')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
    }

    if (isEdit.value && currentNotice.value) {
      const res = (await api.put(`/notices/${currentNotice.value.id}`, payload)) as any
      if (res.code === 0) {
        message.success('更新成功')
      }
    } else {
      const res = (await api.post('/notices', payload)) as any
      if (res.code === 0) {
        message.success('创建成功')
      }
    }
    closeModal()
    await fetchNotices()
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(notice: Notice) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除通知 "${notice.title}" 吗？此操作不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = (await api.delete(`/notices/${notice.id}`)) as any
        if (res.code === 0) {
          message.success('删除成功')
          await fetchNotices()
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
  fetchNotices()
}

function onPageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  fetchNotices()
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">通知公告</h1>
      <NButton type="primary" @click="openCreateModal">
        新增通知
      </NButton>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpin :show="loading">
        <NTable v-if="notices.length > 0" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-left text-gray-400">ID</th>
              <th class="text-left text-gray-400">标题</th>
              <th class="text-left text-gray-400">内容</th>
              <th class="text-left text-gray-400">状态</th>
              <th class="text-left text-gray-400">创建时间</th>
              <th class="text-left text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id" class="border-t border-white/5">
              <td class="text-gray-300">{{ notice.id }}</td>
              <td class="font-medium text-white">{{ notice.title }}</td>
              <td class="max-w-xs text-gray-400">
                {{ truncate(notice.content, 50) }}
              </td>
              <td>
                <NTag :type="notice.status === 1 ? 'success' : 'default'" size="small">
                  {{ notice.status === 1 ? '已发布' : '草稿' }}
                </NTag>
              </td>
              <td class="text-gray-400">{{ notice.created_at }}</td>
              <td>
                <NSpace>
                  <NButton size="tiny" quaternary @click="openEditModal(notice)">
                    编辑
                  </NButton>
                  <NPopconfirm @positive-click="handleDelete(notice)">
                    <template #trigger>
                      <NButton size="tiny" quaternary type="error">
                        删除
                      </NButton>
                    </template>
                    确定删除此通知？
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

    <!-- Create/Edit Modal -->
    <NModal
      v-model:show="showModal"
      :title="isEdit ? '编辑通知' : '新增通知'"
      preset="card"
      style="width: 600px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="标题">
          <NInput v-model:value="form.title" placeholder="请输入通知标题" />
        </NFormItem>
        <NFormItem label="内容">
          <NInput
            v-model:value="form.content"
            type="textarea"
            placeholder="请输入通知内容"
            :autosize="{ minRows: 5, maxRows: 12 }"
          />
        </NFormItem>
        <NFormItem label="状态">
          <NSpace>
            <NButton
              size="small"
              :type="form.status === 1 ? 'primary' : 'default'"
              @click="form.status = 1"
            >
              已发布
            </NButton>
            <NButton
              size="small"
              :type="form.status === 0 ? 'primary' : 'default'"
              @click="form.status = 0"
            >
              草稿
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? '保存修改' : '创建通知' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
