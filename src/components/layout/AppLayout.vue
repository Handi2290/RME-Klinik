<template>
  <div class="app-layout">
    <AppSidebar />
    <SubSidebar v-if="showSubSidebar" :items="subSidebarItems" :module="currentModule" />
    <div class="layout-main" :class="{ 'with-subsidebar': showSubSidebar }">
      <AppHeader :title="pageTitle" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import SubSidebar from './SubSidebar.vue'
import ToastNotification from '@/components/shared/ToastNotification.vue'

const route = useRoute()

const currentModule = computed(() => route.meta.module || '')
const pageTitle = computed(() => route.meta.title || 'Dashboard')

const showSubSidebar = computed(() => ['apotek', 'kasir', 'settings'].includes(currentModule.value))

const subSidebarItems = computed(() => {
  if (currentModule.value === 'apotek') {
    return [
      { label: 'Antrean', route: '/apotek/antrean', icon: 'ClipboardList' },
      { label: 'Resep Obat', route: '/apotek/resep', icon: 'FileText', divider: true },
      { label: 'Data Stok Obat', route: '/apotek/obat', icon: 'Pill' },
      { label: 'Penggunaan Obat', route: '/apotek/penggunaan-obat', icon: 'BarChart3' },
      { label: 'Kedaluwarsa Obat', route: '/apotek/kedaluwarsa-obat', icon: 'AlertTriangle', divider: true },
      { label: 'Bahan Habis Pakai', route: '/apotek/bahan-habis-pakai', icon: 'Package' },
      { label: 'Penggunaan BHP', route: '/apotek/penggunaan-bhp', icon: 'BarChart3' },
      { label: 'Kedaluwarsa BHP', route: '/apotek/kedaluwarsa-bhp', icon: 'AlertTriangle', divider: true },
      { label: 'Restock & Return', route: '/apotek/restock', icon: 'RefreshCw' },
    ]
  }
  if (currentModule.value === 'kasir') {
    return [
      { label: 'Pembayaran', route: '/kasir', icon: 'CreditCard' },
    ]
  }
  if (currentModule.value === 'settings') {
    return [
      { label: 'General Settings', route: '/settings', icon: 'Settings', query: { tab: 'general' } },
      { label: 'Manajemen Staff', route: '/settings', icon: 'Users', query: { tab: 'staff' } },
      { label: 'Info Tenaga Medis', route: '/settings', icon: 'UserCheck', query: { tab: 'medis' } },
      { label: 'Katalog Harga', route: '/settings', icon: 'DollarSign', query: { tab: 'katalog' }, divider: true },
      { label: 'Printing Template', route: '/settings', icon: 'Printer', query: { tab: 'printing' } },
      { label: 'ICD-10', route: '/settings', icon: 'BookOpen', query: { tab: 'icd10' } },
    ]
  }
  return []
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.layout-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left var(--transition-base);
}

.layout-main.with-subsidebar {
  margin-left: calc(var(--sidebar-width) + var(--subsidebar-width));
}

.main-content {
  flex: 1;
  padding: var(--space-lg);
  margin-top: var(--header-height);
  overflow-y: auto;
}
</style>
