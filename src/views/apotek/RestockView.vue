<template>
  <div><div class="page-header"><h3>Restock & Return</h3><button class="btn btn-success" @click="showForm = true"><Plus :size="16" /> Restock</button></div>
    <div class="card"><div class="card-body"><p class="text-muted">Manajemen restock dan return obat serta BHP.</p></div></div>
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-dialog" style="width:500px">
        <div class="modal-header"><h3>Restock Obat</h3><button class="modal-close" @click="showForm = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Cari Obat</label><input v-model="medSearch" class="form-input" @input="searchMed" />
            <div v-if="medResults.length" class="icd-results"><div v-for="m in medResults" :key="m.id" class="icd-result-item" @click="selectMed(m)">{{ m.namaObat }} (Stok: {{ m.stok }})</div></div>
          </div>
          <div v-if="selectedMed" class="mb-md"><strong>{{ selectedMed.namaObat }}</strong> — Stok saat ini: {{ selectedMed.stok }}</div>
          <div class="form-group"><label class="form-label">Jumlah Restock</label><input v-model.number="restockQty" type="number" class="form-input" min="1" /></div>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" @click="showForm = false">Batal</button><button class="btn btn-primary" @click="doRestock" :disabled="!selectedMed">Restock</button></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { Plus } from 'lucide-vue-next'
const api = useApi(); const showForm = ref(false); const medSearch = ref(''); const medResults = ref([]); const selectedMed = ref(null); const restockQty = ref(1)
let t = null
async function searchMed() { clearTimeout(t); if (medSearch.value.length < 2) { medResults.value = []; return }; t = setTimeout(async () => { try { const { data } = await api.get('/medicines', { search: medSearch.value, limit: 5 }); medResults.value = data.data } catch {} }, 300) }
function selectMed(m) { selectedMed.value = m; medSearch.value = m.namaObat; medResults.value = [] }
async function doRestock() { try { await api.post('/medicines/restock', { id: selectedMed.value.id, jumlah: restockQty.value }); showForm.value = false; selectedMed.value = null; restockQty.value = 1; window.__toast?.('Restock berhasil', 'success') } catch {} }
</script>
<style scoped>.icd-results{position:absolute;z-index:10;background:white;border:1px solid var(--color-border);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);max-height:200px;overflow-y:auto;width:100%}.icd-result-item{padding:10px 14px;font-size:var(--font-size-sm);cursor:pointer}.icd-result-item:hover{background:var(--color-primary-light)}</style>
