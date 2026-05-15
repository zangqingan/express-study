<script setup lang="ts">
const api = useApi()

// Fetch homepage data
const { data: homeData } = await useAsyncData('homepage', async () => {
  const [slidesRes, fragsRes, articlesRes] = await Promise.all([
    api.$get('/slides'),
    api.$get('/frags'),
    api.$get('/articles', { pageSize: 8, status: 1 }),
  ])
  return {
    slides: (slidesRes as any).data || [],
    frags: (fragsRes as any).data || [],
    articles: (articlesRes as any).data?.list || [],
  }
}, { server: true })

const slides = computed(() => homeData.value?.slides || [])
const frags = computed(() => homeData.value?.frags || [])
const articles = computed(() => homeData.value?.articles || [])

// Featured (头条 attr=1), Recommended (推荐 attr=2), Hot (热门 attr=8)
const featured = computed(() => articles.value.filter((a: any) => a.attr & 1).slice(0, 4))
const recommended = computed(() => articles.value.filter((a: any) => a.attr & 2).slice(0, 4))

const currentSlide = ref(0)

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

// Auto rotate slides
if (slides.value.length > 1) {
  setInterval(nextSlide, 5000)
}
</script>

<template>
  <div>
    <!-- Hero / Slider Section -->
    <section v-if="slides.length" class="relative overflow-hidden">
      <div
        v-for="(slide, i) in slides"
        :key="slide.id"
        class="transition-opacity duration-700"
        :class="i === currentSlide ? 'block' : 'hidden'"
      >
        <div
          class="flex min-h-[400px] items-center bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/30 px-8 py-16"
        >
          <div class="mx-auto max-w-3xl text-center">
            <span class="mb-4 inline-block rounded-full bg-blue-400/20 px-4 py-1 text-xs text-blue-400">
              热门推荐
            </span>
            <h1 class="mb-4 text-3xl font-bold md:text-4xl">
              {{ slide.title }}
            </h1>
            <p v-if="slide.description" class="mb-6 text-gray-400">
              {{ slide.description }}
            </p>
            <a
              v-if="slide.link"
              :href="slide.link"
              class="inline-block rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              了解更多 →
            </a>
          </div>
        </div>
      </div>

      <!-- Slide controls -->
      <div v-if="slides.length > 1" class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="h-2 rounded-full transition-all"
          :class="i === currentSlide ? 'w-8 bg-blue-400' : 'w-2 bg-white/30'"
          @click="currentSlide = i"
        />
      </div>
    </section>

    <!-- Frag / Banner Section -->
    <section v-if="frags.length" class="border-b border-white/10">
      <div class="mx-auto max-w-7xl px-4 py-6">
        <div
          v-for="frag in frags"
          :key="frag.id"
          class="rounded-xl border-l-4 border-blue-400 bg-white/5 p-4"
          v-html="frag.content"
        />
      </div>
    </section>

    <!-- Featured Articles (头条) -->
    <section v-if="featured.length" class="mx-auto max-w-7xl px-4 py-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">🔥 头条推荐</h2>
        <NuxtLink to="/search" class="text-sm text-blue-400 hover:underline">更多 →</NuxtLink>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ArticleCard v-for="article in featured" :key="article.id" :article="article" />
      </div>
    </section>

    <!-- Latest Articles -->
    <section class="mx-auto max-w-7xl px-4 py-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">📰 最新文章</h2>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
    </section>

    <!-- Recommended Section -->
    <section v-if="recommended.length" class="mx-auto max-w-7xl px-4 py-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">⭐ 编辑推荐</h2>
        <NuxtLink to="/search" class="text-sm text-blue-400 hover:underline">更多 →</NuxtLink>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ArticleCard v-for="article in recommended" :key="article.id" :article="article" />
      </div>
    </section>

    <!-- Stats -->
    <section class="border-t border-white/10">
      <div class="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-500">
        <span>📊 站点统计</span>
      </div>
    </section>
  </div>
</template>
