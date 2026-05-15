<script setup lang="ts">
const { isLoggedIn, user, fetchUser } = useAuth()

if (process.client && !isLoggedIn.value) {
  navigateTo('/member/login')
}

// Fetch full user profile
const api = useApi()
const { data: profileData } = await useAsyncData('profile', async () => {
  return (await api.$get('/users/profile')) as any
})

const profile = computed(() => profileData.value?.data || user.value || {})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold text-white">个人中心</h1>

    <div v-if="profile" class="space-y-6">
      <!-- User info card -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white">
            {{ (profile.nickname || profile.username)?.charAt(0)?.toUpperCase() }}
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">{{ profile.nickname || profile.username }}</h2>
            <p class="text-sm text-gray-400">{{ profile.email || profile.phone || '未绑定' }}</p>
          </div>
        </div>
      </div>

      <!-- Member level -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 class="mb-2 text-sm font-semibold text-gray-400">🏅 当前等级</h3>
        <p v-if="profile.level?.name" class="text-lg font-bold text-yellow-400">
          {{ profile.level.name }}
          <span class="text-sm text-gray-400">
            (有效期至 {{ profile.level_ship?.end_date || '无' }})
          </span>
        </p>
        <p v-else class="text-gray-500">普通会员 — 升级解锁更多特权</p>
        <NuxtLink
          to="/member/upgrade"
          class="mt-3 inline-block rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1 text-sm text-white"
        >
          升级会员
        </NuxtLink>
      </div>

      <!-- Quick links -->
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          to="/member/orders"
          class="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-400/30"
        >
          <h3 class="font-semibold text-white">📋 我的订单</h3>
          <p class="text-xs text-gray-500">查看订单记录和支付状态</p>
        </NuxtLink>
        <NuxtLink
          to="/member/reading"
          class="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-400/30"
        >
          <h3 class="font-semibold text-white">📖 阅读记录</h3>
          <p class="text-xs text-gray-500">浏览历史文章</p>
        </NuxtLink>
        <NuxtLink
          to="/member/settings"
          class="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-blue-400/30"
        >
          <h3 class="font-semibold text-white">⚙️ 账号设置</h3>
          <p class="text-xs text-gray-500">修改资料和密码</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
