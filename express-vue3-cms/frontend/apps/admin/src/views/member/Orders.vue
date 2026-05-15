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
  NDescriptions,
  NDescriptionsItem,
  useMessage,
} from 'naive-ui'
import api from '@/api'

interface Order {
  id: number
  order_no: string
  username: string
  user_id?: number
  product_name: string
  product_id?: number
  amount: number
  status: number
  remark?: string
  created_at: string
  updated_at?: string
  paid_at?: string
  product?: { name: string }
  user?: { username: string }
}

const message = useMessage()

// ─── State ───
const orders = ref<Order[]>([])
const pagination = ref({ total: 0, page: 1, pageSize: 10 })
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref<number | null>(null)

// ─── Detail modal ───
const detailModalVisible = ref(false)
const viewingOrder = ref<Order | null>(null)

const statusFilterOptions = [
  { label: '全部', value: null as unknown as number },
  { label: '待支付', value: 0 },
  { label: '已完成', value: 1 },
  { label: '已退款', value: 2 },
]

const statusLabels: Record<number, string> = {
  0: '待支付',
  1: '已完成',
  2: '已退款',
}

function getStatusType(status: number) {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  return 'info'
}

// ═══ Load orders ═══
async function loadOrders(page = 1) {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page,
      pageSize: pagination.value.pageSize,
    }
    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    if (statusFilter.value !== null && statusFilter.value !== undefined) {
      params.status = statusFilter.value
    }
    const res: any = await api.get('/orders', { params })
    orders.value = res.data?.list || []
    pagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  loadOrders(page)
}

function handleSearch() {
  pagination.value.page = 1
  loadOrders()
}

// ═══ View detail ═══
async function viewDetail(row: Order) {
  try {
    const res: any = await api.get(`/orders/${row.id}`)
    viewingOrder.value = res.data || row
    detailModalVisible.value = true
  } catch {
    viewingOrder.value = row
    detailModalVisible.value = true
  }
}

// ═══ Refund ═══
async function refundOrder(row: Order) {
  try {
    await api.patch(`/orders/${row.id}/refund`)
    message.success('退款成功')
    await loadOrders(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

function formatPrice(amount: number) {
  return amount.toFixed(2)
}

onMounted(() => loadOrders())
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">订单管理</h1>

    <!-- ═══ Search bar ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="mb-6 border border-white/10 bg-white/5">
      <div class="flex flex-wrap items-center gap-3">
        <n-input
          v-model:value="keyword"
          placeholder="搜索订单号"
          clearable
          class="w-60"
          @keydown.enter="handleSearch"
        />
        <n-select
          v-model:value="statusFilter"
          :options="statusFilterOptions"
          placeholder="订单状态"
          clearable
          class="w-36"
          @update:value="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>
    </n-card>

    <!-- ═══ Orders table ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="border border-white/10 bg-white/5">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-gray-400">共 {{ pagination.total }} 条</span>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>订单号</th>
            <th>会员</th>
            <th>产品</th>
            <th>金额</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr v-for="o in orders" :key="o.id" class="transition-colors hover:bg-white/5">
            <td class="text-gray-500">{{ o.id }}</td>
            <td class="font-mono text-xs text-white">{{ o.order_no }}</td>
            <td>{{ o.username || (o.user as any)?.username || '-' }}</td>
            <td>{{ o.product_name || (o.product as any)?.name || '-' }}</td>
            <td class="font-mono">¥{{ formatPrice(o.amount) }}</td>
            <td>
              <n-tag :type="getStatusType(o.status)" :bordered="false" size="small">
                {{ statusLabels[o.status] || '未知' }}
              </n-tag>
            </td>
            <td class="text-gray-500">{{ formatDate(o.created_at) }}</td>
            <td>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="viewDetail(o)">详情</n-button>
                <n-popconfirm
                  v-if="o.status === 1"
                  @positive-click="() => refundOrder(o)"
                  positive-text="确定退款"
                  negative-text="取消"
                >
                  <template #trigger>
                    <n-button text color="#fbbf24" size="small">退款</n-button>
                  </template>
                  确定对此订单退款 ¥{{ formatPrice(o.amount) }} 吗？
                </n-popconfirm>
              </n-space>
            </td>
          </tr>
          <tr v-if="!loading && orders.length === 0">
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

    <!-- ═══ Detail modal ═══ -->
    <n-modal v-model:show="detailModalVisible" preset="card" title="订单详情" style="max-width:600px" :bordered="false">
      <div v-if="viewingOrder" class="space-y-4">
        <n-descriptions :bordered="false" :column="2" label-placement="left" size="small">
          <n-descriptions-item label="订单ID">{{ viewingOrder.id }}</n-descriptions-item>
          <n-descriptions-item label="订单号">
            <span class="font-mono text-xs">{{ viewingOrder.order_no }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="会员">
            {{ viewingOrder.username || (viewingOrder.user as any)?.username || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="产品">
            {{ viewingOrder.product_name || (viewingOrder.product as any)?.name || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="金额">
            <span class="font-mono font-semibold text-blue-400">¥{{ formatPrice(viewingOrder.amount) }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusType(viewingOrder.status)" size="small">
              {{ statusLabels[viewingOrder.status] || '未知' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="备注">
            {{ viewingOrder.remark || '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDate(viewingOrder.created_at) }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间" v-if="viewingOrder.updated_at">
            {{ formatDate(viewingOrder.updated_at!) }}
          </n-descriptions-item>
          <n-descriptions-item label="支付时间" v-if="(viewingOrder as any).paid_at">
            {{ formatDate((viewingOrder as any).paid_at) }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="detailModalVisible = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
