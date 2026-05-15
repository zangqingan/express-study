<script setup lang="ts">
const api = useApi()
const form = ref({ name: '', phone_number: '', title: '', content: '' })
const submitted = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function submitMessage() {
  if (!form.value.content) {
    errorMsg.value = '请填写留言内容'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = (await api.$post('/messages', form.value)) as any
    if (res.code === 0) {
      submitted.value = true
    } else {
      errorMsg.value = res.msg || '提交失败'
    }
  } catch {
    errorMsg.value = '提交失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// Fetch approved messages
const { data } = await useAsyncData('messages', async () => {
  return ((await api.$get('/messages')) as any)?.data || []
})
const messages = computed(() => data.value || [])

useHead({ title: '留言板 — ArtiCMS' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold text-white">📝 留言板</h1>

    <!-- Submit form -->
    <div v-if="!submitted" class="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 class="mb-4 font-semibold text-white">写下留言</h3>
      <form class="space-y-3" @submit.prevent="submitMessage">
        <div class="grid gap-3 sm:grid-cols-2">
          <input
            v-model="form.name"
            type="text"
            placeholder="姓名"
            class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
          <input
            v-model="form.phone_number"
            type="text"
            placeholder="电话"
            class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <input
          v-model="form.title"
          type="text"
          placeholder="标题"
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
        <textarea
          v-model="form.content"
          placeholder="留言内容 *"
          rows="4"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
        <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? '提交中...' : '提交留言' }}
        </button>
      </form>
    </div>

    <div v-if="submitted" class="mb-10 rounded-2xl border border-green-400/30 bg-green-400/5 p-6 text-center">
      <p class="text-lg text-green-400">✅ 留言提交成功！</p>
      <p class="mt-2 text-sm text-gray-500">感谢您的留言，审核通过后将公开展示。</p>
      <button
        class="mt-4 text-sm text-blue-400 hover:underline"
        @click="submitted = false; form = { name: '', phone_number: '', title: '', content: '' }"
      >
        继续留言
      </button>
    </div>

    <!-- Message list -->
    <div v-if="messages.length" class="space-y-4">
      <h3 class="font-semibold text-white">精选留言</h3>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-white">{{ msg.title || '无标题' }}</h4>
          <span class="text-xs text-gray-500">{{ msg.created_at }}</span>
        </div>
        <p class="mt-2 text-sm text-gray-300">{{ msg.content }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ msg.name || '匿名用户' }}</p>
      </div>
    </div>
  </div>
</template>
