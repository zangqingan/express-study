<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NSpace,
  NDivider,
  NSpin,
  useMessage,
} from 'naive-ui'
import api from '@/api'

const message = useMessage()

// --- Types ---
interface SiteConfig {
  id?: number
  name: string
  logo: string
  domain: string
  email: string
  wechat: string
  icp: string
  code: string
  upload_way: string
}

// --- State ---
const loading = ref(false)
const saving = ref(false)
const fetched = ref(false)

const form = reactive<SiteConfig>({
  name: '',
  logo: '',
  domain: '',
  email: '',
  wechat: '',
  icp: '',
  code: '',
  upload_way: 'local',
})

const uploadWayOptions = [
  { label: '本地', value: 'local' },
  { label: '七牛云', value: 'qiniu' },
]

// --- API ---
async function fetchSiteConfig() {
  loading.value = true
  try {
    const res = (await api.get('/site')) as any
    if (res.code === 0 && res.data) {
      const data = res.data
      form.name = data.name ?? ''
      form.logo = data.logo ?? ''
      form.domain = data.domain ?? ''
      form.email = data.email ?? ''
      form.wechat = data.wechat ?? ''
      form.icp = data.icp ?? ''
      form.code = data.code ?? ''
      form.upload_way = data.upload_way ?? 'local'
      fetched.value = true
    }
  } catch {
    // If no config exists yet, form stays with defaults
    fetched.value = true
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    message.warning('请输入站点名称')
    return
  }

  saving.value = true
  try {
    const payload = { ...form }
    const res = (await api.post('/site', payload)) as any
    if (res.code === 0) {
      message.success('站点配置保存成功')
    }
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}

// --- Logo upload placeholder ---
function handleLogoUpload() {
  message.info('Logo 上传功能 — 请先在七牛云配置中设置上传密钥后启用')
}

onMounted(() => {
  fetchSiteConfig()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold text-white">站点设置</h1>
      <p class="mt-1 text-sm text-gray-400">管理站点基本信息和全局配置</p>
    </div>

    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <NSpin :show="loading && !fetched">
        <NForm label-placement="left" label-width="120" size="medium">
          <!-- Basic Info -->
          <h3 class="mb-4 text-base font-semibold text-white">基本信息</h3>

          <NFormItem label="站点名称">
            <NInput v-model:value="form.name" placeholder="请输入站点名称" style="max-width: 420px" />
          </NFormItem>

          <NFormItem label="Logo URL">
            <NSpace>
              <NInput
                v-model:value="form.logo"
                placeholder="输入 Logo 图片 URL 或点击上传"
                style="width: 340px"
              />
              <NButton size="small" @click="handleLogoUpload">
                上传
              </NButton>
            </NSpace>
          </NFormItem>

          <NFormItem label="站点域名">
            <NInput v-model:value="form.domain" placeholder="例如: https://example.com" style="max-width: 420px" />
          </NFormItem>

          <!-- Contact Info -->
          <NDivider />
          <h3 class="mb-4 text-base font-semibold text-white">联系方式</h3>

          <NFormItem label="联系邮箱">
            <NInput v-model:value="form.email" placeholder="admin@example.com" style="max-width: 420px" />
          </NFormItem>

          <NFormItem label="微信公众号">
            <NInput v-model:value="form.wechat" placeholder="微信公众号名称或二维码地址" style="max-width: 420px" />
          </NFormItem>

          <!-- Legal -->
          <NDivider />
          <h3 class="mb-4 text-base font-semibold text-white">备案信息</h3>

          <NFormItem label="ICP 备案号">
            <NInput v-model:value="form.icp" placeholder="例如: 京ICP备XXXXXXXX号" style="max-width: 420px" />
          </NFormItem>

          <!-- Upload Config -->
          <NDivider />
          <h3 class="mb-4 text-base font-semibold text-white">上传配置</h3>

          <NFormItem label="上传方式">
            <NSelect
              v-model:value="form.upload_way"
              :options="uploadWayOptions"
              style="max-width: 200px"
            />
          </NFormItem>

          <!-- Analytics -->
          <NDivider />
          <h3 class="mb-4 text-base font-semibold text-white">统计代码</h3>

          <NFormItem label="统计/JS 代码">
            <NInput
              v-model:value="form.code"
              type="textarea"
              placeholder="粘贴百度统计、Google Analytics 等第三方统计代码"
              :autosize="{ minRows: 4, maxRows: 10 }"
              style="max-width: 520px"
            />
          </NFormItem>

          <!-- Save -->
          <div class="mt-8 border-t border-white/10 pt-6">
            <NSpace>
              <NButton type="primary" :loading="saving" @click="handleSave">
                保存配置
              </NButton>
              <NButton @click="fetchSiteConfig">
                重置
              </NButton>
            </NSpace>
          </div>
        </NForm>
      </NSpin>
    </div>
  </div>
</template>
