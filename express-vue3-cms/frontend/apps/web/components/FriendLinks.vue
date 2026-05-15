<script setup lang="ts">
const { data } = await useAsyncData('friend-links', async () => {
  const api = useApi()
  return (await api.$get('/friend-links')) as any
})
const links = computed(() => data.value?.data || [])
</script>

<template>
  <div v-if="links.length" class="flex flex-wrap items-center gap-4">
    <span class="text-sm font-semibold text-white">友情链接：</span>
    <a
      v-for="link in links"
      :key="link.id"
      :href="link.link"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-gray-400 transition hover:text-blue-400"
    >
      {{ link.title }}
    </a>
  </div>
</template>
