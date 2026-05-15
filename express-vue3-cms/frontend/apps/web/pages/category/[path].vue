<script setup lang="ts">
const route = useRoute()
const api = useApi()
const page = ref(1)
const pageSize = 12

const { data } = await useAsyncData(
  `category-${route.params.path}-${page.value}`,
  async () => {
    return (await api.$get('/articles', {
      page: page.value,
      pageSize,
      status: 1,
      path: route.params.path,
    })) as any
  },
  { watch: [page] },
)

const articles = computed(() => data.value?.data?.list || [])
const pagination = computed(() => data.value?.data?.pagination || { total: 0 })

const categoryName = computed(() => {
  const firstArticle = articles.value[0]
  return firstArticle?.category?.name || '栏目'
})

useHead({
  title: `${categoryName.value} — ArtiCMS`,
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="mb-2 text-2xl font-bold text-white">{{ categoryName }}</h1>
    <p class="mb-8 text-sm text-gray-500">共 {{ pagination.total }} 篇文章</p>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center gap-2">
      <button
        v-for="p in pagination.totalPages"
        :key="p"
        class="rounded-lg px-4 py-2 text-sm transition"
        :class="p === page
          ? 'bg-blue-500 text-white'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        @click="page = p"
      >
        {{ p }}
      </button>
    </div>

    <div v-if="!articles.length" class="py-16 text-center text-gray-500">
      暂无文章
    </div>
  </div>
</template>
