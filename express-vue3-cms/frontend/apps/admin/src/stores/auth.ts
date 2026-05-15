import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

interface UserInfo {
  id: number
  username: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(null)

  const isLoggedIn = () => !!token.value

  const hasPermission = (perm: string) => {
    if (!user.value) return false
    if (user.value.id === 1) return true // super admin
    return user.value.permissions.includes(perm)
  }

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password }) as any
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    user.value = res.data.user
    return res
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me') as any
      user.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, hasPermission, login, fetchUser, logout }
})
