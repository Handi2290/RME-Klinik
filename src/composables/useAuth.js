import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useApi } from './useApi'
import router from '@/router'
import { ROLES } from '@/utils/constants'

export function useAuth() {
  const authStore = useAuthStore()
  const { post } = useApi()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.user)
  const userRole = computed(() => authStore.user?.role || null)

  async function login(username, password) {
    try {
      const response = await post('/auth/login', { username, password })
      const { token, user } = response.data

      authStore.setAuth(user, token)

      // Redirect berdasarkan role
      const role = user.role
      const roleConfig = ROLES[role]
      const redirectTo = roleConfig ? roleConfig.defaultRoute : '/rawat-jalan'

      await router.push(redirectTo)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Username atau password salah'
      return { success: false, message }
    }
  }

  async function logout() {
    try {
      await post('/auth/logout')
    } catch {
      // Tetap logout meskipun API gagal
    }
    authStore.logout()
    router.push('/login')
  }

  function getCurrentUser() {
    return authStore.user
  }

  function hasRole(...roles) {
    if (!authStore.user) return false
    return roles.includes(authStore.user.role)
  }

  return {
    isAuthenticated,
    currentUser,
    userRole,
    login,
    logout,
    getCurrentUser,
    hasRole
  }
}
