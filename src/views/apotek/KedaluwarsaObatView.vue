<template>
  <div class="expiry-view">
    <div class="page-header"><h3>Kedaluwarsa Obat</h3></div>
    <div v-if="expiringMeds.length" class="card mb-md" style="border-left:4px solid var(--color-warning);">
      <div class="card-body" style="background:var(--color-warning-light);">
        <strong style="color:var(--color-warning);">⚠ {{ expiringMeds.length }} obat mendekati kedaluwarsa</strong>
      </div>
    </div>
    <div class="card"><div class="card-body" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Nama Obat</th><th>Batch</th><th>Stok</th><th>Expired</th></tr></thead>
        <tbody>
          <tr v-for="m in expiringMeds" :key="m.id">
            <td>{{ m.kode }}</td><td>{{ m.namaObat }}</td><td>{{ m.nomorBatch || '-' }}</td>
            <td>{{ m.stok }}</td><td class="text-danger">{{ formatDate(m.tglExpired) }}</td>
          </tr>
          <tr v-if="!expiringMeds.length"><td colspan="5" class="text-center text-muted" style="padding:20px">Tidak ada obat mendekati kedaluwarsa</td></tr>
        </tbody>
      </table>
    </div></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatDate } from '@/utils/formatters'
const api = useApi(); const expiringMeds = ref([])
onMounted(async () => { try { const { data } = await api.get('/medicines/near-expiry'); expiringMeds.value = data } catch {} })
</script>
