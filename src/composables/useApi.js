import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach token and backend license key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rme_token')
  const licenseKey = localStorage.getItem('rme_license_key')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (licenseKey) {
    config.headers['X-License-Key'] = licenseKey
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rme_token')
      localStorage.removeItem('rme_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function useApi() {
  return {
    get: (url, params) => api.get(url, { params }),
    post: (url, data) => api.post(url, data),
    put: (url, data) => api.put(url, data),
    patch: (url, data) => api.patch(url, data),
    delete: (url) => api.delete(url),
    upload: (url, formData) => api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    download: (url, params) => api.get(url, { params, responseType: 'blob' }),
  }
}
