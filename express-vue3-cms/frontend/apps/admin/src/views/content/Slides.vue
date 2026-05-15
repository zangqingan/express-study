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
  NUpload,
  NImage,
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
interface Slide {
  id: number
  title: string | null
  img_url: string | null
  link_url: string | null
  remark: string | null
  created_at: string
  updated_at: string
}

interface SlideForm {
  title: string
  img_url: string
  link_url: string
  remark: string
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const slides = ref<Slide[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: SlideForm = {
  title: '',
  img_url: '',
  link_url: '',
  remark: '',
}
const form = reactive<SlideForm>({ ...defaultForm })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(dateStr: string): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm') : '-'
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchSlides() {
  loading.value = true
  try {
    const res = (await api.get('/slides')) as any
    if (res.code === 0) {
      slides.value = res.data || []
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

function openEditModal(slide: Slide) {
  form.title = slide.title || ''
  form.img_url = slide.img_url || ''
  form.link_url = slide.link_url || ''
  form.remark = slide.remark || ''
  isEdit.value = true
  editingId.value = slide.id
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
    message.warning('请输入轮播标题')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: form.title,
      img_url: form.img_url || undefined,
      link_url: form.link_url || undefined,
      remark: form.remark || undefined,
    }

    if (isEdit.value && editingId.value) {
      await api.put(`/slides/${editingId.value}`, payload)
      message.success('轮播图更新成功')
    } else {
      await api.post('/slides', payload)
      message.success('轮播图创建成功')
    }

    closeModal()
    fetchSlides()
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(slide: Slide) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除轮播图「${slide.title || slide.id}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/slides/${slide.id}`)
        message.success('删除成功')
        fetchSlides()
      } catch {
        // Handled by interceptor
      } finally {
        d.loading = false
      }
    },
  })
}

function handleUploadFinish({ file }: any) {
  if (file.url) {
    form.img_url = file.url
    message.success('图片上传成功')
  }
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------
const columns = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '图片', key: 'img_url', width: 120 },
  { title: '链接', key: 'link_url', width: 200, ellipsis: { tooltip: true } },
  { title: '序号', key: '_index', width: 70 },
  { title: '创建时间', key: 'created_at', width: 160 },
  { title: '操作', key: 'actions', width: 180 },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchSlides()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">轮播管理</h1>
      <NSpace>
        <NButton type="primary" @click="openCreateModal">添加轮播</NButton>
        <NButton @click="fetchSlides">刷新</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="slides"
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

          <!-- Thumbnail -->
          <template #body-cell-img_url="{ row }">
            <NImage
              v-if="row.img_url"
              :src="row.img_url"
              width="80"
              height="50"
              style="object-fit: cover; border-radius: 4px;"
            />
            <span v-else class="text-xs text-gray-500">-</span>
          </template>

          <template #body-cell-link_url="{ row }">
            <span class="text-xs text-gray-400">{{ row.link_url || '-' }}</span>
          </template>

          <template #body-cell-_index="{ _index }">
            <span class="text-xs text-gray-400">{{ (_index as number) + 1 }}</span>
          </template>

          <template #body-cell-created_at="{ row }">
            <span class="text-xs text-gray-400">{{ formatTime(row.created_at) }}</span>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="{ row }">
            <NSpace>
              <NButton size="small" @click="openEditModal(row)">编辑</NButton>
              <NPopconfirm @positive-click="handleDelete(row)">
                <template #trigger>
                  <NButton size="small" type="error">删除</NButton>
                </template>
                确定删除「{{ row.title || row.id }}」吗？
              </NPopconfirm>
            </NSpace>
          </template>
        </NTable>
      </NSpin>

      <div v-if="!loading && slides.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">-</span>
        <p class="mt-3 text-sm">暂无轮播图数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="openCreateModal">添加轮播</NButton>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑轮播' : '添加轮播'"
      preset="card"
      style="width: 560px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="轮播标题">
          <NInput v-model:value="form.title" placeholder="轮播图标题" />
        </NFormItem>

        <NFormItem label="图片">
          <NSpace align="center">
            <NInput v-model:value="form.img_url" placeholder="图片URL" style="width: 320px" />
            <NUpload
              :show-file-list="false"
              action="/api/v1/upload"
              @finish="handleUploadFinish"
            >
              <NButton>上传</NButton>
            </NUpload>
          </NSpace>
          <template #feedback>
            <span class="text-xs text-gray-500">可直接输入URL或点击上传按钮</span>
          </template>
        </NFormItem>

        <!-- Preview -->
        <NFormItem v-if="form.img_url" label="预览">
          <NImage
            :src="form.img_url"
            width="200"
            height="120"
            style="object-fit: cover; border-radius: 6px;"
          />
        </NFormItem>

        <NFormItem label="跳转链接">
          <NInput v-model:value="form.link_url" placeholder="点击跳转URL（可选）" />
        </NFormItem>

        <NFormItem label="备注">
          <NInput v-model:value="form.remark" placeholder="备注信息（可选）" />
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
