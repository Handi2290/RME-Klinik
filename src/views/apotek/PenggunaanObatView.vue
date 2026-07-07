<template>
  <div class="report-view">
    <div class="page-header"><h3>Penggunaan Obat</h3></div>
    <div class="card"><div class="card-body"><p class="text-muted">Laporan penggunaan obat berdasarkan periode waktu.</p>
    <div class="flex gap-sm mb-md">
      <input v-model="from" type="date" class="form-input" style="width:auto" />
      <span class="flex items-center">—</span>
      <input v-model="to" type="date" class="form-input" style="width:auto" />
      <button class="btn btn-primary btn-sm" @click="loadData">FILTER</button>
    </div>
    <div v-if="loading" class="loading-overlay"><div class="spinner"></div></div>
    <p v-else class="text-muted">Pilih periode untuk melihat laporan</p>
    </div></div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const from = ref(''); const to = ref(''); const loading = ref(false)
function loadData() { /* TODO: implement */ }
</script>
