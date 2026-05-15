<script setup lang="ts">
defineProps<{
  article: {
    id: number
    title: string
    description?: string
    img?: string
    tag_id?: string
    attr?: number
    pv?: number
    created_at?: string
    author?: string
  }
}>()

const attrLabels: Record<number, string> = { 1: '头条', 2: '推荐', 4: '轮播', 8: '热门' }
const attrColors: Record<number, string> = { 1: 'text-red-400 bg-red-400/10', 2: 'text-blue-400 bg-blue-400/10', 4: 'text-green-400 bg-green-400/10', 8: 'text-orange-400 bg-orange-400/10' }

function getAttrs(attr?: number) {
  if (!attr) return []
  return [1, 2, 4, 8].filter((v) => attr! & v)
}
</script>

<template>
  <NuxtLink
    :to="`/article/${article.id}`"
    class="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-blue-400/30 hover:bg-white/[0.07]"
  >
    <!-- Thumbnail -->
    <div class="h-40 overflow-hidden bg-gray-800">
      <img
        v-if="article.img"
        :src="article.img"
        :alt="article.title"
        class="h-full w-full object-cover transition group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="flex h-full items-center justify-center text-4xl text-gray-600">
        📄
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="mb-2 flex flex-wrap gap-1">
        <span
          v-for="a in getAttrs(article.attr)"
          :key="a"
          class="rounded-full px-2 py-0.5 text-xs"
          :class="attrColors[a]"
        >
          {{ attrLabels[a] }}
        </span>
      </div>
      <h3 class="mb-1 text-base font-semibold text-white line-clamp-2">
        {{ article.title }}
      </h3>
      <p
        v-if="article.description"
        class="mb-2 text-xs text-gray-400 line-clamp-2"
      >
        {{ article.description }}
      </p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ article.author || 'CMS' }}</span>
        <span>{{ article.pv || 0 }} 阅读</span>
      </div>
    </div>
  </NuxtLink>
</template>
