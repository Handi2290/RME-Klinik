<template>
  <router-view />
  <div v-if="showLock" class="license-lock-overlay">
    <div class="license-lock-card">
      <div class="license-lock-header">
        <h1>Aplikasi Terkunci</h1>
        <p>Masukkan PIN kunci untuk membuka kembali aplikasi setelah masa 14 hari berakhir.</p>
      </div>

      <div class="license-lock-body">
        <div class="license-info">
          <strong>Kontak:</strong>
          <div>HP: {{ contact.phone }}</div>
          <div>Email: {{ contact.email }}</div>
        </div>

        <div class="form-group">
          <input
            v-model="pin"
            type="password"
            placeholder="Masukkan PIN kunci"
            class="license-input"
            autocomplete="off"
          />
        </div>

        <button class="btn btn-primary license-unlock-button" @click="unlock" :disabled="unlocking">
          {{ unlocking ? 'Memeriksa...' : 'Buka Kunci' }}
        </button>

        <p v-if="error" class="license-error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import * as license from '@/utils/license'

const router = useRouter()
const pin = ref('')
const error = ref('')
const unlocking = ref(false)
const contact = license.getContactInfo()

const showLock = computed(() => license.isExpired() && !license.isUnlocked())

watchEffect(() => {
  if (showLock.value && router.currentRoute.value.path !== '/login') {
    router.replace('/login')
  }
})

function unlock() {
  unlocking.value = true
  const result = license.tryUnlock(pin.value)
  if (!result) {
    error.value = 'PIN kunci tidak valid. Mohon hubungi nomor / email di atas jika diperlukan.'
    unlocking.value = false
    return
  }

  error.value = ''
  pin.value = ''
  unlocking.value = false
}
</script>

<style scoped>
.license-lock-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 25, 40, 0.85);
  backdrop-filter: blur(4px);
}

.license-lock-card {
  width: min(520px, calc(100% - 40px));
  padding: 32px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 32px 80px rgba(10, 18, 40, 0.25);
  color: #212121;
}

.license-lock-header h1 {
  margin: 0 0 12px;
  font-size: 28px;
  letter-spacing: -0.02em;
}

.license-lock-header p {
  margin: 0 0 24px;
  color: #525252;
  line-height: 1.6;
}

.license-info {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 16px;
  background: #f5f7ff;
  color: #2f3e7d;
  line-height: 1.7;
}

.form-group {
  margin-bottom: 18px;
}

.license-input {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #d8dde9;
  border-radius: 12px;
  font-size: 16px;
  background: #f9fbff;
}

.license-unlock-button {
  width: 100%;
  min-height: 48px;
  margin-top: 8px;
}

.license-error {
  margin-top: 16px;
  color: #c83232;
  font-weight: 500;
}
</style>
