<template>
  <div class="login-container">
    <div class="login-left">
      <div class="illustration-container">
        <!-- Placeholder for illustration if none is provided yet, can use an SVG or Image here later -->
        <img :src="loginIllustration || 'https://ui-avatars.com/api/?name=Clinic+App&background=eaf1fa&color=3167b6&size=512'" alt="Illustration" class="illustration" style="border-radius:12px; object-fit:cover;" />
        <div class="illustration-text">
          <h2>{{ loginTitle || 'Pilih Hanya Yang Terbaik' }}</h2>
          <p>{{ loginDescription || 'Sistem informasi kesehatan terbaik untuk klinik, praktek pribadi Anda. Berbagai fitur tersedia untuk Anda.' }}</p>
          <a href="#" class="learn-more">Pelajari lebih lanjut ></a>
        </div>
      </div>
    </div>
    
    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img v-if="clinicLogo" :src="`/${clinicLogo}`" alt="Logo" class="logo-img" />
            <Hospital v-else class="logo-icon" :size="32" />
            <span class="logo-text">{{ clinicName || 'KlinikApp' }}</span>
          </div>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group material-group">
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              class="form-input-material" 
              placeholder="Username/Email"
              required 
            />
          </div>
          
          <div class="form-group material-group password-group">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              class="form-input-material" 
              placeholder="Password"
              required 
            />
            <button type="button" class="btn-eye" @click="showPassword = !showPassword">
              <Eye v-if="!showPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              {{ loading ? 'Memproses...' : 'Login' }}
            </button>
          </div>
          
          <div class="form-footer">
            <a href="#" class="forgot-link">Lupa password?</a>
          </div>
        </form>
        
        <div class="version">V.1.0.0</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Hospital, Eye, EyeOff } from 'lucide-vue-next'

import { useApi } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const clinicName = ref('')
const clinicLogo = ref('')
const loginIllustration = ref('')
const loginTitle = ref('')
const loginDescription = ref('')

import { onMounted } from 'vue'
onMounted(async () => {
  try {
    const { data } = await api.get('/settings')
    clinicName.value = data.clinic_name || 'KlinikApp'
    loginIllustration.value = data.login_illustration ? `/${data.login_illustration}` : ''
    loginTitle.value = data.login_title || ''
    loginDescription.value = data.login_description || ''
    
    const printData = await api.get('/settings/print-template')
    clinicLogo.value = printData.data?.logoPath || ''
  } catch (err) {}
})

async function handleLogin() {
  try {
    loading.value = true

    const { data } = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })

    authStore.setAuth(data.token, data.user)

    const role = data.user?.role
    if (role === 'MASTER' || role === 'ADMIN') router.push('/rawat-jalan')
    else if (role === 'DOKTER') router.push('/emr')
    else if (role === 'APOTEK') router.push('/apotek')
    else router.push('/')
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Login gagal')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg);
}

.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 40px;
}

.illustration-container {
  max-width: 500px;
  text-align: left;
}

.illustration {
  width: 100%;
  max-width: 400px;
  margin-bottom: 32px;
}

.illustration-text h2 {
  font-size: 24px;
  color: var(--color-text);
  margin-bottom: 16px;
  font-weight: 700;
}

.illustration-text p {
  color: var(--color-text-muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

.learn-more {
  color: var(--color-secondary);
  font-weight: 500;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-primary);
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
}

.logo-img {
  height: 40px;
  object-fit: contain;
}

.login-form {
  margin-bottom: 24px;
}

.material-group {
  margin-bottom: 32px;
  position: relative;
}

.password-group {
  display: flex;
  align-items: center;
  border-bottom: 2px solid var(--color-border);
  transition: all var(--transition-fast);
}
.password-group:focus-within {
  border-bottom-color: var(--color-primary);
}

.password-group .form-input-material {
  border-bottom: none;
}

.btn-eye {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px;
}
.btn-eye:hover {
  color: var(--color-text);
}

.form-actions {
  margin-top: 40px;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.form-footer {
  margin-top: 16px;
  text-align: center;
}

.forgot-link {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.version {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 10px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .login-left {
    display: none;
  }
}
</style>
