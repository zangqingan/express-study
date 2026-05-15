<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NButton, NCheckbox, useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

// ---- Tab ----
type Tab = 'login' | 'register'
const activeTab = ref<Tab>('login')

// ---- 登录 ----
const loginForm = reactive({ username: '', password: '' })
const loginLoading = ref(false)
const rememberMe = ref(false)

// ---- 注册 ----
const registerForm = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const registerLoading = ref(false)

// ---- 浮动标签状态 ----
const loginFocus = reactive({ username: false, password: false })
const registerFocus = reactive({ username: false, email: false, password: false, confirmPassword: false })

function hasValue(obj: Record<string, string>, field: string, focusMap: Record<string, boolean>) {
  return focusMap[field] || (obj[field] && obj[field].length > 0)
}

// ---- 登录 ----
async function handleLogin() {
  if (!loginForm.username || !loginForm.password) {
    message.warning('请输入用户名和密码')
    return
  }
  loginLoading.value = true
  try {
    await authStore.login(loginForm.username, loginForm.password)
    message.success('登录成功')
    router.push('/dashboard')
  } catch {
    message.error('用户名或密码错误')
  } finally {
    loginLoading.value = false
  }
}

// ---- 注册 ----
async function handleRegister() {
  const { username, email, password, confirmPassword } = registerForm
  if (!username || !email || !password || !confirmPassword) {
    message.warning('请填写所有字段')
    return
  }
  if (password !== confirmPassword) {
    message.error('两次密码输入不一致')
    return
  }
  registerLoading.value = true
  try {
    await api.post('/auth/register', { username, email, password })
    message.success('注册成功，请登录')
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    activeTab.value = 'login'
  } catch (err: any) {
    message.error(err?.response?.data?.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}

// ---- 星空背景 ----
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0

function initStars() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)

  // 三种星星：小光点、亮星、彩色星
  interface Star { x: number; y: number; r: number; a: number; da: number; color: string; glow: boolean }
  const stars: Star[] = []

  // 小光点 (大部分)
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.02,
      color: '255,255,255',
      glow: false,
    })
  }
  // 亮星 + 光晕 (中等数量)
  const brightColors = ['255,255,255', '200,210,255', '180,200,255', '220,200,255']
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.012,
      color: brightColors[Math.floor(Math.random() * brightColors.length)],
      glow: true,
    })
  }
  // 彩色闪烁星
  const colors = ['180,200,255', '200,180,255', '255,200,220', '180,220,255', '220,255,220']
  for (let i = 0; i < 15; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.6,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.025,
      color: colors[Math.floor(Math.random() * colors.length)],
      glow: true,
    })
  }

  // 流星
  interface ShootingStar { x: number; y: number; len: number; speed: number; opacity: number; angle: number }
  const shootingStars: ShootingStar[] = []
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * canvas.width * 0.8,
      y: Math.random() * canvas.height * 0.5,
      len: Math.random() * 80 + 40,
      speed: Math.random() * 6 + 4,
      opacity: 1,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.3,
    })
  }
  spawnShootingStar()
  setInterval(() => { if (shootingStars.length < 2) spawnShootingStar() }, 4000 + Math.random() * 6000)

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 画星星
    for (const s of stars) {
      s.a += s.da
      if (s.a > 1 || s.a < 0) s.da *= -1
      const alpha = s.a * (s.glow ? 0.9 : 0.55)

      // 光晕
      if (s.glow) {
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
        glow.addColorStop(0, `rgba(${s.color},${alpha * 0.6})`)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }

      // 星核
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${s.color},${alpha})`
      ctx.fill()
    }

    // 画流星
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const m = shootingStars[i]
      m.x += Math.cos(m.angle) * m.speed
      m.y += Math.sin(m.angle) * m.speed
      m.opacity -= 0.012
      if (m.opacity <= 0 || m.x > canvas.width || m.y > canvas.height) {
        shootingStars.splice(i, 1)
        continue
      }
      const tx = m.x - Math.cos(m.angle) * m.len
      const ty = m.y - Math.sin(m.angle) * m.len
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty)
      grad.addColorStop(0, `rgba(255,255,255,${m.opacity})`)
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(tx, ty)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.2
      ctx.stroke()
    }

    animId = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(initStars)
onUnmounted(() => cancelAnimationFrame(animId))

// ---- 卡片视差 ----
const cardRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  if (!cardRef.value || !wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const rx = ((y - rect.height / 2) / (rect.height / 2)) * -4
  const ry = ((x - rect.width / 2) / (rect.width / 2)) * 4
  cardRef.value.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
  cardRef.value.style.transition = 'transform 0.15s ease-out'
}

function onMouseLeave() {
  if (!cardRef.value) return
  cardRef.value.style.transform = 'rotateX(0) rotateY(0)'
  cardRef.value.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
}

// ---- 粒子（仅用于随机样式，动画由 CSS class 驱动） ----
const particleStyles = Array.from({ length: 25 }, () => ({
  left: `${Math.random() * 100}%`,
  w: `${Math.random() * 3 + 1}px`,
  h: `${Math.random() * 3 + 1}px`,
  dur: `${Math.random() * 12 + 10}s`,
  delay: `${Math.random() * 10}s`,
  opacity: Math.random() * 0.4 + 0.1,
}))
</script>

<template>
  <div class="login-page">
    <!-- 星空 -->
    <canvas ref="canvasRef" class="stars-canvas" />

    <!-- 光晕 -->
    <div class="orbs-layer">
      <div class="orb orb--purple" />
      <div class="orb orb--cyan" />
      <div class="orb orb--pink" />
    </div>

    <!-- 粒子：动画名写在 class 里（非内联），Vue scoped 才能正确重命名 @keyframes -->
    <div class="particles-layer">
      <div
        v-for="(s, i) in particleStyles"
        :key="i"
        class="particle"
        :style="{ left: s.left, width: s.w, height: s.h, animationDuration: s.dur, animationDelay: s.delay, opacity: s.opacity }"
      />
    </div>

    <!-- 卡片 -->
    <div ref="wrapperRef" class="card-wrapper" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <div ref="cardRef" class="card">

        <!-- Tab -->
        <div class="tab-bar">
          <div class="tab-slider" :class="{ 'tab-slider--right': activeTab === 'register' }" />
          <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'login' }" @click="activeTab = 'login'">登录</button>
          <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'register' }" @click="activeTab = 'register'">注册</button>
        </div>

        <!-- 表单 -->
        <div class="form-stage">
          <Transition name="slide" mode="out-in">
            <!-- ===== 登录 ===== -->
            <div v-if="activeTab === 'login'" key="login" class="form-panel">
              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <NInput
                  v-model:value="loginForm.username" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'username' }"
                  @focus="loginFocus.username = true" @blur="loginFocus.username = false"
                  @keydown.enter="handleLogin"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(loginForm, 'username', loginFocus) }">用户名</label>
              </div>

              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <NInput
                  v-model:value="loginForm.password" type="password" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'current-password' }"
                  @focus="loginFocus.password = true" @blur="loginFocus.password = false"
                  @keydown.enter="handleLogin"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(loginForm, 'password', loginFocus) }">密码</label>
              </div>

              <div class="options-row">
                <NCheckbox v-model:checked="rememberMe" size="small">
                  <span class="text-xs text-white/40">记住我</span>
                </NCheckbox>
                <span class="forgot-link">忘记密码？</span>
              </div>

              <NButton type="primary" block :loading="loginLoading" :disabled="loginLoading" @click="handleLogin" class="submit-btn">登 录</NButton>
            </div>

            <!-- ===== 注册 ===== -->
            <div v-else key="register" class="form-panel">
              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <NInput
                  v-model:value="registerForm.username" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'name' }"
                  @focus="registerFocus.username = true" @blur="registerFocus.username = false"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(registerForm, 'username', registerFocus) }">用户名</label>
              </div>

              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 14 21 7"/></svg>
                </span>
                <NInput
                  v-model:value="registerForm.email" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'email' }"
                  @focus="registerFocus.email = true" @blur="registerFocus.email = false"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(registerForm, 'email', registerFocus) }">邮箱地址</label>
              </div>

              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <NInput
                  v-model:value="registerForm.password" type="password" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'new-password' }"
                  @focus="registerFocus.password = true" @blur="registerFocus.password = false"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(registerForm, 'password', registerFocus) }">密码</label>
              </div>

              <div class="field">
                <span class="field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <NInput
                  v-model:value="registerForm.confirmPassword" type="password" placeholder=" "
                  class="glass-input"
                  :input-props="{ autocomplete: 'new-password' }"
                  @focus="registerFocus.confirmPassword = true" @blur="registerFocus.confirmPassword = false"
                  @keydown.enter="handleRegister"
                />
                <label class="field-label" :class="{ 'field-label--float': hasValue(registerForm, 'confirmPassword', registerFocus) }">确认密码</label>
              </div>

              <NButton type="primary" block :loading="registerLoading" :disabled="registerLoading" @click="handleRegister" class="submit-btn">创建账号</NButton>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* ===================================================
   Naive UI 全局覆盖（非 scoped，穿透组件内部 DOM）
   =================================================== */

.glass-input {
  --n-border: 1px solid rgba(255,255,255,0.1) !important;
  --n-border-hover: 1px solid rgba(255,255,255,0.2) !important;
  --n-border-focus: 1px solid rgba(129,140,248,0.6) !important;
  --n-border-radius: 10px !important;
  --n-color: rgba(255,255,255,0.05) !important;
  --n-color-focus: rgba(255,255,255,0.08) !important;
  --n-text-color: #fff !important;
  --n-placeholder-color: transparent !important;
  --n-height: 42px !important;
  --n-padding-left: 38px !important;
  --n-box-shadow-focus: 0 0 0 3px rgba(99,102,241,0.1) !important;
  --n-caret-color: #818cf8 !important;
}
.glass-input .n-input__input-el {
  font-size: 0.875rem !important;
}

.submit-btn {
  --n-color: #6366f1 !important;
  --n-color-hover: #818cf8 !important;
  --n-color-pressed: #4f46e5 !important;
  --n-ripple-color: rgba(255,255,255,0.2) !important;
  --n-height: 40px !important;
  --n-border-radius: 10px !important;
  --n-font-size: 0.875rem !important;
  --n-font-weight: 600 !important;
  box-shadow: 0 4px 18px rgba(99,102,241,0.3) !important;
  letter-spacing: 0.08em;
  transition: box-shadow 0.3s, transform 0.2s !important;
}
.submit-btn:hover {
  box-shadow: 0 6px 24px rgba(99,102,241,0.5) !important;
  transform: translateY(-1px);
}
.submit-btn:active {
  transform: translateY(0) !important;
}
</style>

<style scoped>
/* ===================================================
   页面 & 星空
   =================================================== */
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: #0b0b28;
}
.stars-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* ===================================================
   光晕
   =================================================== */
.orbs-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.65;
}
.orb--purple {
  width: 460px; height: 460px;
  background: radial-gradient(circle, rgba(129,140,248,0.7) 0%, rgba(99,102,241,0.3) 40%, transparent 70%);
  top: -22%; left: -12%;
  animation: orbFloat1 20s ease-in-out infinite;
}
.orb--cyan {
  width: 340px; height: 340px;
  background: radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(6,182,212,0.2) 40%, transparent 70%);
  bottom: -18%; right: -8%;
  animation: orbFloat2 24s ease-in-out infinite;
}
.orb--pink {
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(244,114,182,0.5) 0%, rgba(236,72,153,0.2) 40%, transparent 70%);
  top: 50%; left: 48%;
  animation: orbFloat3 22s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, 60px) scale(1.08); }
  66% { transform: translate(-20px, -10px) scale(0.92); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-35px, -40px) scale(1.06); }
  66% { transform: translate(25px, 20px) scale(0.94); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -35px) scale(1.1); }
}

/* ===================================================
   粒子 — 动画名在 class 里，scoped 可正确重命名
   =================================================== */
.particles-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.particle {
  position: absolute;
  bottom: -10px;
  background: white;
  border-radius: 50%;
  animation-name: particleRise;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes particleRise {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  10%  { opacity: 1; }
  80%  { opacity: 0.1; }
  100% { opacity: 0; transform: translateY(-110vh) scale(1.4); }
}

/* ===================================================
   卡片
   =================================================== */
.card-wrapper {
  position: relative;
  z-index: 10;
  width: 380px;
  max-width: 94vw;
}
.card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  padding: 26px 26px 22px;
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
  box-shadow: 0 0 100px rgba(99,102,241,0.1), 0 20px 50px rgba(0,0,0,0.35);
  transform-style: preserve-3d;
}
.card::before {
  content: '';
  position: absolute;
  top: -60px; left: 50%;
  transform: translateX(-50%);
  width: 110%; height: 60px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
  border-radius: 50%;
  filter: blur(16px);
  pointer-events: none;
}

/* ===================================================
   Tab
   =================================================== */
.tab-bar {
  position: relative;
  display: flex;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.06);
  border-radius: 999px;
  padding: 4px;
}
.tab-slider {
  position: absolute;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px);
  background: rgba(99,102,241,0.45);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-slider--right {
  transform: translateX(calc(100% + 4px));
}

.tab-btn {
  flex: 1;
  padding: 7px 0;
  border: none;
  background: transparent;
  font-size: 0.84rem;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  border-radius: 999px;
  position: relative;
  z-index: 2;
  transition: color 0.35s;
  letter-spacing: 0.5px;
}
.tab-btn--active {
  color: #fff;
}

/* ===================================================
   表单
   =================================================== */
.form-stage {
  position: relative;
}
.form-panel {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

/* 输入框包装 */
.field {
  position: relative;
}
.field-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 17px; height: 17px;
  color: rgba(255,255,255,0.22);
  transition: color 0.3s;
  pointer-events: none;
}
.field:focus-within .field-icon {
  color: #a5b4fc;
}

/* 浮动标签 */
.field-label {
  position: absolute;
  left: 38px; top: 50%;
  transform: translateY(-50%);
  z-index: 11;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.3);
  pointer-events: none;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.field-label--float {
  top: -6px;
  left: 12px;
  font-size: 0.65rem;
  color: #a5b4fc;
  background: rgba(11,11,40,0.9);
  padding: 1px 8px;
  border-radius: 999px;
  font-weight: 600;
}

/* 选项行 */
.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.forgot-link {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: color 0.25s;
}
.forgot-link:hover {
  color: #a5b4fc;
}

/* ===================================================
   Vue Transition
   =================================================== */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}
</style>
