<script setup lang="ts">
const { login, isLoggedIn } = useAuth()
const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

if (process.client && isLoggedIn.value) {
  router.push('/member/profile')
}

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await login(form.value.username, form.value.password)
    if (res.code === 0) {
      router.push('/member/profile')
    } else {
      errorMsg.value = res.msg || '登录失败'
    }
  } catch {
    errorMsg.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 py-16">
    <h1 class="mb-8 text-center text-2xl font-bold text-white">会员登录</h1>
    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <input
          v-model="form.username"
          type="text"
          placeholder="用户名 / 邮箱 / 手机号"
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <input
          v-model="form.password"
          type="password"
          placeholder="密码"
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-gray-500">
      还没有账号？
      <NuxtLink to="/member/register" class="text-blue-400 hover:underline">立即注册</NuxtLink>
    </p>
  </div>
</template>
