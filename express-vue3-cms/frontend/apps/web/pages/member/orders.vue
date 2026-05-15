<script setup lang="ts">
const { isLoggedIn } = useAuth()
if (process.client && !isLoggedIn.value) {
  navigateTo('/member/login')
}

const api = useApi()
const { data } = await useAsyncData('my-orders', async () => {
  return ((await api.$get('/orders/my')) as any)?.data || []
})

const orders = computed(() => data.value || [])

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待支付', color: 'text-yellow-400 bg-yellow-400/10' },
  1: { label: '已完成', color: 'text-green-400 bg-green-400/10' },
  2: { label: '已退款', color: 'text-red-400 bg-red-400/10' },
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold text-white">📋 我的订单</h1>

    <div v-if="orders.length" class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-white">{{ order.product?.name || '产品' }}</p>
            <p class="text-xs text-gray-500">订单号：{{ order.order_no }}</p>
            <p class="text-xs text-gray-500">{{ order.created_at }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-white">¥{{ order.amount }}</p>
            <span
              class="rounded-full px-3 py-0.5 text-xs"
              :class="statusMap[order.status]?.color"
            >
              {{ statusMap[order.status]?.label || '未知' }}
            </span>
          </div>
        </div>
        <button
          v-if="order.status === 0"
          class="mt-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1 text-xs text-white"
        >
          去支付
        </button>
      </div>
    </div>

    <div v-else class="py-16 text-center text-gray-500">
      暂无订单记录
      <NuxtLink to="/member/upgrade" class="ml-2 text-blue-400 hover:underline">去升级会员</NuxtLink>
    </div>
  </div>
</template>
