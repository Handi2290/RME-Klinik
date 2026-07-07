import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('rme_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('rme_user') || 'null'))
  const licenseKey = ref(localStorage.getItem('rme_license_key') || '')

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.namaStaf || '')

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('rme_token', newToken)
    localStorage.setItem('rme_user', JSON.stringify(newUser))
  }

  function setLicenseKey(newKey) {
    licenseKey.value = newKey
    localStorage.setItem('rme_license_key', newKey)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('rme_token')
    localStorage.removeItem('rme_user')
  }

  function clearLicenseKey() {
    licenseKey.value = ''
    localStorage.removeItem('rme_license_key')
  }

  return { token, user, licenseKey, isAuthenticated, userRole, userName, setAuth, clearAuth, setLicenseKey, clearLicenseKey }
})
