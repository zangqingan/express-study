<script setup lang="ts">
const { isLoggedIn, user, logout } = useAuth()
const mobileOpen = ref(false)

// Fetch categories for nav
const { data: categoriesData } = await useAsyncData('nav-categories', async () => {
  const api = useApi()
  return (await api.$get('/categories')) as any
})
const categories = computed(() => categoriesData.value?.data || [])
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <!-- Logo -->
      <NuxtLink to="/" class="text-xl font-bold">
        <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          ArtiCMS
        </span>
      </NuxtLink>

      <!-- Desktop nav -->
      <div class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="cat in categories.slice(0, 6)"
          :key="cat.id"
          :to="`/category/${cat.path || cat.id}`"
          class="text-sm text-gray-300 transition hover:text-blue-400"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>

      <!-- User actions -->
      <div class="hidden items-center gap-3 md:flex">
        <template v-if="isLoggedIn">
          <NuxtLink
            to="/member/profile"
            class="text-sm text-gray-300 hover:text-blue-400"
          >
            {{ user?.nickname || user?.username }}
          </NuxtLink>
          <button
            class="rounded-full border border-gray-600 px-4 py-1 text-sm text-gray-300 hover:border-red-400 hover:text-red-400"
            @click="logout"
          >
            退出
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/member/login"
            class="rounded-full border border-gray-600 px-4 py-1 text-sm text-gray-300 hover:border-blue-400 hover:text-blue-400"
          >
            登录
          </NuxtLink>
          <NuxtLink
            to="/member/register"
            class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1 text-sm text-white"
          >
            注册
          </NuxtLink>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button class="md:hidden" @click="mobileOpen = !mobileOpen">
        <span class="text-2xl text-white">{{ mobileOpen ? '✕' : '☰' }}</span>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="border-t border-white/10 px-4 py-4 md:hidden">
      <NuxtLink
        v-for="cat in categories.slice(0, 6)"
        :key="cat.id"
        :to="`/category/${cat.path || cat.id}`"
        class="block py-2 text-gray-300"
        @click="mobileOpen = false"
      >
        {{ cat.name }}
      </NuxtLink>
      <div class="mt-3 border-t border-white/10 pt-3">
        <template v-if="isLoggedIn">
          <NuxtLink to="/member/profile" class="block py-2 text-gray-300">个人中心</NuxtLink>
          <button class="py-2 text-red-400" @click="logout">退出登录</button>
        </template>
        <template v-else>
          <NuxtLink to="/member/login" class="block py-2 text-blue-400">登录</NuxtLink>
          <NuxtLink to="/member/register" class="block py-2 text-blue-400">注册</NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
