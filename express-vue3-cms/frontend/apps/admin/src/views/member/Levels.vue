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
} from 'naive-ui'
import api from '@/api'

interface Level {
  id: number
  name: string
  code: string
  days: number
  description: string
  status: number
}

const message = useMessage()

// ─── State ───
const levels = ref<Level[]>([])
const pagination = ref({ total: 0, page: 1, pageSize: 10 })
const loading = ref(false)
const modalVisible = ref(false)
const editingLevel = ref<Level | null>(null)
const form = ref({
  name: '',
  code: '季',
  days: 90,
  description: '',
  status: 1,
})

const codeOptions = [
  { label: '月', value: '月' },
  { label: '季', value: '季' },
  { label: '年', value: '年' },
  { label: '永久', value: '永久' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

// ═══ Load levels ═══
async function loadLevels(page = 1) {
  loading.value = true
  try {
    const res: any = await api.get('/levels', {
      params: { page, pageSize: pagination.value.pageSize },
    })
    levels.value = res.data?.list || []
    pagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  loadLevels(page)
}

// ═══ Create / Edit ═══
function openCreate() {
  editingLevel.value = null
  form.value = { name: '', code: '季', days: 90, description: '', status: 1 }
  modalVisible.value = true
}

function openEdit(row: Level) {
  editingLevel.value = row
  form.value = {
    name: row.name,
    code: row.code,
    days: row.days,
    description: row.description || '',
    status: row.status,
  }
  modalVisible.value = true
}

async function saveLevel() {
  try {
    if (editingLevel.value) {
      await api.put(`/levels/${editingLevel.value.id}`, form.value)
      message.success('等级更新成功')
    } else {
      await api.post('/levels', form.value)
      message.success('等级创建成功')
    }
    modalVisible.value = false
    await loadLevels(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteLevel(row: Level) {
  try {
    await api.delete(`/levels/${row.id}`)
    message.success('等级已删除')
    await loadLevels(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

onMounted(() => loadLevels())
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">等级管理</h1>

    <!-- ═══ Levels table ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="border border-white/10 bg-white/5">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-gray-400">共 {{ pagination.total }} 条</span>
        <n-button type="primary" @click="openCreate">新建等级</n-button>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>名称</th>
            <th>标识</th>
            <th>有效天数</th>
            <th>描述</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr v-for="lv in levels" :key="lv.id" class="transition-colors hover:bg-white/5">
            <td class="text-gray-500">{{ lv.id }}</td>
            <td class="font-medium text-white">{{ lv.name }}</td>
            <td>
              <n-tag :bordered="false" size="small">{{ lv.code }}</n-tag>
            </td>
            <td>{{ lv.days === -1 || lv.code === '永久' ? '永久' : `${lv.days} 天` }}</td>
            <td class="max-w-[200px] truncate">{{ lv.description || '-' }}</td>
            <td>
              <n-tag :type="lv.status === 1 ? 'success' : 'default'" size="small">
                {{ lv.status === 1 ? '启用' : '禁用' }}
              </n-tag>
            </td>
            <td>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="openEdit(lv)">编辑</n-button>
                <n-popconfirm @positive-click="() => deleteLevel(lv)" positive-text="确定" negative-text="取消">
                  <template #trigger>
                    <n-button text color="#f87171" size="small">删除</n-button>
                  </template>
                  确定删除等级「{{ lv.name }}」吗？
                </n-popconfirm>
              </n-space>
            </td>
          </tr>
          <tr v-if="!loading && levels.length === 0">
            <td colspan="7" class="py-8 text-center text-gray-500">暂无数据</td>
          </tr>
        </tbody>
      </n-table>
      <div v-if="pagination.total > pagination.pageSize" class="mt-4 flex justify-center">
        <n-space>
          <n-button text size="small" :disabled="pagination.page <= 1" @click="handlePageChange(pagination.page - 1)">上一页</n-button>
          <span class="text-sm text-gray-400">
            第 {{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
          </span>
          <n-button text size="small" :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)" @click="handlePageChange(pagination.page + 1)">下一页</n-button>
        </n-space>
      </div>
    </n-card>

    <!-- ═══ Level modal ═══ -->
    <n-modal v-model:show="modalVisible" preset="card" title="等级信息" style="max-width:520px" :bordered="false">
      <n-form label-placement="left" label-width="80" size="medium">
        <n-form-item label="名称" required>
          <n-input v-model:value="form.name" placeholder="例如：黄金会员、高级VIP" />
        </n-form-item>
        <n-form-item label="标识" required>
          <n-select v-model:value="form.code" :options="codeOptions" />
        </n-form-item>
        <n-form-item label="有效天数">
          <n-input v-model:value="form.days" placeholder="90，-1 表示永久" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.description" type="textarea" placeholder="等级描述或备注" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="form.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveLevel">
            {{ editingLevel ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
