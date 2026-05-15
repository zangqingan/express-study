<script setup lang="ts">
const { data: siteData } = await useAsyncData('site-info', async () => {
  const api = useApi()
  return (await api.$get('/site')) as any
})
const site = computed(() => siteData.value?.data || {})
</script>

<template>
  <footer class="border-t border-white/10 bg-[#0a0a0a]">
    <div class="mx-auto max-w-7xl px-4 py-8">
      <!-- Friend Links -->
      <FriendLinks />

      <div class="mt-6 border-t border-white/5 pt-6 text-center text-sm text-gray-500">
        <p>{{ site.name || 'ArtiCMS' }} &copy; {{ new Date().getFullYear() }}</p>
        <p v-if="site.icp" class="mt-1">{{ site.icp }}</p>
        <div v-if="site.code" class="mt-2" v-html="site.code" />
      </div>
    </div>
  </footer>
</template>
