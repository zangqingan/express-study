import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'
import router from '../router'

const { message } = createDiscreteApi(['message'])

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — unified error handling
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.msg || err.message || '请求失败'
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    message.error(msg)
    return Promise.reject(err)
  },
)

export default api
