import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_REDIRECT } from '@/utils/constants'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/rawat-jalan' },
      {
        path: 'rawat-jalan',
        name: 'RawatJalan',
        component: () => import('@/views/pendaftaran/RawatJalanView.vue'),
        meta: { roles: ['MASTER', 'ADMIN'], title: 'Pendaftaran' },
      },
      {
        path: 'emr',
        name: 'EMR',
        component: () => import('@/views/emr/EmrView.vue'),
        meta: { roles: ['MASTER', 'DOKTER'], title: 'Rekam Medis' },
      },
      // Apotek routes
      {
        path: 'apotek',
        redirect: '/apotek/antrean',
      },
      {
        path: 'apotek/antrean',
        name: 'ApotekAntrean',
        component: () => import('@/views/apotek/AntrianView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Antrean Apotek', module: 'apotek' },
      },
      {
        path: 'apotek/obat',
        name: 'ApotekObat',
        component: () => import('@/views/apotek/ObatView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Data Stok Obat', module: 'apotek' },
      },
      {
        path: 'apotek/penggunaan-obat',
        name: 'PenggunaanObat',
        component: () => import('@/views/apotek/PenggunaanObatView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Penggunaan Obat', module: 'apotek' },
      },
      {
        path: 'apotek/kedaluwarsa-obat',
        name: 'KedaluwarsaObat',
        component: () => import('@/views/apotek/KedaluwarsaObatView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Kedaluwarsa Obat', module: 'apotek' },
      },
      {
        path: 'apotek/bahan-habis-pakai',
        name: 'BahanHabisPakai',
        component: () => import('@/views/apotek/BahanHabisPakaiView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Bahan Habis Pakai', module: 'apotek' },
      },
      {
        path: 'apotek/penggunaan-bhp',
        name: 'PenggunaanBhp',
        component: () => import('@/views/apotek/PenggunaanBhpView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Penggunaan BHP', module: 'apotek' },
      },
      {
        path: 'apotek/kedaluwarsa-bhp',
        name: 'KedaluwarsaBhp',
        component: () => import('@/views/apotek/KedaluwarsaBhpView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Kedaluwarsa BHP', module: 'apotek' },
      },
      {
        path: 'apotek/restock',
        name: 'Restock',
        component: () => import('@/views/apotek/RestockView.vue'),
        meta: { roles: ['MASTER', 'APOTEK'], title: 'Restock & Return', module: 'apotek' },
      },
      // Kasir
      {
        path: 'kasir',
        name: 'Kasir',
        component: () => import('@/views/kasir/CashierView.vue'),
        meta: { roles: ['MASTER', 'APOTEK', 'ADMIN'], title: 'Kasir', module: 'kasir' },
      },
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { roles: ['MASTER'], title: 'Settings', module: 'settings' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

import * as license from '@/utils/license'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (license.isExpired() && !license.isUnlocked()) {
    if (to.name !== 'Login') {
      return next('/login')
    }
    return next()
  }

  if (to.meta.requiresAuth === false) {
    if (authStore.isAuthenticated && to.name === 'Login') {
      return next(ROLE_REDIRECT[authStore.userRole] || '/rawat-jalan')
    }
    return next()
  }

  if (!authStore.isAuthenticated) {
    return next('/login')
  }

  // Role check
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    return next(ROLE_REDIRECT[authStore.userRole] || '/rawat-jalan')
  }

  next()
})

export default router
