import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Fetch user info before mount if token exists
const authStore = useAuthStore()
if (authStore.isLoggedIn()) {
  await authStore.fetchUser()
}

app.mount('#app')
