<template>
  <aside class="sub-sidebar">
    <nav class="sub-nav">
      <template v-for="(item, idx) in items" :key="idx">
        <div v-if="item.divider" class="nav-divider"></div>
        <router-link
          :to="item.query ? { path: item.route, query: item.query } : item.route"
          class="sub-nav-item"
          :class="{ active: isActive(item) }"
        >
          <span class="sub-nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="sub-nav-badge">{{ item.badge }}</span>
        </router-link>
      </template>
    </nav>
    <div class="sub-sidebar-footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  items: { type: Array, default: () => [] },
  module: { type: String, default: '' },
})

const route = useRoute()

function isActive(item) {
  if (item.query) {
    return route.path === item.route && route.query.tab === item.query.tab
  }
  return route.path === item.route
}
</script>

<style scoped>
.sub-sidebar {
  position: fixed;
  left: var(--sidebar-width);
  top: 0;
  width: var(--subsidebar-width);
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  z-index: 95;
  padding-top: calc(var(--header-height) + 8px);
}

.sub-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.sub-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
  margin-bottom: 2px;
}

.sub-nav-item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.sub-nav-item.active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.sub-nav-badge {
  font-size: var(--font-size-xs);
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.nav-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 8px 12px;
}

.sub-sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border-light);
}
</style>
