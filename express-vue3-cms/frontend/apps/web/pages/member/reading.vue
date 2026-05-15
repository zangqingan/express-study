<script setup lang="ts">
const { isLoggedIn } = useAuth()
if (process.client && !isLoggedIn.value) {
  navigateTo('/member/login')
}

const api = useApi()
const { data } = await useAsyncData('reading-history', async () => {
  return ((await api.$get('/reading-records/my')) as any)?.data || []
})

const records = computed(() => data.value || [])
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold text-white">📖 阅读记录</h1>

    <div v-if="records.length" class="space-y-3">
      <div
        v-for="record in records"
        :key="record.id"
        class="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-400/30"
      >
        <NuxtLink
          v-if="record.article"
          :to="`/article/${record.article.id}`"
          class="font-semibold text-white hover:text-blue-400"
        >
          {{ record.article.title }}
        </NuxtLink>
        <p v-else class="text-gray-500">文章已删除</p>
        <p class="mt-1 text-xs text-gray-500">
          {{ record.created_at }} 阅读
        </p>
      </div>
    </div>

    <div v-else class="py-16 text-center text-gray-500">
      暂无阅读记录
      <NuxtLink to="/" class="ml-2 text-blue-400 hover:underline">去浏览文章</NuxtLink>
    </div>
  </div>
</template>
