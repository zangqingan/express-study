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
  NAvatar,
  NCard,
  useMessage,
} from 'naive-ui'
import api from '@/api'

interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: number
  created_at: string
}

const message = useMessage()

// ─── State ───
const users = ref<User[]>([])
const pagination = ref({ total: 0, page: 1, pageSize: 10 })
const loading = ref(false)
const keyword = ref('')

// ─── Edit modal ───
const editModalVisible = ref(false)
const editingUser = ref<User | null>(null)
const editForm = ref({
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  status: 1,
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

// ═══ Load users ═══
async function loadUsers(page = 1) {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page,
      pageSize: pagination.value.pageSize,
    }
    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim()
    }
    const res: any = await api.get('/users', { params })
    users.value = res.data?.list || []
    pagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  loadUsers(page)
}

function handleSearch() {
  pagination.value.page = 1
  loadUsers()
}

// ═══ Edit user ═══
function openEdit(row: User) {
  editingUser.value = row
  editForm.value = {
    nickname: row.nickname || '',
    email: row.email || '',
    phone: row.phone || '',
    avatar: row.avatar || '',
    status: row.status,
  }
  editModalVisible.value = true
}

async function saveUser() {
  if (!editingUser.value) return
  try {
    await api.put(`/users/${editingUser.value.id}`, editForm.value)
    message.success('用户信息更新成功')
    editModalVisible.value = false
    await loadUsers(pagination.value.page)
  } catch {
    // handled by interceptor
  }
}

// ═══ Toggle status ═══
async function toggleStatus(row: User) {
  const newStatus = row.status === 1 ? 0 : 1
  const actionLabel = newStatus === 1 ? '启用' : '禁用'
  try {
    await api.patch(`/users/${row.id}/status`, { status: newStatus })
    row.status = newStatus
    message.success(`用户已${actionLabel}`)
  } catch {
    // handled by interceptor
  }
}

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}

onMounted(() => loadUsers())
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">会员列表</h1>

    <!-- ═══ Search bar ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="mb-6 border border-white/10 bg-white/5">
      <div class="flex items-center gap-3">
        <n-input
          v-model:value="keyword"
          placeholder="搜索用户名 / 手机号 / 邮箱"
          clearable
          class="w-80"
          @keydown.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>
    </n-card>

    <!-- ═══ Users table ═══ -->
    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="border border-white/10 bg-white/5">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-gray-400">共 {{ pagination.total }} 条</span>
      </div>
      <n-table :bordered="false" :single-line="false" size="small">
        <thead>
          <tr class="text-left text-xs text-gray-400">
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>邮箱</th>
            <th>手机号</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-300">
          <tr v-for="u in users" :key="u.id" class="transition-colors hover:bg-white/5">
            <td class="text-gray-500">{{ u.id }}</td>
            <td>
              <n-avatar
                :src="u.avatar"
                :fallback-src="`https://ui-avatars.com/api/?name=${encodeURIComponent(u.nickname || u.username)}&background=random`"
                size="small"
              />
            </td>
            <td class="font-medium text-white">{{ u.username }}</td>
            <td>{{ u.nickname || '-' }}</td>
            <td class="text-gray-400">{{ u.email || '-' }}</td>
            <td>{{ u.phone || '-' }}</td>
            <td>
              <n-tag :type="u.status === 1 ? 'success' : 'default'" size="small">
                {{ u.status === 1 ? '正常' : '禁用' }}
              </n-tag>
            </td>
            <td class="text-gray-500">{{ formatDate(u.created_at) }}</td>
            <td>
              <n-space>
                <n-button text color="#60a5fa" size="small" @click="openEdit(u)">编辑</n-button>
                <n-button
                  text
                  :color="u.status === 1 ? '#f87171' : '#34d399'"
                  size="small"
                  @click="toggleStatus(u)"
                >
                  {{ u.status === 1 ? '禁用' : '启用' }}
                </n-button>
              </n-space>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="9" class="py-8 text-center text-gray-500">暂无数据</td>
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

    <!-- ═══ Edit modal ═══ -->
    <n-modal v-model:show="editModalVisible" preset="card" title="编辑会员" style="max-width:520px" :bordered="false">
      <n-form label-placement="left" label-width="80" size="medium">
        <n-form-item label="昵称">
          <n-input v-model:value="editForm.nickname" placeholder="用户昵称" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="editForm.email" placeholder="邮箱地址" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="editForm.phone" placeholder="手机号码" />
        </n-form-item>
        <n-form-item label="头像URL">
          <n-input v-model:value="editForm.avatar" placeholder="头像图片地址" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="editForm.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="editModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveUser">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
