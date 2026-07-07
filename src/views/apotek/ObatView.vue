<template>
  <div class="obat-view">
    <div class="page-header">
      <h3>Data Stok Obat</h3>
      <div class="flex gap-sm">
        <button class="btn btn-success" @click="showForm = true"><Plus :size="16" /> Tambah Data Obat</button>
        <button class="btn btn-outline" @click="exportExcel"><Download :size="16" /> Export Excel</button>
      </div>
    </div>

    <div class="search-wrapper mb-md">
      <Search :size="18" class="search-icon" />
      <input v-model="search" type="text" placeholder="Cari obat..." class="rj-search-input" @input="loadData" />
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode</th><th>Nama Obat</th><th>Farmasi</th><th>Jenis</th><th>Kategori</th>
              <th>Satuan</th><th>Stok</th><th>Harga Umum</th><th>Harga OTC</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in medicines" :key="m.id">
              <td>{{ m.kode }}</td>
              <td><strong>{{ m.namaObat }}</strong></td>
              <td>{{ m.farmasi || '-' }}</td>
              <td>{{ m.jenis || '-' }}</td>
              <td>{{ m.kategori || '-' }}</td>
              <td>{{ m.satuan || '-' }}</td>
              <td><span :class="m.stok <= 5 ? 'text-danger' : ''">{{ m.stok }}</span></td>
              <td>{{ formatCurrency(m.hargaUmum) }}</td>
              <td>{{ formatCurrency(m.hargaOtc) }}</td>
              <td class="table-actions">
                <button class="btn btn-ghost btn-sm" @click="editMedicine(m)"><Pencil :size="14" /></button>
                <button class="btn btn-ghost btn-sm" @click="deleteMedicine(m)"><Trash2 :size="14" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex items-center justify-between mt-md">
      <span class="text-muted" style="font-size:12px;">{{ total }} data</span>
      <div class="flex gap-sm items-center">
        <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--; loadData()">‹</button>
        <span>{{ page }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="page * limit >= total" @click="page++; loadData()">›</button>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-dialog" style="width:700px">
        <div class="modal-header">
          <h3>{{ editingId ? 'Edit Obat' : 'Tambah Data Obat' }}</h3>
          <button class="modal-close" @click="showForm = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Nama Obat *</label><input v-model="form.namaObat" class="form-input" required /></div>
            <div class="form-group"><label class="form-label">Farmasi</label><input v-model="form.farmasi" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Jenis</label><input v-model="form.jenis" class="form-input" placeholder="Tablet, Sirup, Kapsul..." /></div>
            <div class="form-group"><label class="form-label">Kategori</label><input v-model="form.kategori" class="form-input" placeholder="Obat Keras, Obat Bebas..." /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Satuan</label><input v-model="form.satuan" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Dosis</label><input v-model="form.dosis" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Stok</label><input v-model.number="form.stok" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Batch</label><input v-model="form.nomorBatch" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Harga Beli</label><input v-model.number="form.hargaBeli" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Harga Umum</label><input v-model.number="form.hargaUmum" type="number" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Harga OTC</label><input v-model.number="form.hargaOtc" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Expired</label><input v-model="form.tglExpired" type="date" class="form-input" /></div>
          </div>
          <div class="form-group"><label class="form-label">Kandungan</label><input v-model="form.kandungan" class="form-input" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showForm = false">Batal</button>
          <button class="btn btn-primary" @click="saveForm">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatCurrency } from '@/utils/formatters'
import { Search, Plus, Download, Pencil, Trash2 } from 'lucide-vue-next'

const api = useApi()
const medicines = ref([])
const search = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({})

function resetForm() { form.value = { namaObat: '', farmasi: '', jenis: '', kategori: '', satuan: 'Tablet', dosis: '', stok: 0, hargaBeli: 0, hargaUmum: 0, hargaOtc: 0, nomorBatch: '', kandungan: '', tglExpired: '' }; editingId.value = null }

onMounted(() => { resetForm(); loadData() })

async function loadData() {
  try {
    const { data } = await api.get('/medicines', { search: search.value, page: page.value, limit: limit.value })
    medicines.value = data.data; total.value = data.total
  } catch {}
}

function editMedicine(m) { form.value = { ...m, tglExpired: m.tglExpired ? m.tglExpired.split('T')[0] : '' }; editingId.value = m.id; showForm.value = true }

async function saveForm() {
  try {
    const payload = { ...form.value }
    if (payload.tglExpired) payload.tglExpired = new Date(payload.tglExpired).toISOString()
    else delete payload.tglExpired
    if (editingId.value) await api.put(`/medicines/${editingId.value}`, payload)
    else await api.post('/medicines', payload)
    showForm.value = false; resetForm(); loadData()
    window.__toast?.('Data obat berhasil disimpan', 'success')
  } catch (err) { window.__toast?.(err.response?.data?.error || 'Gagal menyimpan', 'error') }
}

async function deleteMedicine(m) {
  if (!confirm(`Hapus ${m.namaObat}?`)) return
  try { await api.delete(`/medicines/${m.id}`); loadData(); window.__toast?.('Obat dihapus', 'success') } catch {}
}

async function exportExcel() {
  try {
    const { data } = await api.download('/export/medicines/excel')
    const url = URL.createObjectURL(new Blob([data]))
    const a = document.createElement('a'); a.href = url; a.download = 'data-obat.xlsx'; a.click()
  } catch {}
}
</script>

<style scoped>
.search-wrapper { position: relative; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
.rj-search-input { width: 100%; padding: 10px 14px 10px 42px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-base); font-family: var(--font-family); outline: none; }
.rj-search-input:focus { border-color: var(--color-primary); }
</style>
