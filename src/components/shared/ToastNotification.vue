<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
          <CheckCircle v-if="toast.type==='success'" :size="18" />
          <AlertCircle v-else-if="toast.type==='error'" :size="18" />
          <AlertTriangle v-else :size="18" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-vue-next'

const toasts = ref([])
let idCounter = 0

function addToast(message, type = 'success', duration = 3000) {
  const id = ++idCounter
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

// Expose for global use
defineExpose({ addToast })

// Global event bus alternative
window.__toast = addToast
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 400px;
}

.toast-success { background: #E8F5E9; color: #2E7D32; border-left: 4px solid #4CAF50; }
.toast-error { background: #FFEBEE; color: #C62828; border-left: 4px solid #F44336; }
.toast-warning { background: #FFF3E0; color: #E65100; border-left: 4px solid #FF9800; }

.toast-enter-active { animation: slideIn 0.3s ease; }
.toast-leave-active { animation: slideOut 0.3s ease; }

@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
</style>
