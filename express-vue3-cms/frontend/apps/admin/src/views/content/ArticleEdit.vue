<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NSpace,
  NCheckboxGroup,
  NCheckbox,
  NSwitch,
  NSpin,
  NDivider,
  NGrid,
  NGi,
  NUpload,
  useMessage,
} from 'naive-ui'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Category {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

interface ArticleForm {
  title: string
  short_title: string
  cid: number | null
  sub_cid: string
  author: string
  source: string
  img: string
  description: string
  content: string
  tag_id: string
  attr: number[]
  status: number
  article_view: string
  link: string
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const isEdit = computed(() => {
  const id = route.params.id as string
  return id && id !== 'new'
})

const articleId = computed(() => {
  const id = route.params.id as string
  return id === 'new' ? null : Number(id)
})

const loading = ref(false)
const saving = ref(false)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const defaultForm: ArticleForm = {
  title: '',
  short_title: '',
  cid: null,
  sub_cid: '',
  author: '',
  source: '',
  img: '',
  description: '',
  content: '',
  tag_id: '',
  attr: [],
  status: 0,
  article_view: '',
  link: '',
}

const form = reactive<ArticleForm>({ ...defaultForm })

// Computed tag options from tag list join
const selectedTagIds = computed({
  get: () => {
    if (!form.tag_id) return []
    return form.tag_id
      .split(',')
      .filter(Boolean)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n))
  },
  set: (val: number[]) => {
    form.tag_id = val.join(',')
  },
})

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchCategories() {
  try {
    const res = (await api.get('/categories')) as any
    if (res.code === 0) {
      categories.value = res.data.list || res.data || []
    }
  } catch {
    // Non-critical
  }
}

async function fetchTags() {
  try {
    const res = (await api.get('/tags')) as any
    if (res.code === 0) {
      tags.value = res.data.list || res.data || []
    }
  } catch {
    // Non-critical
  }
}

async function fetchArticle() {
  if (!isEdit.value || !articleId.value) return
  loading.value = true
  try {
    const res = (await api.get(`/articles/${articleId.value}`)) as any
    if (res.code === 0) {
      const article = res.data
      form.title = article.title || ''
      form.short_title = article.short_title || ''
      form.cid = article.cid || null
      form.sub_cid = article.sub_cid || ''
      form.author = article.author || ''
      form.source = article.source || ''
      form.img = article.img || ''
      form.description = article.description || ''
      form.content = article.content || ''
      form.tag_id = article.tag_id || ''
      form.attr = decodeAttr(article.attr)
      form.status = article.status ?? 0
      form.article_view = article.article_view || ''
      form.link = article.link || ''
    }
  } catch {
    // Handled by interceptor
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function decodeAttr(attr: number | null): number[] {
  if (!attr) return []
  const result: number[] = []
  if (attr & 1) result.push(1)
  if (attr & 2) result.push(2)
  if (attr & 4) result.push(4)
  if (attr & 8) result.push(8)
  return result
}

function encodeAttr(attrs: number[]): number {
  return attrs.reduce((sum, v) => sum | v, 0)
}

// ---------------------------------------------------------------------------
// Form submission
// ---------------------------------------------------------------------------
function validateForm(): boolean {
  if (!form.title.trim()) {
    message.warning('请输入文章标题')
    return false
  }
  if (!form.cid) {
    message.warning('请选择所属栏目')
    return false
  }
  return true
}

async function handleSave() {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = {
      title: form.title,
      short_title: form.short_title || undefined,
      cid: form.cid,
      sub_cid: form.sub_cid || undefined,
      author: form.author || undefined,
      source: form.source || undefined,
      img: form.img || undefined,
      description: form.description || undefined,
      content: form.content,
      tag_id: form.tag_id || undefined,
      attr: encodeAttr(form.attr),
      article_view: form.article_view || undefined,
      link: form.link || undefined,
      status: form.status,
    }

    if (isEdit.value && articleId.value) {
      await api.put(`/articles/${articleId.value}`, payload)
      message.success('文章更新成功')
    } else {
      await api.post('/articles', payload)
      message.success('文章创建成功')
    }
    router.push('/articles')
  } catch {
    // Handled by interceptor
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/articles')
}

// ---------------------------------------------------------------------------
// Category select options
// ---------------------------------------------------------------------------
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ label: c.name, value: c.id })),
)

const tagOptions = computed(() =>
  tags.value.map((t) => ({ label: t.name, value: t.id })),
)

// ---------------------------------------------------------------------------
// Upload handler — simulates image upload (backend would have upload endpoint)
// ---------------------------------------------------------------------------
function handleUploadFinish({ file }: any, _event: any) {
  // In a real implementation, the backend returns the uploaded URL
  // We simulate by placing the file path/URL into the form
  if (file.url) {
    form.img = file.url
    message.success('图片上传成功')
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchTags()])
  if (isEdit.value) {
    await fetchArticle()
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">
        {{ isEdit ? '编辑文章' : '写文章' }}
      </h1>
      <NButton @click="handleCancel">返回列表</NButton>
    </div>

    <NSpin :show="loading">
      <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <NForm label-placement="left" label-width="100" :show-feedback="false">
          <!-- Row 1: Title & Short Title -->
          <NGrid :cols="2" :x-gap="16">
            <NGi>
              <NFormItem label="文章标题" required>
                <NInput v-model:value="form.title" placeholder="请输入文章标题" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="短标题">
                <NInput v-model:value="form.short_title" placeholder="短标题（可选）" />
              </NFormItem>
            </NGi>
          </NGrid>

          <!-- Row 2: Category & Sub Category -->
          <NGrid :cols="2" :x-gap="16">
            <NGi>
              <NFormItem label="所属栏目" required>
                <NSelect
                  v-model:value="form.cid"
                  :options="categoryOptions"
                  placeholder="请选择栏目"
                  filterable
                />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="副栏目">
                <NSelect
                  v-model:value="form.sub_cid"
                  :options="categoryOptions"
                  placeholder="关联其他栏目（多个）"
                  multiple
                  filterable
                  :consistent-menu-width="false"
                />
              </NFormItem>
            </NGi>
          </NGrid>

          <!-- Row 3: Author & Source -->
          <NGrid :cols="2" :x-gap="16">
            <NGi>
              <NFormItem label="作者">
                <NInput v-model:value="form.author" placeholder="作者名称" />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="来源">
                <NInput v-model:value="form.source" placeholder="文章来源" />
              </NFormItem>
            </NGi>
          </NGrid>

          <!-- Row 4: Thumbnail -->
          <NFormItem label="缩略图">
            <NSpace align="center">
              <NInput v-model:value="form.img" placeholder="缩略图URL" style="width: 400px" />
              <NUpload
                :show-file-list="false"
                action="/api/v1/upload"
                @finish="handleUploadFinish"
              >
                <NButton>上传图片</NButton>
              </NUpload>
            </NSpace>
            <template #feedback>
              <span class="text-xs text-gray-500">可直接输入图片URL或点击上传按钮</span>
            </template>
          </NFormItem>

          <!-- Description & External Link -->
          <NGrid :cols="2" :x-gap="16">
            <NGi>
              <NFormItem label="文章摘要">
                <NInput
                  v-model:value="form.description"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="文章摘要/描述"
                />
              </NFormItem>
            </NGi>
            <NGi>
              <NFormItem label="外部链接">
                <NInput v-model:value="form.link" placeholder="外部跳转链接（可选）" />
              </NFormItem>
            </NGi>
          </NGrid>

          <NDivider />

          <!-- Content -->
          <NFormItem label="文章内容" required>
            <NInput
              v-model:value="form.content"
              type="textarea"
              :autosize="{ minRows: 12, maxRows: 30 }"
              placeholder="文章正文内容"
            />
            <template #feedback>
              <span class="text-xs text-gray-500">
                提示：此处为纯文本/HTML编辑器，后续可集成 Tinymce 富文本编辑器替换此区域
              </span>
            </template>
          </NFormItem>

          <NDivider />

          <!-- Tags -->
          <NFormItem label="文章标签">
            <NSelect
              v-model:value="selectedTagIds"
              :options="tagOptions"
              placeholder="选择标签（可多选）"
              multiple
              filterable
              tag
            />
            <template #feedback>
              <span class="text-xs text-gray-500">输入关键字可搜索已有标签，也可直接输入创建新标签</span>
            </template>
          </NFormItem>

          <!-- Attributes -->
          <NFormItem label="文章属性">
            <NCheckboxGroup v-model:value="form.attr">
              <NSpace>
                <NCheckbox :value="1">头条</NCheckbox>
                <NCheckbox :value="2">推荐</NCheckbox>
                <NCheckbox :value="4">轮播</NCheckbox>
                <NCheckbox :value="8">热门</NCheckbox>
              </NSpace>
            </NCheckboxGroup>
          </NFormItem>

          <!-- Status -->
          <NFormItem label="发布状态">
            <NSpace align="center">
              <NSwitch :value="form.status === 0" @update:value="(v: any) => (form.status = v ? 0 : 1)" />
              <span class="text-sm text-gray-300">{{ form.status === 0 ? '已发布' : '草稿' }}</span>
            </NSpace>
          </NFormItem>

          <!-- Custom template -->
          <NFormItem label="文章模板">
            <NInput v-model:value="form.article_view" placeholder="自定义模板文件名（如 article.html）" />
            <template #feedback>
              <span class="text-xs text-gray-500">留空则使用栏目默认模板</span>
            </template>
          </NFormItem>

          <NDivider />

          <!-- Actions -->
          <div class="flex justify-center gap-4">
            <NButton type="primary" size="large" :loading="saving" @click="handleSave">
              {{ isEdit ? '更新文章' : '发布文章' }}
            </NButton>
            <NButton size="large" @click="handleCancel">取消</NButton>
          </div>
        </NForm>
      </div>
    </NSpin>
  </div>
</template>
