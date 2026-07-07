<template>
  <div><div class="page-header"><h3>Kedaluwarsa BHP</h3></div>
    <div class="card"><div class="card-body" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Nama</th><th>Stok</th><th>Expired</th></tr></thead>
        <tbody>
          <tr v-for="c in items" :key="c.id"><td>{{ c.kode }}</td><td>{{ c.namaBarang }}</td><td>{{ c.stok }}</td><td class="text-danger">{{ formatDate(c.tglExpired) }}</td></tr>
          <tr v-if="!items.length"><td colspan="4" class="text-center text-muted" style="padding:20px">Tidak ada BHP mendekati kedaluwarsa</td></tr>
        </tbody>
      </table>
    </div></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatDate } from '@/utils/formatters'
const api = useApi(); const items = ref([])
onMounted(async () => { try { const { data } = await api.get('/consumables/near-expiry'); items.value = data } catch {} })
</script>
