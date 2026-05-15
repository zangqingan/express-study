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
  NTransfer,
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
interface Role {
  id: number
  name: string
  description?: string
  created_at: string
}

interface MenuNode {
  key: number
  label: string
  children?: MenuNode[]
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

// --- State ---
const loading = ref(false)
const saving = ref(false)
const roles = ref<Role[]>([])
const pagination = reactive<Pagination>({ page: 1, pageSize: 10, total: 0 })
const showModal = ref(false)
const showMenuModal = ref(false)
const isEdit = ref(false)
const currentRole = ref<Role | null>(null)

const form = reactive({
  name: '',
  description: '',
})

// Menu transfer
const menuTree = ref<MenuNode[]>([])
const assignedMenuIds = ref<number[]>([])
const allMenuIds = ref<{ value: number; label: string }[]>([])

// --- Flatten tree for NTransfer options ---
function flattenTree(nodes: MenuNode[], prefix = ''): { value: number; label: string }[] {
  const result: { value: number; label: string }[] = []
  for (const node of nodes) {
    const label = prefix ? `${prefix} / ${node.label}` : node.label
    result.push({ value: node.key, label })
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, label))
    }
  }
  return result
}

// --- API ---
async function fetchRoles() {
  loading.value = true
  try {
    const res = (await api.get('/roles', {
      params: { page: pagination.page, pageSize: pagination.pageSize },
    })) as any
    if (res.code === 0) {
      roles.value = res.data?.list ?? res.data ?? []
      pagination.total = res.data?.pagination?.total ?? 0
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function fetchMenuTree() {
  try {
    const res = (await api.get('/menus/tree')) as any
    if (res.code === 0) {
      menuTree.value = res.data ?? []
      allMenuIds.value = flattenTree(menuTree.value)
    }
  } catch {
    // handled by interceptor
  }
}

// --- Modal handlers ---
function openCreateModal() {
  isEdit.value = false
  currentRole.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(role: Role) {
  isEdit.value = true
  currentRole.value = role
  form.name = role.name
  form.description = role.description ?? ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!form.name.trim()) {
    message.warning('请输入角色名称')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    }

    if (isEdit.value && currentRole.value) {
      const res = (await api.put(`/roles/${currentRole.value.id}`, payload)) as any
      if (res.code === 0) {
        message.success('更新成功')
      }
    } else {
      const res = (await api.post('/roles', payload)) as any
      if (res.code === 0) {
        message.success('创建成功')
      }
    }
    closeModal()
    await fetchRoles()
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(role: Role) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除角色 "${role.name}" 吗？此操作不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = (await api.delete(`/roles/${role.id}`)) as any
        if (res.code === 0) {
          message.success('删除成功')
          await fetchRoles()
        }
      } catch {
        // handled by interceptor
      }
    },
  })
}

// --- Menu assignment ---
function openMenuModal(role: Role) {
  currentRole.value = role
  assignedMenuIds.value = []
  showMenuModal.value = true
  fetchRoleMenus(role.id)
}

async function fetchRoleMenus(roleId: number) {
  try {
    const res = (await api.get(`/roles/${roleId}`, { params: { include: 'menus' } })) as any
    if (res.code === 0) {
      const menus = res.data?.menus ?? []
      assignedMenuIds.value = menus.map((m: { id: number }) => m.id)
    }
  } catch {
    // handled by interceptor
  }
}

async function handleSaveMenus() {
  if (!currentRole.value) return
  saving.value = true
  try {
    const res = (await api.post(`/roles/${currentRole.value.id}/menus`, {
      menu_ids: assignedMenuIds.value,
    })) as any
    if (res.code === 0) {
      message.success('权限分配成功')
      showMenuModal.value = false
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
  fetchRoles()
}

function onPageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  fetchRoles()
}

onMounted(() => {
  fetchRoles()
  fetchMenuTree()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">角色管理</h1>
      <NButton type="primary" @click="openCreateModal">
        新增角色
      </NButton>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpin :show="loading">
        <NTable v-if="roles.length > 0" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-left text-gray-400">ID</th>
              <th class="text-left text-gray-400">角色名称</th>
              <th class="text-left text-gray-400">描述</th>
              <th class="text-left text-gray-400">创建时间</th>
              <th class="text-left text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id" class="border-t border-white/5">
              <td class="text-gray-300">{{ role.id }}</td>
              <td class="font-medium text-white">{{ role.name }}</td>
              <td class="text-gray-400">{{ role.description || '-' }}</td>
              <td class="text-gray-400">{{ role.created_at }}</td>
              <td>
                <NSpace>
                  <NButton size="tiny" quaternary @click="openEditModal(role)">
                    编辑
                  </NButton>
                  <NButton size="tiny" quaternary type="info" @click="openMenuModal(role)">
                    分配权限
                  </NButton>
                  <NPopconfirm @positive-click="handleDelete(role)">
                    <template #trigger>
                      <NButton size="tiny" quaternary type="error">
                        删除
                      </NButton>
                    </template>
                    确定删除此角色？
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
      :title="isEdit ? '编辑角色' : '新增角色'"
      preset="card"
      style="width: 480px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="80">
        <NFormItem label="角色名称">
          <NInput v-model:value="form.name" placeholder="请输入角色名称" />
        </NFormItem>
        <NFormItem label="描述">
          <NInput
            v-model:value="form.description"
            type="textarea"
            placeholder="请输入角色描述"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? '保存修改' : '创建角色' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- Assign Menus Modal (NTransfer) -->
    <NModal
      v-model:show="showMenuModal"
      title="分配权限"
      preset="card"
      style="width: 720px"
      :mask-closable="false"
    >
      <div class="py-2">
        <p class="mb-3 text-sm text-gray-400">
          为角色 <span class="text-white font-medium">{{ currentRole?.name }}</span> 分配菜单权限：
        </p>
        <NTransfer
          v-model:value="assignedMenuIds"
          :options="allMenuIds"
          source-title="可选菜单"
          target-title="已分配菜单"
          filterable
        />
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showMenuModal = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSaveMenus">
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
