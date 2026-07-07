<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-circle" :class="{ 'has-img': !!clinicLogo }">
        <img v-if="clinicLogo" :src="`/${clinicLogo}`" alt="Logo" class="sidebar-logo-img" />
        <Hospital v-else class="logo-icon" :size="24" />
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        v-tooltip="item.name"
      >
        <component :is="item.icon" :size="22" />
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Hospital, LayoutDashboard, Users, Activity, Pill, Settings, FileText, CreditCard } from 'lucide-vue-next'

const authStore = useAuthStore()

import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const api = useApi()
const clinicLogo = ref('')

onMounted(async () => {
  try {
    const printData = await api.get('/settings/print-template')
    clinicLogo.value = printData.data?.logoPath || ''
  } catch (err) {}
})

const menuItems = computed(() => {
  const role = authStore.user?.role
  const items = []

  if (['MASTER', 'ADMIN', 'DOKTER'].includes(role)) {
    items.push({ name: 'Rawat Jalan', path: '/rawat-jalan', icon: Users })
  }
  if (['MASTER', 'DOKTER'].includes(role)) {
    items.push({ name: 'Rekam Medis', path: '/emr', icon: Activity })
  }
  if (['MASTER', 'APOTEK'].includes(role)) {
    items.push({ name: 'Apotek', path: '/apotek', icon: Pill })
  }
  if (['MASTER', 'ADMIN', 'APOTEK'].includes(role)) {
    items.push({ name: 'Kasir', path: '/kasir', icon: CreditCard })
  }
  if (['MASTER', 'ADMIN'].includes(role)) {
    items.push({ name: 'Laporan', path: '/laporan', icon: FileText })
    items.push({ name: 'Pengaturan', path: '/settings', icon: Settings })
  }

  return items
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  z-index: 50;
  position: relative;
}

.sidebar-logo {
  margin-bottom: 32px;
}

.logo-circle {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
}

.logo-circle.has-img {
  background-color: transparent;
}

.sidebar-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.nav-item {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s;
  position: relative;
}

.nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  bottom: 10%;
  width: 4px;
  background-color: white;
  border-radius: 0 4px 4px 0;
}
</style>
