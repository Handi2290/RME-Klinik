<template>
  <header class="app-header">
    <div class="header-left">
      <div class="clinic-info">
        <img v-if="clinicLogo" :src="clinicLogo" alt="Logo Klinik" class="clinic-logo" />
        <Hospital v-else class="clinic-icon" :size="24" />
        <span class="clinic-name">{{ clinicName }}</span>
        <ChevronDown :size="16" class="text-muted ml-sm" />
      </div>
    </div>
    
    <div class="header-right">
      <button class="icon-btn" title="Bantuan"><HelpCircle :size="20" /></button>
      <button class="icon-btn" title="Notifikasi">
        <Bell :size="20" />
        <span class="badge-dot"></span>
      </button>
      
      <div class="user-menu" @click="toggleDropdown">
        <div class="avatar">
          <User :size="18" />
        </div>
        <div class="user-info">
          <span class="user-name">{{ user?.namaStaf }}</span>
          <span class="user-role">{{ user?.role }}</span>
        </div>
        
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-header">
            <strong>{{ user?.namaStaf }}</strong>
            <p>{{ user?.username }}</p>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="handleLogout">
            <LogOut :size="16" /> Keluar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Hospital, ChevronDown, Bell, HelpCircle, User, LogOut } from 'lucide-vue-next'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()
const api = useApi()

const user = computed(() => authStore.user)
const showDropdown = ref(false)

const clinicName = ref('Klinik Keluarga Sehat')
const clinicLogo = ref(null)

onMounted(async () => {
  try {
    const { data } = await api.get('/settings')
    if (data.clinic_name) clinicName.value = data.clinic_name
    
    const printTemplate = await api.get('/settings/print-template')
    if (printTemplate.data?.logoPath) {
      clinicLogo.value = '/' + printTemplate.data.logoPath
    }
  } catch (e) {
    // silently fail
  }
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleLogout() {
  authStore.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  z-index: 40;
}

.header-left {
  display: flex;
  align-items: center;
}

.clinic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.clinic-info:hover {
  background-color: var(--color-bg);
}

.clinic-logo {
  height: 32px;
  border-radius: 4px;
}

.clinic-icon {
  color: var(--color-primary);
}

.clinic-name {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.ml-sm { margin-left: 4px; }

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: var(--color-danger);
  border-radius: 50%;
  border: 2px solid var(--color-surface);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  padding-left: 16px;
  border-left: 1px solid var(--color-border-light);
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--color-text-muted);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 100;
}

.dropdown-header {
  padding: 16px;
}
.dropdown-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border-light);
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background-color: #fff0f2;
}
</style>
