<script setup lang="ts">
import { ref, onMounted, h, type Component } from 'vue'
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
  NTabs,
  NTabPane,
  useMessage,
} from 'naive-ui'
import api from '@/api'

interface Collect {
  id: number
  title: string
  url?: string
  api_url?: string
  cid: number
  category_name?: string
  status: number
  created_at: string
  list_rule?: string
  content_rule?: string
  page_rule?: string
  encoding?: string
  parse_data?: string
}

interface Category {
  id: number
  name: string
}

const message = useMessage()

// ─── Tabs ───
const activeTab = ref<'page' | 'gather'>('page')

// ─── Page Collect state ───
const collects = ref<Collect[]>([])
const collectPagination = ref({ total: 0, page: 1, pageSize: 10 })
const collectLoading = ref(false)
const collectModalVisible = ref(false)
const editingCollect = ref<Collect | null>(null)
const collectForm = ref({
  cid: null as number | null,
  title: '',
  url: '',
  list_rule: '',
  content_rule: '',
  page_rule: '',
  encoding: 'utf-8',
  parse_data: '',
  status: 1,
})

// ─── Gather Collect state ───
const gathers = ref<Collect[]>([])
const gatherPagination = ref({ total: 0, page: 1, pageSize: 10 })
const gatherLoading = ref(false)
const gatherModalVisible = ref(false)
const editingGather = ref<Collect | null>(null)
const gatherForm = ref({
  cid: null as number | null,
  title: '',
  api_url: '',
  list_rule: '',
  content_rule: '',
  page_rule: '',
  encoding: 'utf-8',
  parse_data: '',
  status: 1,
})

// ─── Categories ───
const categories = ref<Category[]>([])

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

const encodingOptions = [
  { label: 'UTF-8', value: 'utf-8' },
  { label: 'GBK', value: 'gbk' },
  { label: 'GB2312', value: 'gb2312' },
]

// ═══ Load categories for select ═══
async function loadCategories() {
  try {
    const res: any = await api.get('/categories', { params: { pageSize: 1000 } })
    categories.value = res.data?.list || []
  } catch {
    // non-critical
  }
}

// ═══ Page Collects CRUD ═══
async function loadCollects(page = 1) {
  collectLoading.value = true
  try {
    const res: any = await api.get('/collects', {
      params: { page, pageSize: collectPagination.value.pageSize },
    })
    collects.value = res.data?.list || []
    collectPagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    collectLoading.value = false
  }
}

function openCreateCollect() {
  editingCollect.value = null
  collectForm.value = {
    cid: null,
    title: '',
    url: '',
    list_rule: '',
    content_rule: '',
    page_rule: '',
    encoding: 'utf-8',
    parse_data: '',
    status: 1,
  }
  collectModalVisible.value = true
}

function openEditCollect(row: Collect) {
  editingCollect.value = row
  collectForm.value = {
    cid: row.cid ?? null,
    title: row.title,
    url: row.url || '',
    list_rule: row.list_rule || '',
    content_rule: row.content_rule || '',
    page_rule: row.page_rule || '',
    encoding: row.encoding || 'utf-8',
    parse_data: row.parse_data || '',
    status: row.status,
  }
  collectModalVisible.value = true
}

async function saveCollect() {
  try {
    if (editingCollect.value) {
      await api.put(`/collects/${editingCollect.value.id}`, collectForm.value)
      message.success('采集规则更新成功')
    } else {
      await api.post('/collects', collectForm.value)
      message.success('采集规则创建成功')
    }
    collectModalVisible.value = false
    await loadCollects(collectPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteCollect(row: Collect) {
  try {
    await api.delete(`/collects/${row.id}`)
    message.success('采集规则已删除')
    await loadCollects(collectPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function executeCollect(row: Collect) {
  const tid = row.id
  const loadingMsg = message.loading('正在执行采集...', { duration: 0 })
  try {
    await api.post(`/collects/${tid}/execute`)
    loadingMsg.destroy()
    message.success('采集执行成功')
    await loadCollects(collectPagination.value.page)
  } catch {
    loadingMsg.destroy()
    // handled by interceptor
  }
}

function handleCollectPageChange(page: number) {
  loadCollects(page)
}

// ═══ Gather Collects CRUD ═══
async function loadGathers(page = 1) {
  gatherLoading.value = true
  try {
    const res: any = await api.get('/collects/gather', {
      params: { page, pageSize: gatherPagination.value.pageSize },
    })
    gathers.value = res.data?.list || []
    gatherPagination.value = res.data?.pagination || { total: 0, page: 1, pageSize: 10 }
  } catch {
    // handled by interceptor
  } finally {
    gatherLoading.value = false
  }
}

function openCreateGather() {
  editingGather.value = null
  gatherForm.value = {
    cid: null,
    title: '',
    api_url: '',
    list_rule: '',
    content_rule: '',
    page_rule: '',
    encoding: 'utf-8',
    parse_data: '',
    status: 1,
  }
  gatherModalVisible.value = true
}

function openEditGather(row: Collect) {
  editingGather.value = row
  gatherForm.value = {
    cid: row.cid ?? null,
    title: row.title,
    api_url: row.api_url || '',
    list_rule: row.list_rule || '',
    content_rule: row.content_rule || '',
    page_rule: row.page_rule || '',
    encoding: row.encoding || 'utf-8',
    parse_data: row.parse_data || '',
    status: row.status,
  }
  gatherModalVisible.value = true
}

async function saveGather() {
  try {
    if (editingGather.value) {
      await api.put(`/collects/gather/${editingGather.value.id}`, gatherForm.value)
      message.success('接口采集规则更新成功')
    } else {
      await api.post('/collects/gather', gatherForm.value)
      message.success('接口采集规则创建成功')
    }
    gatherModalVisible.value = false
    await loadGathers(gatherPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function deleteGather(row: Collect) {
  try {
    await api.delete(`/collects/gather/${row.id}`)
    message.success('接口采集规则已删除')
    await loadGathers(gatherPagination.value.page)
  } catch {
    // handled by interceptor
  }
}

async function executeGather(row: Collect) {
  const loadingMsg = message.loading('正在执行接口采集...', { duration: 0 })
  try {
    await api.post(`/collects/gather/${row.id}/execute`)
    loadingMsg.destroy()
    message.success('接口采集执行成功')
    await loadGathers(gatherPagination.value.page)
  } catch {
    loadingMsg.destroy()
    // handled by interceptor
  }
}

function handleGatherPageChange(page: number) {
  loadGathers(page)
}

function handleTabChange(tab: 'page' | 'gather') {
  activeTab.value = tab
  if (tab === 'page') {
    loadCollects()
  } else {
    loadGathers()
  }
}

onMounted(() => {
  loadCategories()
  loadCollects()
})

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN')
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-white">采集管理</h1>

    <n-card :bordered="true" style="border-color: rgba(255,255,255,0.1)" class="border border-white/10 bg-white/5">
      <n-tabs
        type="bar"
        :value="activeTab"
        @update:value="(val: string) => handleTabChange(val as 'page' | 'gather')"
      >
        <!-- ═══ PAGE COLLECT TAB ═══ -->
        <n-tab-pane name="page" tab="页面采集">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm text-gray-400">共 {{ collectPagination.total }} 条</span>
            <n-button type="primary" @click="openCreateCollect">新建采集规则</n-button>
          </div>
          <n-table :bordered="false" :single-line="false" size="small">
            <thead>
              <tr class="text-left text-xs text-gray-400">
                <th>ID</th>
                <th>标题</th>
                <th>目标URL</th>
                <th>所属栏目</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-300">
              <tr v-for="c in collects" :key="c.id" class="transition-colors hover:bg-white/5">
                <td class="text-gray-500">{{ c.id }}</td>
                <td class="font-medium text-white">{{ c.title }}</td>
                <td class="max-w-[200px] truncate font-mono text-xs text-gray-400" :title="c.url">{{ c.url || '-' }}</td>
                <td>{{ (c as any).category_name || '-' }}</td>
                <td>
                  <n-tag :type="c.status === 1 ? 'success' : 'default'" size="small">
                    {{ c.status === 1 ? '启用' : '禁用' }}
                  </n-tag>
                </td>
                <td class="text-gray-500">{{ formatDate(c.created_at) }}</td>
                <td>
                  <n-space>
                    <n-button text color="#60a5fa" size="small" @click="openEditCollect(c)">编辑</n-button>
                    <n-button text color="#34d399" size="small" @click="executeCollect(c)">执行</n-button>
                    <n-popconfirm @positive-click="() => deleteCollect(c)" positive-text="确定" negative-text="取消">
                      <template #trigger>
                        <n-button text color="#f87171" size="small">删除</n-button>
                      </template>
                      确定删除采集规则「{{ c.title }}」吗？
                    </n-popconfirm>
                  </n-space>
                </td>
              </tr>
              <tr v-if="!collectLoading && collects.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            </tbody>
          </n-table>
          <div v-if="collectPagination.total > collectPagination.pageSize" class="mt-4 flex justify-center">
            <n-space>
              <n-button text size="small" :disabled="collectPagination.page <= 1" @click="handleCollectPageChange(collectPagination.page - 1)">上一页</n-button>
              <span class="text-sm text-gray-400">
                第 {{ collectPagination.page }} / {{ Math.ceil(collectPagination.total / collectPagination.pageSize) }} 页
              </span>
              <n-button text size="small" :disabled="collectPagination.page >= Math.ceil(collectPagination.total / collectPagination.pageSize)" @click="handleCollectPageChange(collectPagination.page + 1)">下一页</n-button>
            </n-space>
          </div>
        </n-tab-pane>

        <!-- ═══ GATHER TAB ═══ -->
        <n-tab-pane name="gather" tab="接口采集">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm text-gray-400">共 {{ gatherPagination.total }} 条</span>
            <n-button type="primary" @click="openCreateGather">新建接口采集</n-button>
          </div>
          <n-table :bordered="false" :single-line="false" size="small">
            <thead>
              <tr class="text-left text-xs text-gray-400">
                <th>ID</th>
                <th>标题</th>
                <th>API地址</th>
                <th>所属栏目</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-300">
              <tr v-for="g in gathers" :key="g.id" class="transition-colors hover:bg-white/5">
                <td class="text-gray-500">{{ g.id }}</td>
                <td class="font-medium text-white">{{ g.title }}</td>
                <td class="max-w-[200px] truncate font-mono text-xs text-gray-400" :title="g.api_url">{{ g.api_url || '-' }}</td>
                <td>{{ (g as any).category_name || '-' }}</td>
                <td>
                  <n-tag :type="g.status === 1 ? 'success' : 'default'" size="small">
                    {{ g.status === 1 ? '启用' : '禁用' }}
                  </n-tag>
                </td>
                <td class="text-gray-500">{{ formatDate(g.created_at) }}</td>
                <td>
                  <n-space>
                    <n-button text color="#60a5fa" size="small" @click="openEditGather(g)">编辑</n-button>
                    <n-button text color="#34d399" size="small" @click="executeGather(g)">执行</n-button>
                    <n-popconfirm @positive-click="() => deleteGather(g)" positive-text="确定" negative-text="取消">
                      <template #trigger>
                        <n-button text color="#f87171" size="small">删除</n-button>
                      </template>
                      确定删除接口采集「{{ g.title }}」吗？
                    </n-popconfirm>
                  </n-space>
                </td>
              </tr>
              <tr v-if="!gatherLoading && gathers.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            </tbody>
          </n-table>
          <div v-if="gatherPagination.total > gatherPagination.pageSize" class="mt-4 flex justify-center">
            <n-space>
              <n-button text size="small" :disabled="gatherPagination.page <= 1" @click="handleGatherPageChange(gatherPagination.page - 1)">上一页</n-button>
              <span class="text-sm text-gray-400">
                第 {{ gatherPagination.page }} / {{ Math.ceil(gatherPagination.total / gatherPagination.pageSize) }} 页
              </span>
              <n-button text size="small" :disabled="gatherPagination.page >= Math.ceil(gatherPagination.total / gatherPagination.pageSize)" @click="handleGatherPageChange(gatherPagination.page + 1)">下一页</n-button>
            </n-space>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- ═══ PAGE COLLECT MODAL ═══ -->
    <n-modal v-model:show="collectModalVisible" preset="card" title="页面采集规则" style="max-width:640px" :bordered="false">
      <n-form label-placement="left" label-width="100" size="medium">
        <n-form-item label="所属栏目" required>
          <n-select
            v-model:value="collectForm.cid"
            :options="categories.map((c: Category) => ({ label: c.name, value: c.id }))"
            placeholder="选择栏目"
            clearable
          />
        </n-form-item>
        <n-form-item label="标题" required>
          <n-input v-model:value="collectForm.title" placeholder="采集任务名称" />
        </n-form-item>
        <n-form-item label="目标URL" required>
          <n-input v-model:value="collectForm.url" placeholder="https://example.com/list" />
        </n-form-item>
        <n-form-item label="列表规则">
          <n-input v-model:value="collectForm.list_rule" placeholder="CSS 选择器，例如 ul.list li a" />
          <span class="text-xs text-gray-500">用于提取列表页每篇文章的链接</span>
        </n-form-item>
        <n-form-item label="内容规则">
          <n-input v-model:value="collectForm.content_rule" placeholder="CSS 选择器，例如 div.content" />
          <span class="text-xs text-gray-500">用于提取文章正文内容区域</span>
        </n-form-item>
        <n-form-item label="分页规则">
          <n-input v-model:value="collectForm.page_rule" placeholder="CSS 选择器，例如 div.pagination a.next" />
          <span class="text-xs text-gray-500">用于提取下一页链接</span>
        </n-form-item>
        <n-form-item label="编码">
          <n-select v-model:value="collectForm.encoding" :options="encodingOptions" />
        </n-form-item>
        <n-form-item label="解析脚本">
          <n-input
            v-model:value="collectForm.parse_data"
            type="textarea"
            placeholder="async function parse($, html) { return { title: $('h1').text(), content: $('div.content').html() }; }"
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
          <span class="text-xs text-gray-500">自定义 JavaScript 解析函数，$ 为 cheerio 实例</span>
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="collectForm.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="collectModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveCollect">
            {{ editingCollect ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- ═══ GATHER MODAL ═══ -->
    <n-modal v-model:show="gatherModalVisible" preset="card" title="接口采集规则" style="max-width:640px" :bordered="false">
      <n-form label-placement="left" label-width="100" size="medium">
        <n-form-item label="所属栏目" required>
          <n-select
            v-model:value="gatherForm.cid"
            :options="categories.map((c: Category) => ({ label: c.name, value: c.id }))"
            placeholder="选择栏目"
            clearable
          />
        </n-form-item>
        <n-form-item label="标题" required>
          <n-input v-model:value="gatherForm.title" placeholder="采集任务名称" />
        </n-form-item>
        <n-form-item label="API地址" required>
          <n-input v-model:value="gatherForm.api_url" placeholder="https://api.example.com/articles" />
        </n-form-item>
        <n-form-item label="列表规则">
          <n-input v-model:value="gatherForm.list_rule" placeholder="JSON路径，例如 data.list" />
          <span class="text-xs text-gray-500">JSON 数据中的列表字段路径</span>
        </n-form-item>
        <n-form-item label="内容规则">
          <n-input v-model:value="gatherForm.content_rule" placeholder="JSON路径，例如 data.content" />
        </n-form-item>
        <n-form-item label="分页规则">
          <n-input v-model:value="gatherForm.page_rule" placeholder="JSON路径，例如 data.next_page" />
        </n-form-item>
        <n-form-item label="编码">
          <n-select v-model:value="gatherForm.encoding" :options="encodingOptions" />
        </n-form-item>
        <n-form-item label="解析脚本">
          <n-input
            v-model:value="gatherForm.parse_data"
            type="textarea"
            placeholder="async function parse(data) { return { title: data.title, content: data.body }; }"
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
          <span class="text-xs text-gray-500">自定义 JavaScript 解析函数</span>
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="gatherForm.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="gatherModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveGather">
            {{ editingGather ? '保存' : '创建' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
