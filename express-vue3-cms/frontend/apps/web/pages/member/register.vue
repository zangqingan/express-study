<script setup lang="ts">
const { register } = useAuth()
const router = useRouter()
const form = ref({ username: '', password: '', confirmPassword: '', email: '', phone: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = '两次密码不一致'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await register({
      username: form.value.username,
      password: form.value.password,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
    })
    if (res.code === 0) {
      router.push('/member/login?registered=1')
    } else {
      errorMsg.value = res.msg || '注册失败'
    }
  } catch {
    errorMsg.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 py-16">
    <h1 class="mb-8 text-center text-2xl font-bold text-white">会员注册</h1>
    <form class="space-y-4" @submit.prevent="handleRegister">
      <div>
        <input
          v-model="form.username"
          type="text"
          placeholder="用户名 *"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <input
          v-model="form.email"
          type="email"
          placeholder="邮箱"
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="手机号"
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <input
          v-model="form.password"
          type="password"
          placeholder="密码 *"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码 *"
          required
          class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-400"
        />
      </div>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-gray-500">
      已有账号？
      <NuxtLink to="/member/login" class="text-blue-400 hover:underline">立即登录</NuxtLink>
    </p>
  </div>
</template>
