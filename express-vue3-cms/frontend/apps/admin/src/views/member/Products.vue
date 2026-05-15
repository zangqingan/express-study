<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NTag,
  NSpace,
  NPopconfirm,
  NCard,
  useMessage,
} from 'naive-ui'
import api from '@/api'

interface Product {
  id: number
  name: string
  price: number
  level_id: number
  level_name?: string
  days: number
  description: string
  status: number
}

interface Level {
  id: number
  name: string
}

const message = useMessage()

// ─── State ───
const products = ref<Product[]>([])
const pagination = ref({ total: 0, page: 1, pageSize: 10 })
const loading = ref(false)
const modalVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const form = ref({
  name: '',
  price: null as number | null,
  level_id: null as number | null,
  days: 30,
  description: '',
  status: 1,
})

const levels = ref<Level[]>([])

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

// ═══ Load levels for select ═══
async function loadLevels() {
  try {
    const res: any = await api.get('/levels', { params: { pageSize: 1000 } })
    levels.value = res.data?.list || []
  } catch {
    // non-critical
  }
}

// ═══ Load products ═══
async function loadProducts(page = 1) {
  loading.value = true
  try {
    const res: any = await api.get('/products', {
      params: { page, pageSize: pagination.value.pageSize },
    })
    products.value = res.data?.list || []
    pagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  loadProducts(page)
}

// ═══ Create / Edit ═══
function openCreate() {
  editingProduct.value = null
  form.value = { name: '', price: null, level_id: null, days: 30, description: '', status: 1 }
  modalVisible.value = true
}

function openEdit(row: Product) {
  editingProduct.value = row
  form.value = {
    name: row.name,
    price: row.price ?? null,
    level_id: row.level_id ?? null,
    days: row.days,
    description: row.description || '',
    status: row.status,
  }
  modalVisible.value = true
}

async function saveProduct() {
  try {
    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value.id}`, form.value)
      message.success('产品更新成功')
    } else {
      await api.post('/products', form.value)
      message.success('产品创建成功')
    }
    modalVisible.value = false
    await loadProducts(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteProduct(row: Product) {
  try {
    await api.delete(`/products/${row.id}`)
    message.success('产品已删除')
    await loadProducts(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

onMounted(() => {
  loadLevels()
  loadProducts()
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">产品管理</h1>

    <!-- ═══ Products table ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="border border-white/10 bg-white/5">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-gray-400">共 {{ pagination.total }} 条</span>
        <n-button type="primary" @click="openCreate">新建产品</n-button>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>名称</th>
            <th>价格</th>
            <th>关联等级</th>
            <th>有效天数</th>
            <th>描述</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr v-for="p in products" :key="p.id" class="transition-colors hover:bg-white/5">
            <td class="text-gray-500">{{ p.id }}</td>
            <td class="font-medium text-white">{{ p.name }}</td>
            <td class="font-mono">¥{{ p.price }}</td>
            <td>
              <n-tag :bordered="false" size="small" type="info">
                {{ (p as any).level_name || (p as any).level?.name || '-' }}
              </n-tag>
            </td>
            <td>{{ p.days === -1 ? '永久' : `${p.days} 天` }}</td>
            <td class="max-w-[200px] truncate">{{ p.description || '-' }}</td>
            <td>
              <n-tag :type="p.status === 1 ? 'success' : 'default'" size="small">
                {{ p.status === 1 ? '启用' : '禁用' }}
              </n-tag>
            </td>
            <td>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="openEdit(p)">编辑</n-button>
                <n-popconfirm @positive-click="() => deleteProduct(p)" positive-text="确定" negative-text="取消">
                  <template #trigger>
                    <n-button text color="#f87171" size="small">删除</n-button>
                  </template>
                  确定删除产品「{{ p.name }}」吗？
                </n-popconfirm>
              </n-space>
            </td>
          </tr>
          <tr v-if="!loading && products.length === 0">
            <td colspan="8" class="py-8 text-center text-gray-500">暂无数据</td>
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

    <!-- ═══ Product modal ═══ -->
    <n-modal v-model:show="modalVisible" preset="card" title="产品信息" style="max-width:520px" :bordered="false">
      <n-form label-placement="left" label-width="80" size="medium">
        <n-form-item label="名称" required>
          <n-input v-model:value="form.name" placeholder="例如：季度会员、年度VIP" />
        </n-form-item>
        <n-form-item label="价格" required>
          <n-input-number v-model:value="form.price" placeholder="0.00" :precision="2" :min="0" class="w-full" />
        </n-form-item>
        <n-form-item label="关联等级" required>
          <n-select
            v-model:value="form.level_id"
            :options="levels.map((l: Level) => ({ label: l.name, value: l.id }))"
            placeholder="选择会员等级"
            clearable
          />
        </n-form-item>
        <n-form-item label="有效天数">
          <n-input-number v-model:value="form.days" placeholder="30" :min="-1" class="w-full" />
          <span class="text-xs text-gray-500">-1 表示永久有效</span>
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.description" type="textarea" placeholder="产品描述或备注" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="form.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveProduct">
            {{ editingProduct ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
