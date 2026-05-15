// Nuxt 3 auth composable
export function useAuth() {
  const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7 })
  const user = ref<any>(null)
  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const api = useApi()
    const res = await api.$post('/users/login', { username, password }) as any
    if (res.code === 0) {
      token.value = res.data.token
      user.value = res.data.user
    }
    return res
  }

  async function register(data: { username: string; password: string; email?: string; phone?: string }) {
    const api = useApi()
    return api.$post('/users/register', data) as any
  }

  async function fetchUser() {
    if (!token.value) return
    const api = useApi()
    try {
      const res = await api.$get('/users/profile') as any
      if (res.code === 0) user.value = res.data
    } catch {
      token.value = ''
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    navigateTo('/')
  }

  return { token, user, isLoggedIn, login, register, fetchUser, logout }
}
