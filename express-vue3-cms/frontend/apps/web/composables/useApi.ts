// Nuxt 3 composable for API calls
export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie('token')

  const baseURL = config.public.apiBase || 'http://localhost:8080/api/v1'

  async function $get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    return $fetch<T>(`${baseURL}${url}`, { method: 'GET', params, headers })
  }

  async function $post<T = any>(url: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    return $fetch<T>(`${baseURL}${url}`, { method: 'POST', body, headers })
  }

  async function $put<T = any>(url: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    return $fetch<T>(`${baseURL}${url}`, { method: 'PUT', body, headers })
  }

  async function $delete<T = any>(url: string): Promise<T> {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    return $fetch<T>(`${baseURL}${url}`, { method: 'DELETE', headers })
  }

  return { $get, $post, $put, $delete, token }
}
