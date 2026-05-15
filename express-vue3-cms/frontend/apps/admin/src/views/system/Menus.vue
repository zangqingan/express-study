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
  NSwitch,
  NPopconfirm,
  NSpin,
  NEmpty,
  NTreeSelect,
  NPagination,
  useMessage,
  useDialog,
  type TreeSelectOption,
} from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()

// --- Types ---
interface Menu {
  id: number
  parent_id: number | null
  name: string
  type: string
  permissions?: string
  icon?: string
  path?: string
  url?: string
  order_by: number
  status: number
  children?: Menu[]
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

const typeMap: Record<string, { label: string; tagType: string }> = {
  M: { label: '目录', tagType: 'default' },
  C: { label: '菜单', tagType: 'info' },
  F: { label: '按钮', tagType: 'warning' },
}

const typeOptions = [
  { label: '目录 (M)', value: 'M' },
  { label: '菜单 (C)', value: 'C' },
  { label: '按钮 (F)', value: 'F' },
]

// --- State ---
const loading = ref(false)
const saving = ref(false)
const menus = ref<Menu[]>([])
const flatMenus = ref<Menu[]>([]) // flattened list for table display
const pagination = reactive<Pagination>({ page: 1, pageSize: 50, total: 0 })
const showModal = ref(false)
const isEdit = ref(false)
const currentMenu = ref<Menu | null>(null)
const parentTree = ref<TreeSelectOption[]>([])

const form = reactive({
  parent_id: null as number | null,
  type: 'M' as string,
  name: '',
  permissions: '',
  path: '',
  icon: '',
  order_by: 0,
  status: 1,
})

// --- API ---
async function fetchMenus() {
  loading.value = true
  try {
    const res = (await api.get('/menus', {
      params: { page: pagination.page, pageSize: pagination.pageSize },
    })) as any
    if (res.code === 0) {
      menus.value = res.data?.list ?? res.data ?? []
      flatMenus.value = flattenForTable(menus.value)
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
      parentTree.value = buildTreeSelectOptions(res.data ?? [])
    }
  } catch {
    // handled by interceptor
  }
}

// --- Helpers ---
function flattenForTable(items: Menu[], depth = 0): Menu[] {
  const result: Menu[] = []
  for (const item of items) {
    result.push({ ...item, name: '　'.repeat(depth) + (depth > 0 ? '└ ' : '') + item.name } as Menu)
    if (item.children && item.children.length > 0) {
      result.push(...flattenForTable(item.children, depth + 1))
    }
  }
  return result
}

function buildTreeSelectOptions(nodes: Menu[]): TreeSelectOption[] {
  return nodes.map((node) => ({
    label: node.name,
    key: node.id,
    children: node.children && node.children.length > 0
      ? buildTreeSelectOptions(node.children)
      : undefined,
  }))
}

// --- Modal handlers ---
function openCreateModal() {
  isEdit.value = false
  currentMenu.value = null
  form.parent_id = null
  form.type = 'M'
  form.name = ''
  form.permissions = ''
  form.path = ''
  form.icon = ''
  form.order_by = 0
  form.status = 1
  showModal.value = true
}

function openEditModal(menu: Menu) {
  isEdit.value = true
  currentMenu.value = menu
  form.parent_id = menu.parent_id
  form.type = menu.type
  form.name = menu.name
  form.permissions = menu.permissions ?? ''
  form.path = menu.path ?? menu.url ?? ''
  form.icon = menu.icon ?? ''
  form.order_by = menu.order_by
  form.status = menu.status
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!form.name.trim()) {
    message.warning('请输入菜单名称')
    return
  }

  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      type: form.type,
      parent_id: form.parent_id,
      order_by: Number(form.order_by) || 0,
      status: form.status ? 1 : 0,
    }

    if (form.path.trim()) {
      payload.path = form.path.trim()
    }
    if (form.icon.trim()) {
      payload.icon = form.icon.trim()
    }
    if (form.type === 'F' && form.permissions.trim()) {
      payload.permissions = form.permissions.trim()
    }

    if (isEdit.value && currentMenu.value) {
      const res = (await api.put(`/menus/${currentMenu.value.id}`, payload)) as any
      if (res.code === 0) {
        message.success('更新成功')
      }
    } else {
      const res = (await api.post('/menus', payload)) as any
      if (res.code === 0) {
        message.success('创建成功')
      }
    }
    closeModal()
    await Promise.all([fetchMenus(), fetchMenuTree()])
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

async function handleDelete(menu: Menu) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除菜单 "${menu.name}" 吗？如有子菜单将一并删除，此操作不可撤销。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = (await api.delete(`/menus/${menu.id}`)) as any
        if (res.code === 0) {
          message.success('删除成功')
          await Promise.all([fetchMenus(), fetchMenuTree()])
        }
      } catch {
        // handled by interceptor
      }
    },
  })
}

// --- Pagination ---
function onPageChange(page: number) {
  pagination.page = page
  fetchMenus()
}

function onPageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  fetchMenus()
}

onMounted(() => {
  fetchMenus()
  fetchMenuTree()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">菜单管理</h1>
      <NButton type="primary" @click="openCreateModal">
        新增菜单
      </NButton>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <NSpin :show="loading">
        <NTable v-if="flatMenus.length > 0" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-left text-gray-400">ID</th>
              <th class="text-left text-gray-400">菜单名称</th>
              <th class="text-left text-gray-400">类型</th>
              <th class="text-left text-gray-400">权限标识</th>
              <th class="text-left text-gray-400">图标</th>
              <th class="text-left text-gray-400">路径/URL</th>
              <th class="text-left text-gray-400">排序</th>
              <th class="text-left text-gray-400">状态</th>
              <th class="text-left text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="menu in flatMenus" :key="menu.id" class="border-t border-white/5">
              <td class="text-gray-300">{{ menu.id }}</td>
              <td class="font-medium text-white">{{ menu.name }}</td>
              <td>
                <NTag :type="typeMap[menu.type]?.tagType as any ?? 'default'" size="small">
                  {{ typeMap[menu.type]?.label ?? menu.type }}
                </NTag>
              </td>
              <td>
                <code v-if="menu.permissions" class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-blue-400">
                  {{ menu.permissions }}
                </code>
                <span v-else class="text-gray-500">-</span>
              </td>
              <td class="text-gray-400">{{ menu.icon || '-' }}</td>
              <td class="text-gray-400">{{ menu.path || menu.url || '-' }}</td>
              <td class="text-gray-300">{{ menu.order_by }}</td>
              <td>
                <NTag :type="menu.status === 1 ? 'success' : 'default'" size="small">
                  {{ menu.status === 1 ? '启用' : '禁用' }}
                </NTag>
              </td>
              <td>
                <NSpace>
                  <NButton size="tiny" quaternary @click="openEditModal(menu)">
                    编辑
                  </NButton>
                  <NPopconfirm @positive-click="handleDelete(menu)">
                    <template #trigger>
                      <NButton size="tiny" quaternary type="error">
                        删除
                      </NButton>
                    </template>
                    确定删除此菜单？
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
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
          @update:page="onPageChange"
          @update:page-size="onPageSizeChange"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <NModal
      v-model:show="showModal"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      preset="card"
      style="width: 560px"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="上级菜单">
          <NTreeSelect
            v-model:value="form.parent_id"
            :options="parentTree"
            placeholder="无（顶级菜单）"
            clearable
            check-strategy="child"
          />
        </NFormItem>
        <NFormItem label="类型">
          <NSelect
            v-model:value="form.type"
            :options="typeOptions"
          />
        </NFormItem>
        <NFormItem label="菜单名称">
          <NInput v-model:value="form.name" placeholder="请输入菜单名称" />
        </NFormItem>
        <NFormItem v-if="form.type === 'F'" label="权限标识">
          <NInput v-model:value="form.permissions" placeholder="例如: cms:article:edit" />
        </NFormItem>
        <NFormItem label="路径/URL">
          <NInput v-model:value="form.path" placeholder="请输入路由路径或URL" />
        </NFormItem>
        <NFormItem label="图标">
          <NInput v-model:value="form.icon" placeholder="例如: dashboard" />
        </NFormItem>
        <NFormItem label="排序">
          <NInput v-model:value="form.order_by" placeholder="数字越小越靠前" />
        </NFormItem>
        <NFormItem label="状态">
          <NSwitch v-model:value="form.status" :unchecked-value="0" :checked-value="1" />
          <span class="ml-2 text-sm text-gray-400">
            {{ form.status === 1 ? '启用' : '禁用' }}
          </span>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ isEdit ? '保存修改' : '创建菜单' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
