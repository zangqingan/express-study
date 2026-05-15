<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  NTable,
  NButton,
  NSpace,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NInputNumber,
  NTreeSelect,
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
interface Category {
  id: number
  parent_id: number
  seo_title: string | null
  seo_keywords: string | null
  seo_description: string | null
  name: string
  pinyin: string
  path: string
  description: string
  type: number
  url: string | null
  order_by: number
  target: number
  status: number
  mid: number | null
  list_view: string
  article_view: string
  created_at: string
  updated_at: string
  children?: Category[]
}

interface CategoryForm {
  name: string
  pinyin: string
  path: string
  parent_id: number
  type: number
  description: string
  url: string
  order_by: number
  target: number
  status: number
  mid: number | null
  list_view: string
  article_view: string
  seo_title: string
  seo_keywords: string
  seo_description: string
}

interface Model {
  id: number
  model_name: string
}

interface FlatCategory extends Category {
  depth: number
  prefix: string
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const categories = ref<Category[]>([])
const treeData = ref<Category[]>([])
const models = ref<Model[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: CategoryForm = {
  name: '',
  pinyin: '',
  path: '',
  parent_id: 0,
  type: 0,
  description: '',
  url: '',
  order_by: 0,
  target: 0,
  status: 0,
  mid: null,
  list_view: 'list.html',
  article_view: 'article.html',
  seo_title: '',
  seo_keywords: '',
  seo_description: '',
}

const form = reactive<CategoryForm>({ ...defaultForm })

// ---------------------------------------------------------------------------
// Flatten tree for table display with indent
// ---------------------------------------------------------------------------
const flatCategories = computed<FlatCategory[]>(() => {
  const result: FlatCategory[] = []
  function flatten(list: Category[], depth: number) {
    for (const item of list) {
      const prefix = depth > 0 ? '- '.repeat(depth) : ''
      result.push({ ...item, depth, prefix })
      if (item.children && item.children.length > 0) {
        flatten(item.children, depth + 1)
      }
    }
  }
  flatten(categories.value, 0)
  return result
})

// ---------------------------------------------------------------------------
// Build NTreeSelect options
// ---------------------------------------------------------------------------
function buildTreeOptions(list: Category[]): any[] {
  return list.map((item) => ({
    label: item.name,
    key: item.id,
    children: item.children ? buildTreeOptions(item.children) : undefined,
  }))
}

const modelOptions = computed(() =>
  models.value.map((m) => ({ label: m.model_name, value: m.id })),
)

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchCategories() {
  loading.value = true
  try {
    const res = (await api.get('/categories/tree')) as any
    if (res.code === 0) {
      categories.value = res.data || []
      treeData.value = res.data || []
    }
  } catch {
    // Handled by interceptor
  } finally {
    loading.value = false
  }
}

async function fetchModels() {
  try {
    const res = (await api.get('/models')) as any
    if (res.code === 0) {
      models.value = res.data.list || res.data || []
    }
  } catch {
    // Non-critical
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getModelName(mid: number | null): string {
  if (!mid) return '-'
  const m = models.value.find((x) => x.id === mid)
  return m?.model_name || `ID:${mid}`
}

function formatTime(dateStr: string): string {
  return dateStr ? dayjs(dateStr).format('YYYY-MM-DD HH:mm') : '-'
}

// ---------------------------------------------------------------------------
// Modal actions
// ---------------------------------------------------------------------------
function openCreateModal(parentId: number = 0) {
  Object.assign(form, { ...defaultForm, parent_id: parentId })
  isEdit.value = false
  editingId.value = null
  modalVisible.value = true
}

function openEditModal(cat: Category) {
  Object.assign(form, {
    name: cat.name,
    pinyin: cat.pinyin,
    path: cat.path,
    parent_id: cat.parent_id,
    type: cat.type,
    description: cat.description || '',
    url: cat.url || '',
    order_by: cat.order_by,
    target: cat.target,
    status: cat.status,
    mid: cat.mid,
    list_view: cat.list_view || 'list.html',
    article_view: cat.article_view || 'article.html',
    seo_title: cat.seo_title || '',
    seo_keywords: cat.seo_keywords || '',
    seo_description: cat.seo_description || '',
  })
  isEdit.value = true
  editingId.value = cat.id
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
    message.warning('请输入栏目名称')
    return
  }
  if (!form.pinyin.trim()) {
    message.warning('请输入拼音标识')
    return
  }
  if (!form.path.trim()) {
    message.warning('请输入栏目路径')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      pinyin: form.pinyin,
      path: form.path,
      parent_id: form.parent_id,
      type: form.type,
      description: form.description,
      url: form.url || undefined,
      order_by: form.order_by,
      target: form.target,
      status: form.status,
      mid: form.mid,
      list_view: form.list_view,
      article_view: form.article_view,
      seo_title: form.seo_title || undefined,
      seo_keywords: form.seo_keywords || undefined,
      seo_description: form.seo_description || undefined,
    }

    if (isEdit.value && editingId.value) {
      await api.put(`/categories/${editingId.value}`, payload)
      message.success('栏目更新成功')
    } else {
      await api.post('/categories', payload)
      message.success('栏目创建成功')
    }

    closeModal()
    fetchCategories()
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(cat: Category) {
  if (cat.children && cat.children.length > 0) {
    message.warning('该栏目下存在子栏目，请先删除子栏目')
    return
  }

  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除栏目「${cat.name}」吗？此操作不可撤销。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/categories/${cat.id}`)
        message.success('删除成功')
        fetchCategories()
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
  { title: '名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '拼音', key: 'pinyin', width: 120 },
  { title: '路径', key: 'path', width: 160 },
  { title: '类型', key: 'type', width: 80 },
  { title: '模型', key: 'mid', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '排序', key: 'order_by', width: 70 },
  { title: '创建时间', key: 'created_at', width: 160 },
  { title: '操作', key: 'actions', width: 240 },
]

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchCategories()
  fetchModels()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">栏目管理</h1>
      <NSpace>
        <NButton type="primary" @click="openCreateModal(0)">添加栏目</NButton>
        <NButton @click="fetchCategories">刷新</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="flatCategories"
          size="small"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        >
          <!-- Name with indent -->
          <template #body-cell-name="{ row }: { row: FlatCategory }">
            <span class="text-sm text-gray-200">{{ row.prefix }}{{ row.name }}</span>
          </template>

          <!-- Pinyin -->
          <template #body-cell-pinyin="{ row }">
            <span class="text-xs text-gray-400">{{ row.pinyin }}</span>
          </template>

          <!-- Path -->
          <template #body-cell-path="{ row }">
            <span class="text-xs text-gray-400">{{ row.path }}</span>
          </template>

          <!-- Type -->
          <template #body-cell-type="{ row }">
            <NTag size="small" :type="row.type === 0 ? 'info' : 'warning'" :bordered="false">
              {{ row.type === 0 ? '栏目' : '单页' }}
            </NTag>
          </template>

          <!-- Model -->
          <template #body-cell-mid="{ row }">
            <span class="text-xs text-gray-400">{{ getModelName(row.mid) }}</span>
          </template>

          <!-- Status -->
          <template #body-cell-status="{ row }">
            <NTag size="small" :type="row.status === 0 ? 'success' : 'default'" :bordered="false">
              {{ row.status === 0 ? '显示' : '隐藏' }}
            </NTag>
          </template>

          <!-- Order -->
          <template #body-cell-order_by="{ row }">
            <span class="text-xs text-gray-400">{{ row.order_by }}</span>
          </template>

          <!-- Created at -->
          <template #body-cell-created_at="{ row }">
            <span class="text-xs text-gray-400">{{ formatTime(row.created_at) }}</span>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="{ row }">
            <NSpace>
              <NButton size="small" @click="openEditModal(row)">编辑</NButton>
              <NButton size="small" type="primary" ghost @click="openCreateModal(row.id)">
                添加子栏目
              </NButton>
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

      <div v-if="!loading && flatCategories.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">-</span>
        <p class="mt-3 text-sm">暂无栏目数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="openCreateModal(0)">添加栏目</NButton>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑栏目' : '添加栏目'"
      preset="card"
      style="width: 720px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="100" :show-feedback="false">
        <NFormItem label="上级栏目">
          <NTreeSelect
            :value="form.parent_id"
            :options="[{ label: '顶级栏目', key: 0 }, ...buildTreeOptions(treeData)]"
            @update:value="(v: any) => (form.parent_id = v)"
            placeholder="选择上级栏目（0=顶级）"
            clearable
          />
        </NFormItem>

        <NFormItem label="栏目名称" required>
          <NInput v-model:value="form.name" placeholder="栏目名称" />
        </NFormItem>

        <NFormItem label="拼音标识" required>
          <NInput v-model:value="form.pinyin" placeholder="拼音（如 news）" />
        </NFormItem>

        <NFormItem label="栏目路径" required>
          <NInput v-model:value="form.path" placeholder="路径（如 /news）" />
        </NFormItem>

        <NFormItem label="栏目描述">
          <NInput v-model:value="form.description" placeholder="栏目描述" />
        </NFormItem>

        <NFormItem label="栏目类型">
          <NSelect
            v-model:value="form.type"
            :options="[
              { label: '栏目（列表）', value: 0 },
              { label: '单页', value: 1 },
            ]"
          />
        </NFormItem>

        <NFormItem label="外部链接">
          <NInput v-model:value="form.url" placeholder="外部URL（可选）" />
        </NFormItem>

        <NFormItem label="打开方式">
          <NSelect
            v-model:value="form.target"
            :options="[
              { label: '当前页', value: 0 },
              { label: '新窗口', value: 1 },
            ]"
          />
        </NFormItem>

        <NFormItem label="关联模型">
          <NSelect
            v-model:value="form.mid"
            :options="[{ label: '无', value: null }, ...modelOptions]"
            placeholder="关联扩展模型"
            clearable
          />
        </NFormItem>

        <NFormItem label="列表模板">
          <NInput v-model:value="form.list_view" placeholder="如 list.html" />
        </NFormItem>

        <NFormItem label="详情模板">
          <NInput v-model:value="form.article_view" placeholder="如 article.html" />
        </NFormItem>

        <NFormItem label="排序">
          <NInputNumber v-model:value="form.order_by" :min="0" style="width: 120px" />
        </NFormItem>

        <NFormItem label="状态">
          <NSelect
            v-model:value="form.status"
            :options="[
              { label: '显示', value: 0 },
              { label: '隐藏', value: 1 },
            ]"
          />
        </NFormItem>

        <!-- SEO fields -->
        <div class="mb-2 mt-4 text-sm font-semibold text-gray-300">SEO 设置</div>

        <NFormItem label="SEO标题">
          <NInput v-model:value="form.seo_title" placeholder="SEO标题" />
        </NFormItem>

        <NFormItem label="SEO关键词">
          <NInput v-model:value="form.seo_keywords" placeholder="SEO关键词" />
        </NFormItem>

        <NFormItem label="SEO描述">
          <NInput
            v-model:value="form.seo_description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="SEO描述"
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
