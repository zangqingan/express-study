<script setup lang="ts">
const route = useRoute()
const api = useApi()
const keyword = ref((route.query.q as string) || '')
const page = ref(1)
const pageSize = 12

const { data, refresh } = await useAsyncData(
  'search',
  async () => {
    if (!keyword.value) return { list: [], pagination: { total: 0 } }
    return ((await api.$get('/articles', {
      page: page.value,
      pageSize,
      keyword: keyword.value,
      status: 1,
    })) as any).data
  },
  { watch: [page] },
)

const articles = computed(() => data.value?.list || [])
const pagination = computed(() => data.value?.pagination || { total: 0 })

function doSearch() {
  page.value = 1
  refresh()
}

useHead({ title: `搜索: ${keyword.value} — ArtiCMS` })
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <!-- Search bar -->
    <form class="mb-8" @submit.prevent="doSearch">
      <div class="flex gap-3">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索文章标题、内容..."
          class="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          class="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white"
        >
          搜索
        </button>
      </div>
    </form>

    <p v-if="keyword && pagination.total >= 0" class="mb-6 text-sm text-gray-500">
      找到 {{ pagination.total }} 篇相关文章
    </p>

    <!-- Results -->
    <div class="grid gap-6 sm:grid-cols-2">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center gap-2">
      <button
        v-for="p in pagination.totalPages"
        :key="p"
        class="rounded-lg px-4 py-2 text-sm transition"
        :class="p === page ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        @click="page = p"
      >
        {{ p }}
      </button>
    </div>

    <div v-if="keyword && !articles.length" class="py-16 text-center text-gray-500">
      未找到相关文章
    </div>
  </div>
</template>
