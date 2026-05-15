<script setup lang="ts">
const { isLoggedIn } = useAuth()
if (process.client && !isLoggedIn.value) {
  navigateTo('/member/login')
}

const api = useApi()
const { data: productsData } = await useAsyncData('products', async () => {
  return (await api.$get('/products')) as any
})

const products = computed(() => productsData.value?.data || [])

async function createOrder(productId: number) {
  try {
    const res = (await api.$post('/orders', { product_id: productId })) as any
    if (res.code === 0) {
      navigateTo('/member/orders')
    }
  } catch {
    // handle error
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-8 text-center text-2xl font-bold text-white">🏅 升级会员</h1>
    <p class="mb-8 text-center text-gray-400">选择适合的会员方案，解锁全部特权</p>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-blue-400/30"
      >
        <h3 class="text-lg font-bold text-white">{{ product.name }}</h3>
        <p class="mt-2 text-xs text-gray-400">{{ product.description }}</p>
        <p class="mt-4 text-3xl font-bold">
          <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            ¥{{ product.price }}
          </span>
        </p>
        <p v-if="product.days" class="mt-1 text-xs text-gray-500">
          有效期 {{ product.days }} 天
        </p>
        <p v-if="product.level" class="mt-1 text-xs text-yellow-400">
          {{ product.level.name }}等级
        </p>
        <button
          class="mt-6 w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          @click="createOrder(product.id)"
        >
          立即购买
        </button>
      </div>
    </div>
  </div>
</template>
