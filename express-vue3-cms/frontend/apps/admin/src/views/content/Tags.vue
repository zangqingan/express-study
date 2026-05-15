<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  NTable,
  NButton,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  useMessage,
  useDialog,
  NSpin,
  NPopconfirm,
} from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Tag {
  id: number
  name: string
  path: string
  ref_count: number
}

interface TagForm {
  name: string
  path: string
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const tags = ref<Tag[]>([])
const loading = ref(false)
const saving = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

// Merge state
const mergeVisible = ref(false)
const mergeSourceId = ref<number | null>(null)
const mergeTargetId = ref<number | null>(null)

const defaultForm: TagForm = { name: '', path: '' }
const form = reactive<TagForm>({ ...defaultForm })

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchTags() {
  loading.value = true
  try {
    const res = (await api.get('/tags')) as any
    if (res.code === 0) {
      tags.value = res.data.list || res.data || []
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

function openEditModal(tag: Tag) {
  form.name = tag.name
  form.path = tag.path
  isEdit.value = true
  editingId.value = tag.id
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------
function openMergeModal() {
  mergeSourceId.value = null
  mergeTargetId.value = null
  mergeVisible.value = true
}

function closeMergeModal() {
  mergeVisible.value = false
}

async function handleMerge() {
  if (!mergeSourceId.value || !mergeTargetId.value) {
    message.warning('请选择源标签和目标标签')
    return
  }
  if (mergeSourceId.value === mergeTargetId.value) {
    message.warning('源标签和目标标签不能相同')
    return
  }

  const d = dialog.warning({
    title: '确认合并标签',
    content: '合并后，源标签将被删除，其关联的文章将转移到目标标签。此操作不可撤销。',
    positiveText: '确认合并',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.post('/tags/merge', {
          sourceId: mergeSourceId.value,
          targetId: mergeTargetId.value,
        })
        message.success('标签合并成功')
        closeMergeModal()
        fetchTags()
      } catch {
        // Handled by interceptor
      } finally {
        d.loading = false
      }
    },
  })
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
async function handleSave() {
  if (!form.name.trim()) {
    message.warning('请输入标签名称')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      path: form.path || undefined,
    }

    if (isEdit.value && editingId.value) {
      await api.put(`/tags/${editingId.value}`, payload)
      message.success('标签更新成功')
    } else {
      await api.post('/tags', payload)
      message.success('标签创建成功')
    }

    closeModal()
    fetchTags()
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(tag: Tag) {
  const d = dialog.warning({
    title: '确认删除',
    content: `确定要删除标签「${tag.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await api.delete(`/tags/${tag.id}`)
        message.success('删除成功')
        fetchTags()
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
  { title: 'ID', key: 'id', width: 80 },
  { title: '标签名称', key: 'name' },
  { title: '引用数', key: 'ref_count', width: 100 },
  { title: '操作', key: 'actions', width: 200 },
]

// ---------------------------------------------------------------------------
// Tag options for merge select
// ---------------------------------------------------------------------------
const tagOptions = computed(() =>
  tags.value.map((t) => ({
    label: `${t.name}（${t.ref_count || 0}篇文章）`,
    value: t.id,
  })),
)

const tagOptionsSimple = computed(() =>
  tags.value.map((t) => ({ label: t.name, value: t.id })),
)

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">标签管理</h1>
      <NSpace>
        <NButton type="primary" @click="openCreateModal">添加标签</NButton>
        <NButton type="warning" ghost @click="openMergeModal">合并标签</NButton>
        <NButton @click="fetchTags">刷新</NButton>
      </NSpace>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <NSpin :show="loading">
        <NTable
          :columns="columns"
          :data="tags"
          size="small"
          :bordered="false"
          :single-line="false"
          class="!border-0"
        >
          <template #body-cell-id="{ row }">
            <span class="text-xs text-gray-400">{{ row.id }}</span>
          </template>

          <template #body-cell-name="{ row }">
            <span class="text-sm text-gray-200">{{ row.name }}</span>
          </template>

          <template #body-cell-ref_count="{ row }">
            <span class="text-xs text-gray-400">{{ row.ref_count ?? 0 }}</span>
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

      <div v-if="!loading && tags.length === 0" class="flex flex-col items-center py-20 text-gray-400">
        <span class="text-4xl">#</span>
        <p class="mt-3 text-sm">暂无标签数据</p>
        <NButton size="small" type="primary" class="mt-4" @click="openCreateModal">添加标签</NButton>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="modalVisible"
      :title="isEdit ? '编辑标签' : '添加标签'"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="标签名称" required>
          <NInput v-model:value="form.name" placeholder="标签名称（最多10个字符）" maxlength="10" />
        </NFormItem>
        <NFormItem label="路径标识">
          <NInput v-model:value="form.path" placeholder="URL路径标识（可选）" />
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

    <!-- Merge Modal -->
    <NModal
      v-model:show="mergeVisible"
      title="合并标签"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="源标签" required>
          <NSelect
            v-model:value="mergeSourceId"
            :options="tagOptions"
            placeholder="选择要合并的源标签"
            filterable
          />
        </NFormItem>
        <NFormItem label="目标标签" required>
          <NSelect
            v-model:value="mergeTargetId"
            :options="tagOptionsSimple"
            placeholder="选择合并到的目标标签"
            filterable
          />
        </NFormItem>
      </NForm>

      <div class="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-300">
        合并后，源标签将被删除，其关联的所有文章将转移到目标标签下。
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeMergeModal">取消</NButton>
          <NButton type="warning" @click="handleMerge">确认合并</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
