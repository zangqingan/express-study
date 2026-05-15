<script setup lang="ts">
const { isLoggedIn, user, logout } = useAuth()
if (process.client && !isLoggedIn.value) {
  navigateTo('/member/login')
}

const api = useApi()
const form = ref({
  nickname: user.value?.nickname || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
})
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const changingPwd = ref(false)
const msg = ref('')
const errMsg = ref('')

async function saveProfile() {
  saving.value = true
  msg.value = ''
  errMsg.value = ''
  try {
    const res = (await api.$put('/users/profile', form.value)) as any
    if (res.code === 0) {
      msg.value = '资料更新成功'
    } else {
      errMsg.value = res.msg || '更新失败'
    }
  } catch {
    errMsg.value = '更新失败'
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errMsg.value = '两次新密码不一致'
    return
  }
  changingPwd.value = true
  msg.value = ''
  errMsg.value = ''
  try {
    const res = (await api.$put('/users/password', {
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
    })) as any
    if (res.code === 0) {
      msg.value = '密码修改成功，请重新登录'
      setTimeout(() => logout(), 1500)
    } else {
      errMsg.value = res.msg || '密码修改失败'
    }
  } catch {
    errMsg.value = '密码修改失败'
  } finally {
    changingPwd.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold text-white">⚙️ 账号设置</h1>

    <!-- Profile form -->
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 class="mb-4 font-semibold text-white">个人资料</h3>
      <form class="space-y-3" @submit.prevent="saveProfile">
        <div>
          <label class="mb-1 block text-xs text-gray-500">昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          :disabled="saving"
          class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </form>
    </div>

    <!-- Password form -->
    <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 class="mb-4 font-semibold text-white">修改密码</h3>
      <form class="space-y-3" @submit.prevent="changePassword">
        <div>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="当前密码"
            required
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="新密码"
            required
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="确认新密码"
            required
            class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          :disabled="changingPwd"
          class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {{ changingPwd ? '修改中...' : '修改密码' }}
        </button>
      </form>
    </div>

    <p v-if="msg" class="mt-4 text-sm text-green-400">{{ msg }}</p>
    <p v-if="errMsg" class="mt-4 text-sm text-red-400">{{ errMsg }}</p>
  </div>
</template>
