<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  NCheckboxGroup,
  NCheckbox,
  NAvatar,
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
interface SysUser {
  id: number
  username: string
  avatar?: string
  status: number
  created_at: string
}

interface Role {
  id: number
  name: string
  description?: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

// --- State ---
const loading = ref(false)
const saving = ref(false)
const users = ref<SysUser[]>([])
const pagination = reactive<Pagination>({ page: 1, pageSize: 10, total: 0 })
const showModal = ref(false)
const showRoleModal = ref(false)
const isEdit = ref(false)
const currentUser = ref<SysUser | null>(null)
const allRoles = ref<Role[]>([])
const assignedRoleIds = ref<number[]>([])

const form = reactive({
  username: '',
  password: '',
  status: 1,
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

// --- API ---
async function fetchUsers() {
  loading.value = true
  try {
    const res = (await api.get('/sys-users', {
      params: { page: pagination.page, pageSize: pagination.pageSize },
    })) as any
    if (res.code === 0) {
      users.value = res.data?.list ?? res.data ?? []
      pagination.total = res.data?.pagination?.total ?? 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function fetchAllRoles() {
  try {
    const res = (await api.get('/roles', { params: { pageSize: 999 } })) as any
    if (res.code === 0) {
      allRoles.value = res.data?.list ?? res.data ?? []
    }
  } catch {
    // handled by interceptor
  }
}

// --- Modal handlers ---
function openCreateModal() {
  isEdit.value = false
  currentUser.value = null
  form.username = ''
  form.password = ''
  form.status = 1
  showModal.value = true
}

function openEditModal(user: SysUser) {
  isEdit.value = true
  currentUser.value = user
  form.username = user.username
  form.password = ''
  form.status = user.status
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!form.username.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!isEdit.value && !form.password.trim()) {
    message.warning('请输入密码')
    return
  }

  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      username: form.username.trim(),
      status: form.status,
    }
    if (!isEdit.value) {
      payload.password = form.password
    }
    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    if (isEdit.value && currentUser.value) {
      const res = (await api.put(`/sys-users/${currentUser.value.id}`, payload)) as any
      if (res.code === 0) {
        message.success('更新成功')
      }
    } else {
      const res = (await api.post('/sys-users', payload)) as any
      if (res.code === 0) {
        message.success('创建成功')
      }
    }
    closeModal()
    await fetchUsers()
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(user: SysUser) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = (await api.delete(`/sys-users/${user.id}`)) as any
        if (res.code === 0) {
          message.success('删除成功')
          await fetchUsers()
        }
      } catch {
        // handled by interceptor
      }
    },
  })
}

// --- Role assignment ---
function openRoleModal(user: SysUser) {
  currentUser.value = user
  assignedRoleIds.value = []
  showRoleModal.value = true
  fetchUserRoles(user.id)
}

async function fetchUserRoles(userId: number) {
  try {
    const res = (await api.get(`/sys-users/${userId}/roles`)) as any
    if (res.code === 0) {
      assignedRoleIds.value = (res.data ?? []).map((r: Role) => r.id)
    }
  } catch {
    // handled by interceptor
  }
}

async function handleSaveRoles() {
  if (!currentUser.value) return
  saving.value = true
  try {
    const res = (await api.post(`/sys-users/${currentUser.value.id}/roles`, {
      role_ids: assignedRoleIds.value,
    })) as any
    if (res.code === 0) {
      message.success('角色分配成功')
      showRoleModal.value = false
    }
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

// --- Pagination ---
function onPageChange(page: number) {
  pagination.page = page
  fetchUsers()
}

function onPageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
  fetchAllRoles()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">后台用户管理</h1>
      <NButton type="primary" @click="openCreateModal">
        新增用户
      </NButton>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpin :show="loading">
        <NTable v-if="users.length > 0" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-left text-gray-400">ID</th>
              <th class="text-left text-gray-400">头像</th>
              <th class="text-left text-gray-400">用户名</th>
              <th class="text-left text-gray-400">状态</th>
              <th class="text-left text-gray-400">创建时间</th>
              <th class="text-left text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-t border-white/5">
              <td class="text-gray-300">{{ user.id }}</td>
              <td>
                <NAvatar :size="32" :src="user.avatar" round>
                  {{ user.username.charAt(0).toUpperCase() }}
                </NAvatar>
              </td>
              <td class="font-medium text-white">{{ user.username }}</td>
              <td>
                <NTag :type="user.status === 1 ? 'success' : 'default'" size="small">
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </NTag>
              </td>
              <td class="text-gray-400">{{ user.created_at }}</td>
              <td>
                <NSpace>
                  <NButton size="tiny" quaternary @click="openEditModal(user)">
                    编辑
                  </NButton>
                  <NButton size="tiny" quaternary type="info" @click="openRoleModal(user)">
                    分配角色
                  </NButton>
                  <NPopconfirm @positive-click="handleDelete(user)">
                    <template #trigger>
                      <NButton size="tiny" quaternary type="error">
                        删除
                      </NButton>
                    </template>
                    确定删除此用户？
                  </NPopconfirm>
                </NSpace>
              </td>
            </tr>
          </tbody>
        </NTable>
        <NEmpty v-else description="暂无数据" />
      </NSpin>

      <!-- Pagination -->
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
      :title="isEdit ? '编辑用户' : '新增用户'"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="用户名">
          <NInput v-model:value="form.username" placeholder="请输入用户名" />
        </NFormItem>
        <NFormItem label="密码">
          <NInput
            v-model:value="form.password"
            type="password"
            :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
          />
        </NFormItem>
        <NFormItem label="状态">
          <NSelect
            v-model:value="form.status"
            :options="statusOptions"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? '保存修改' : '创建用户' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- Assign Roles Modal -->
    <NModal
      v-model:show="showRoleModal"
      title="分配角色"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <div class="py-2">
        <p class="mb-3 text-sm text-gray-400">
          为用户 <span class="text-white font-medium">{{ currentUser?.username }}</span> 分配角色：
        </p>
        <NCheckboxGroup v-model:value="assignedRoleIds">
          <NSpace vertical>
            <NCheckbox
              v-for="role in allRoles"
              :key="role.id"
              :value="role.id"
            >
              <div>
                <span class="font-medium">{{ role.name }}</span>
                <span v-if="role.description" class="ml-2 text-xs text-gray-500">
                  ({{ role.description }})
                </span>
              </div>
            </NCheckbox>
          </NSpace>
        </NCheckboxGroup>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showRoleModal = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSaveRoles">
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
