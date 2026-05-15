<script setup lang="ts">
const route = useRoute()
const api = useApi()

const { data } = await useAsyncData(`article-${route.params.id}`, async () => {
  return (await api.$get(`/articles/${route.params.id}`)) as any
})

const article = computed(() => data.value?.data || {})
const prevNext = computed(() => data.value?.prev_next || { prev: null, next: null })

// SEO
useHead({
  title: article.value?.title || '文章详情',
  meta: [
    { name: 'description', content: article.value?.description || '' },
    { name: 'keywords', content: article.value?.tag_id || '' },
  ],
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <!-- Breadcrumb -->
    <div class="mb-6 text-sm text-gray-500">
      <NuxtLink to="/" class="hover:text-blue-400">首页</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink
        v-if="article.category"
        :to="`/category/${article.category.path || article.category.id}`"
        class="hover:text-blue-400"
      >
        {{ article.category?.name }}
      </NuxtLink>
    </div>

    <!-- Article header -->
    <h1 class="mb-4 text-3xl font-bold text-white">{{ article.title }}</h1>
    <div class="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
      <span>作者：{{ article.author || 'CMS' }}</span>
      <span v-if="article.source">来源：{{ article.source }}</span>
      <span>{{ article.created_at }}</span>
      <span>{{ article.pv || 0 }} 次阅读</span>
    </div>

    <!-- Tags -->
    <div v-if="article.tags?.length" class="mb-6 flex flex-wrap gap-2">
      <span
        v-for="tag in article.tags"
        :key="tag.id"
        class="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-400"
      >
        #{{ tag.name }}
      </span>
    </div>

    <!-- Content -->
    <article class="prose prose-invert max-w-none">
      <div v-html="article.content" />
    </article>

    <!-- Extension model fields (download model) -->
    <div
      v-if="article.ext_model?.length"
      class="mt-8 rounded-2xl border border-white/10 bg-emerald-400/5 p-6"
    >
      <h3 class="mb-4 font-semibold text-emerald-400">📦 扩展资源</h3>
      <div v-for="ext in article.ext_model" :key="ext.id" class="space-y-2 text-sm text-gray-300">
        <p v-if="ext.file">文件：{{ ext.file }}</p>
        <p v-if="ext.version">版本：{{ ext.version }}</p>
        <p v-if="ext.size">大小：{{ ext.size }}</p>
        <p v-if="ext.platform">平台：{{ ext.platform }}</p>
        <button
          class="mt-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm text-white"
        >
          立即下载 (会员专享)
        </button>
      </div>
    </div>

    <!-- Prev / Next -->
    <div class="mt-12 flex justify-between border-t border-white/10 pt-6">
      <NuxtLink
        v-if="prevNext.prev"
        :to="`/article/${prevNext.prev.id}`"
        class="text-sm text-gray-400 hover:text-blue-400"
      >
        ← {{ prevNext.prev.title }}
      </NuxtLink>
      <span v-else />
      <NuxtLink
        v-if="prevNext.next"
        :to="`/article/${prevNext.next.id}`"
        class="text-sm text-gray-400 hover:text-blue-400"
      >
        {{ prevNext.next.title }} →
      </NuxtLink>
    </div>
  </div>
</template>
