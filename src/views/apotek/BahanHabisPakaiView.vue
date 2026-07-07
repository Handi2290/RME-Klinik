<template>
  <div class="bhp-view">
    <div class="page-header">
      <h3>Bahan Habis Pakai</h3>
      <div class="flex gap-sm">
        <button class="btn btn-success" @click="showForm = true"><Plus :size="16" /> Tambah BHP</button>
        <button class="btn btn-outline" @click="exportExcel"><Download :size="16" /> Export</button>
      </div>
    </div>
    <div class="card"><div class="card-body" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Nama Barang</th><th>Brand</th><th>Jenis</th><th>Satuan</th><th>Stok</th><th>Harga</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="c in items" :key="c.id">
            <td>{{ c.kode }}</td><td><strong>{{ c.namaBarang }}</strong></td><td>{{ c.brand || '-' }}</td>
            <td>{{ c.jenis || '-' }}</td><td>{{ c.satuan || '-' }}</td>
            <td :class="c.stok <= 5 ? 'text-danger' : ''">{{ c.stok }}</td>
            <td>{{ formatCurrency(c.hargaUmum) }}</td>
            <td class="table-actions">
              <button class="btn btn-ghost btn-sm" @click="editItem(c)"><Pencil :size="14" /></button>
              <button class="btn btn-ghost btn-sm" @click="deleteItem(c)"><Trash2 :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div></div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-dialog" style="width:600px">
        <div class="modal-header"><h3>{{ editingId ? 'Edit' : 'Tambah' }} BHP</h3><button class="modal-close" @click="showForm = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Nama Barang *</label><input v-model="form.namaBarang" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Brand</label><input v-model="form.brand" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Jenis</label><input v-model="form.jenis" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Satuan</label><input v-model="form.satuan" class="form-input" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Stok</label><input v-model.number="form.stok" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Harga Umum</label><input v-model.number="form.hargaUmum" type="number" class="form-input" /></div>
          </div>
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
import { Plus, Download, Pencil, Trash2 } from 'lucide-vue-next'
const api = useApi(); const items = ref([]); const showForm = ref(false); const editingId = ref(null)
const form = ref({ namaBarang: '', brand: '', jenis: '', satuan: 'Pcs', stok: 0, hargaUmum: 0, hargaBeli: 0 })
onMounted(loadData)
async function loadData() { try { const { data } = await api.get('/consumables'); items.value = data.data } catch {} }
function editItem(c) { form.value = { ...c }; editingId.value = c.id; showForm.value = true }
async function saveForm() {
  try {
    if (editingId.value) await api.put(`/consumables/${editingId.value}`, form.value)
    else await api.post('/consumables', form.value)
    showForm.value = false; editingId.value = null; loadData()
    window.__toast?.('BHP berhasil disimpan', 'success')
  } catch (err) { window.__toast?.(err.response?.data?.error || 'Gagal', 'error') }
}
async function deleteItem(c) { if (!confirm(`Hapus ${c.namaBarang}?`)) return; try { await api.delete(`/consumables/${c.id}`); loadData() } catch {} }
async function exportExcel() { try { const { data } = await api.download('/export/consumables/excel'); const u = URL.createObjectURL(new Blob([data])); const a = document.createElement('a'); a.href = u; a.download = 'data-bhp.xlsx'; a.click() } catch {} }
</script>
