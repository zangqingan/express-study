<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NTag,
  NSpace,
  NPopconfirm,
  NCard,
  useMessage,
  useDialog,
} from 'naive-ui'
import api from '@/api'

interface Model {
  id: number
  model_name: string
  table_name: string
  status: number
  remark: string
  created_at?: string
}

interface Field {
  id: number
  cname: string
  ename: string
  type: number
  val: string
  default_val: string
  order_by: number
  length: number
  model_id: number
}

const message = useMessage()
const dialog = useDialog()

// ─── Model state ───
const models = ref<Model[]>([])
const modelPagination = ref({ total: 0, page: 1, pageSize: 10 })
const modelModalVisible = ref(false)
const editingModel = ref<Model | null>(null)
const modelForm = ref({ model_name: '', table_name: '', status: 1, remark: '' })
const modelLoading = ref(false)

// ─── Field state ───
const selectedModel = ref<Model | null>(null)
const fields = ref<Field[]>([])
const fieldPagination = ref({ total: 0, page: 1, pageSize: 20 })
const fieldModalVisible = ref(false)
const editingField = ref<Field | null>(null)
const fieldForm = ref({
  cname: '',
  ename: '',
  type: 1,
  val: '',
  default_val: '',
  order_by: 0,
  length: 255,
})
const fieldLoading = ref(false)

const fieldTypeOptions = [
  { label: '1-文本', value: 1 },
  { label: '2-多行文本', value: 2 },
  { label: '3-下拉', value: 3 },
  { label: '4-单选', value: 4 },
  { label: '5-多选', value: 5 },
  { label: '6-日期', value: 6 },
  { label: '7-数字', value: 7 },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

function getFieldTypeLabel(type: number) {
  const opt = fieldTypeOptions.find((o) => o.value === type)
  return opt ? opt.label : String(type)
}

// ═══ Models CRUD ═══
async function loadModels(page = 1) {
  modelLoading.value = true
  try {
    const res: any = await api.get('/models', {
      params: { page, pageSize: modelPagination.value.pageSize },
    })
    models.value = res.data?.list || []
    modelPagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    modelLoading.value = false
  }
}

function openCreateModel() {
  editingModel.value = null
  modelForm.value = { model_name: '', table_name: '', status: 1, remark: '' }
  modelModalVisible.value = true
}

function openEditModel(row: Model) {
  editingModel.value = row
  modelForm.value = {
    model_name: row.model_name,
    table_name: row.table_name,
    status: row.status,
    remark: row.remark || '',
  }
  modelModalVisible.value = true
}

async function saveModel() {
  try {
    if (editingModel.value) {
      await api.put(`/models/${editingModel.value.id}`, modelForm.value)
      message.success('模型更新成功')
    } else {
      await api.post('/models', modelForm.value)
      message.success('模型创建成功')
    }
    modelModalVisible.value = false
    await loadModels(modelPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteModel(row: Model) {
  try {
    await api.delete(`/models/${row.id}`)
    message.success('模型已删除')
    if (selectedModel.value?.id === row.id) {
      selectedModel.value = null
      fields.value = []
    }
    await loadModels(modelPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

function handleModelPageChange(page: number) {
  loadModels(page)
}

// ═══ Select model → load its fields ═══
function selectModel(model: Model) {
  selectedModel.value = model
  fieldPagination.value.page = 1
  loadFields()
}

async function loadFields(page = 1) {
  if (!selectedModel.value) return
  fieldLoading.value = true
  try {
    const res: any = await api.get(`/models/${selectedModel.value.id}/fields`, {
      params: { page, pageSize: fieldPagination.value.pageSize },
    })
    fields.value = res.data?.list || []
    fieldPagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 20 }
  } catch {
    // handled by interceptor
  } finally {
    fieldLoading.value = false
  }
}

function openCreateField() {
  if (!selectedModel.value) {
    message.warning('请先选择一个模型')
    return
  }
  editingField.value = null
  fieldForm.value = {
    cname: '',
    ename: '',
    type: 1,
    val: '',
    default_val: '',
    order_by: 0,
    length: 255,
  }
  fieldModalVisible.value = true
}

function openEditField(row: Field) {
  editingField.value = row
  fieldForm.value = {
    cname: row.cname,
    ename: row.ename,
    type: row.type,
    val: row.val || '',
    default_val: row.default_val || '',
    order_by: row.order_by || 0,
    length: row.length || 255,
  }
  fieldModalVisible.value = true
}

async function saveField() {
  if (!selectedModel.value) return
  const payload = {
    ...fieldForm.value,
    val: fieldForm.value.val || null,
    default_val: fieldForm.value.default_val || null,
  }
  try {
    if (editingField.value) {
      await api.put(`/models/${selectedModel.value.id}/fields/${editingField.value.id}`, payload)
      message.success('字段更新成功')
    } else {
      await api.post(`/models/${selectedModel.value.id}/fields`, payload)
      message.success('字段创建成功')
    }
    fieldModalVisible.value = false
    await loadFields(fieldPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteField(row: Field) {
  if (!selectedModel.value) return
  try {
    await api.delete(`/models/${selectedModel.value.id}/fields/${row.id}`)
    message.success('字段已删除')
    await loadFields(fieldPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

function handleFieldPageChange(page: number) {
  loadFields(page)
}

onMounted(() => loadModels())
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">模型管理</h1>

    <!-- ═══ MODEL TABLE ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="mb-6 border border-white/10 bg-white/5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold text-white">模型列表</h3>
        <n-button type="primary" @click="openCreateModel">新建模型</n-button>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>模型名称</th>
            <th>表名</th>
            <th>状态</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr
            v-for="m in models"
            :key="m.id"
            class="cursor-pointer transition-colors hover:bg-white/5"
            :class="{ 'bg-white/10': selectedModel?.id === m.id }"
            @click="selectModel(m)"
          >
            <td class="text-gray-500">{{ m.id }}</td>
            <td class="font-medium text-white">{{ m.model_name }}</td>
            <td class="font-mono text-xs text-gray-400">{{ m.table_name }}</td>
            <td>
              <n-tag :type="m.status === 1 ? 'success' : 'default'" size="small">
                {{ m.status === 1 ? '启用' : '禁用' }}
              </n-tag>
            </td>
            <td class="max-w-[200px] truncate">{{ m.remark || '-' }}</td>
            <td @click.stop>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="openEditModel(m)">编辑</n-button>
                <n-popconfirm
                  @positive-click="() => deleteModel(m)"
                  positive-text="确定"
                  negative-text="取消"
                >
                  <template #trigger>
                    <n-button text color="#f87171" size="small">删除</n-button>
                  </template>
                  确定删除模型「{{ m.model_name }}」吗？相关字段也会被删除。
                </n-popconfirm>
              </n-space>
            </td>
          </tr>
          <tr v-if="!modelLoading && models.length === 0">
            <td colspan="6" class="py-8 text-center text-gray-500">暂无数据</td>
          </tr>
        </tbody>
      </n-table>
      <div v-if="modelPagination.total > modelPagination.pageSize" class="mt-4 flex justify-center">
        <n-space>
          <n-button
            text
            size="small"
            :disabled="modelPagination.page <= 1"
            @click="handleModelPageChange(modelPagination.page - 1)"
          >上一页</n-button>
          <span class="text-sm text-gray-400">
            第 {{ modelPagination.page }} / {{ Math.ceil(modelPagination.total / modelPagination.pageSize) }} 页
          </span>
          <n-button
            text
            size="small"
            :disabled="modelPagination.page >= Math.ceil(modelPagination.total / modelPagination.pageSize)"
            @click="handleModelPageChange(modelPagination.page + 1)"
          >下一页</n-button>
        </n-space>
      </div>
    </n-card>

    <!-- ═══ FIELD TABLE ═══ -->
    <n-card
      v-if="selectedModel"
      :bordered="true"
      style="border-color: rgba(255,255,255,0.1)"
      class="border border-white/10 bg-white/5"
    >
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold text-white">
          字段管理 —
          <span class="text-blue-400">{{ selectedModel.model_name }}</span>
          <span class="text-xs text-gray-500"> (表: {{ selectedModel.table_name }})</span>
        </h3>
        <n-button type="primary" @click="openCreateField">新建字段</n-button>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>中文名</th>
            <th>英文名</th>
            <th>类型</th>
            <th>可选值</th>
            <th>默认值</th>
            <th>排序</th>
            <th>长度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr v-for="f in fields" :key="f.id" class="transition-colors hover:bg-white/5">
            <td class="text-gray-500">{{ f.id }}</td>
            <td class="text-white">{{ f.cname }}</td>
            <td class="font-mono text-xs text-gray-400">{{ f.ename }}</td>
            <td>
              <n-tag :bordered="false" size="small">{{ getFieldTypeLabel(f.type) }}</n-tag>
            </td>
            <td class="max-w-[150px] truncate font-mono text-xs text-gray-400">{{ f.val || '-' }}</td>
            <td>{{ f.default_val || '-' }}</td>
            <td>{{ f.order_by }}</td>
            <td>{{ f.length }}</td>
            <td>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="openEditField(f)">编辑</n-button>
                <n-popconfirm @positive-click="() => deleteField(f)" positive-text="确定" negative-text="取消">
                  <template #trigger>
                    <n-button text color="#f87171" size="small">删除</n-button>
                  </template>
                  确定删除字段「{{ f.cname }}」吗？
                </n-popconfirm>
              </n-space>
            </td>
          </tr>
          <tr v-if="!fieldLoading && fields.length === 0">
            <td colspan="9" class="py-8 text-center text-gray-500">暂无字段，请点击「新建字段」添加</td>
          </tr>
        </tbody>
      </n-table>
      <div v-if="fieldPagination.total > fieldPagination.pageSize" class="mt-4 flex justify-center">
        <n-space>
          <n-button
            text
            size="small"
            :disabled="fieldPagination.page <= 1"
            @click="handleFieldPageChange(fieldPagination.page - 1)"
          >上一页</n-button>
          <span class="text-sm text-gray-400">
            第 {{ fieldPagination.page }} / {{ Math.ceil(fieldPagination.total / fieldPagination.pageSize) }} 页
          </span>
          <n-button
            text
            size="small"
            :disabled="fieldPagination.page >= Math.ceil(fieldPagination.total / fieldPagination.pageSize)"
            @click="handleFieldPageChange(fieldPagination.page + 1)"
          >下一页</n-button>
        </n-space>
      </div>
    </n-card>

    <div
      v-else
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 py-16 text-gray-500"
    >
      <p class="text-sm">点击上方模型行以查看和管理其字段</p>
    </div>

    <!-- ═══ MODEL MODAL ═══ -->
    <n-modal v-model:show="modelModalVisible" preset="card" title="模型信息" style="max-width:560px" :bordered="false">
      <n-form label-placement="left" label-width="80" size="medium">
        <n-form-item label="模型名称" required>
          <n-input v-model:value="modelForm.model_name" placeholder="例如：文章、产品" />
        </n-form-item>
        <n-form-item label="数据库表名" required>
          <n-input v-model:value="modelForm.table_name" placeholder="例如：articles、products" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="modelForm.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="modelForm.remark" type="textarea" placeholder="可选备注" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modelModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveModel">
            {{ editingModel ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- ═══ FIELD MODAL ═══ -->
    <n-modal v-model:show="fieldModalVisible" preset="card" title="字段信息" style="max-width:560px" :bordered="false">
      <n-form label-placement="left" label-width="80" size="medium">
        <n-form-item label="中文名" required>
          <n-input v-model:value="fieldForm.cname" placeholder="例如：标题" />
        </n-form-item>
        <n-form-item label="英文名" required>
          <n-input v-model:value="fieldForm.ename" placeholder="例如：title" />
        </n-form-item>
        <n-form-item label="类型" required>
          <n-select v-model:value="fieldForm.type" :options="fieldTypeOptions" />
        </n-form-item>
        <n-form-item label="可选值">
          <n-input
            v-model:value="fieldForm.val"
            type="textarea"
            placeholder='JSON格式，例如 ["选项A","选项B"] 或 {"key":"value"}'
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
          <span class="text-xs text-gray-500">下拉/单选/多选类型需要填写</span>
        </n-form-item>
        <n-form-item label="默认值">
          <n-input v-model:value="fieldForm.default_val" placeholder="默认值" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input v-model:value="fieldForm.order_by" placeholder="数字，越小越靠前" />
        </n-form-item>
        <n-form-item label="长度">
          <n-input v-model:value="fieldForm.length" placeholder="默认 255" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="fieldModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveField">
            {{ editingField ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
