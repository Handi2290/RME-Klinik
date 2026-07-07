<template>
  <div class="settings-view">
    <div class="settings-content">
      <!-- General Settings -->
      <div v-if="activeTab === 'general' || !activeTab">
        <h3 class="mb-md">Profil Klinik</h3>
        <div class="card mb-md">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Logo Klinik</label>
              <div class="flex items-center gap-md">
                <div v-if="printTemplate.logoPath" class="mb-sm">
                  <img :src="'/' + printTemplate.logoPath" style="max-height:60px; border-radius: 8px;" />
                </div>
                <input type="file" accept="image/*" @change="uploadLogo($event, 'logo')" class="form-input" style="flex: 1;" />
              </div>
              <p class="text-muted" style="font-size: 12px; margin-top: 4px;">Logo ini akan digunakan pada Sidebar, Form Login, dan Cetakan (Invoice/Surat).</p>
            </div>
            <div class="form-group">
              <label class="form-label">Nama Klinik</label>
              <input v-model="generalSettingsForm.clinic_name" class="form-input" placeholder="Klinik Keluarga Sehat" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Jam Buka Praktek</label>
                <input type="time" v-model="generalSettingsForm.jam_buka" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Jam Tutup Praktek</label>
                <input type="time" v-model="generalSettingsForm.jam_tutup" class="form-input" />
              </div>
            </div>
            <button class="btn btn-primary" @click="saveGeneralSettings">Simpan Perubahan</button>
          </div>
        </div>
        
        <h3 class="mb-md">Pengaturan Halaman Login</h3>
        <div class="card mb-md">
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Gambar Ilustrasi</label>
              <div class="flex items-center gap-md">
                <div v-if="settings.login_illustration" class="mb-sm">
                  <img :src="'/' + settings.login_illustration" style="max-height:80px; border-radius: 8px;" />
                </div>
                <input type="file" accept="image/*" @change="uploadIllustration" class="form-input" style="flex: 1;" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Judul (Title)</label>
              <input v-model="generalSettingsForm.login_title" class="form-input" placeholder="Pilih Hanya Yang Terbaik" />
            </div>
            <div class="form-group">
              <label class="form-label">Deskripsi</label>
              <textarea v-model="generalSettingsForm.login_description" class="form-textarea" rows="2" placeholder="Sistem informasi kesehatan terbaik..."></textarea>
            </div>
            <button class="btn btn-primary" @click="saveGeneralSettings">Simpan Pengaturan Login</button>
          </div>
        </div>
        
        <div class="accordion">
          <div class="accordion-item">
            <div class="accordion-header" @click="toggleSection('satuSehat')">
              <span>Bridging Satu Sehat</span><ChevronDown :size="16" />
            </div>
            <div v-if="expandedSection === 'satuSehat'" class="accordion-body">
              <p class="text-muted mb-md" style="font-size:12px">Fitur integrasi Satu Sehat akan tersedia di versi mendatang.</p>
              <div class="form-group"><label class="form-label">Client ID</label><input class="form-input" disabled placeholder="Client ID Satu Sehat" /></div>
              <div class="form-group"><label class="form-label">Client Secret</label><input class="form-input" disabled placeholder="Client Secret" type="password" /></div>
              <div class="form-group"><label class="form-label">Organization ID</label><input v-model="settings.bridging_satu_sehat_org_id" class="form-input" disabled /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Management -->
      <div v-if="activeTab === 'staff'">
        <div class="page-header"><h3>Manajemen Staff</h3><button class="btn btn-success" @click="showStaffForm = true"><Plus :size="16" /> Tambah Staff</button></div>
        <div class="card"><div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>Nama</th><th>Status</th><th>Tipe Akses</th><th>No HP</th><th>Email</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-for="s in staff" :key="s.id">
                <td><strong>{{ s.namaStaf }}</strong></td>
                <td><span class="badge" :class="s.isActive ? 'badge-success' : 'badge-danger'">{{ s.isActive ? 'Aktif' : 'Tidak Aktif' }}</span></td>
                <td>{{ s.role }}</td>
                <td>{{ formatPhoneMasked(s.noHp) }}</td>
                <td>{{ formatEmailMasked(s.email) }}</td>
                <td class="table-actions">
                  <button class="btn btn-ghost btn-sm" @click="editStaff(s)"><Pencil :size="14" /></button>
                  <button class="btn btn-ghost btn-sm" @click="toggleStaffActive(s)"><Power :size="14" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div></div>

        <!-- Staff Form Modal -->
        <div v-if="showStaffForm" class="modal-overlay" @click.self="showStaffForm = false">
          <div class="modal-dialog" style="width:600px">
            <div class="modal-header"><h3>{{ editingStaffId ? 'Edit' : 'Tambah' }} Staff</h3><button class="modal-close" @click="showStaffForm = false">&times;</button></div>
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group"><label class="form-label required">Nama</label><input v-model="staffForm.namaStaf" class="form-input" /></div>
                <div class="form-group"><label class="form-label required">Username</label><input v-model="staffForm.username" class="form-input" /></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Password</label><input v-model="staffForm.password" type="password" class="form-input" :placeholder="editingStaffId ? 'Kosongkan jika tidak diubah' : ''" /></div>
                <div class="form-group"><label class="form-label required">Tipe Akses</label>
                  <select v-model="staffForm.role" class="form-select"><option value="MASTER">Owner/Master</option><option value="ADMIN">Admin</option><option value="DOKTER">Dokter</option><option value="APOTEK">Apoteker</option></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Jabatan</label><input v-model="staffForm.jabatan" class="form-input" /></div>
                <div class="form-group"><label class="form-label">No HP</label><input v-model="staffForm.noHp" class="form-input" /></div>
              </div>
              <div class="form-group"><label class="form-label">Email</label><input v-model="staffForm.email" type="email" class="form-input" /></div>
            </div>
            <div class="modal-footer"><button class="btn btn-ghost" @click="showStaffForm = false">Batal</button><button class="btn btn-primary" @click="saveStaff">Simpan</button></div>
          </div>
        </div>
      </div>

      <!-- Printing Template -->
      <div v-if="activeTab === 'printing'">
        <h3 class="mb-md">Printing Template</h3>
        <div class="print-layout">
          <div class="print-form-section">
            <div class="tabs mb-md">
              <button class="tab" :class="{ active: printTab === 'setup' }" @click="printTab = 'setup'">Page Setup</button>
              <button class="tab" :class="{ active: printTab === 'header' }" @click="printTab = 'header'">Header</button>
              <button class="tab" :class="{ active: printTab === 'logo' }" @click="printTab = 'logo'">Logo</button>
              <button class="tab" :class="{ active: printTab === 'footer' }" @click="printTab = 'footer'">Footer</button>
            </div>

            <div v-if="printTab === 'setup'" class="card"><div class="card-body">
              <div class="form-group"><label class="form-label">Tipe Printer</label>
                <div class="flex gap-md"><label class="form-checkbox"><input type="radio" v-model="printTemplate.tipePrinter" value="inkjet" /> Inkjet</label><label class="form-checkbox"><input type="radio" v-model="printTemplate.tipePrinter" value="laser" /> Laser</label></div>
              </div>
              <div class="form-row"><div class="form-group"><label class="form-label">Margin Kiri</label><input v-model="printTemplate.marginKiri" class="form-input" /></div><div class="form-group"><label class="form-label">Margin Kanan</label><input v-model="printTemplate.marginKanan" class="form-input" /></div></div>
              <div class="form-row"><div class="form-group"><label class="form-label">Margin Atas</label><input v-model="printTemplate.marginAtas" class="form-input" /></div><div class="form-group"><label class="form-label">Margin Bawah</label><input v-model="printTemplate.marginBawah" class="form-input" /></div></div>
              <div class="form-group"><label class="form-label">Orientasi</label>
                <div class="flex gap-md"><label class="form-checkbox"><input type="radio" v-model="printTemplate.orientation" value="portrait" /> Portrait</label><label class="form-checkbox"><input type="radio" v-model="printTemplate.orientation" value="landscape" /> Landscape</label></div>
              </div>
              <div class="form-row"><div class="form-group"><label class="form-label">Kertas</label><select v-model="printTemplate.kertas" class="form-select"><option>A4</option><option>A5</option><option>Letter</option></select></div><div class="form-group"><label class="form-label">Font</label><select v-model="printTemplate.font" class="form-select"><option>12pt</option><option>10pt</option><option>11pt</option><option>14pt</option></select></div></div>
            </div></div>

            <div v-if="printTab === 'header'" class="card"><div class="card-body">
              <div class="form-checkbox mb-md"><input type="checkbox" v-model="printTemplate.skipHeader" /><span>Skip Header</span></div>
              <div class="form-group"><label class="form-label">Judul</label><input v-model="printTemplate.judul" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Alamat</label><textarea v-model="printTemplate.alamat" class="form-textarea" rows="2"></textarea></div>
              <div class="form-row"><div class="form-group"><label class="form-label">Telepon</label><input v-model="printTemplate.telepon" class="form-input" /></div><div class="form-group"><label class="form-label">Email</label><input v-model="printTemplate.email" class="form-input" /></div></div>
            </div></div>

            <div v-if="printTab === 'logo'" class="card"><div class="card-body">
              <div class="form-group"><label class="form-label">Upload Logo</label><input type="file" accept="image/*" @change="uploadLogo($event, 'logo')" class="form-input" /></div>
              <div v-if="printTemplate.logoPath" class="mb-md"><img :src="'/' + printTemplate.logoPath" style="max-height:60px" /></div>
              <div class="form-group"><label class="form-label">Logo Kedua (opsional)</label><input type="file" accept="image/*" @change="uploadLogo($event, 'logoKedua')" class="form-input" /></div>
            </div></div>

            <div v-if="printTab === 'footer'" class="card"><div class="card-body">
              <div class="form-group"><label class="form-label">Keterangan</label><textarea v-model="printTemplate.keterangan" class="form-textarea" rows="2"></textarea></div>
              <div class="form-row"><div class="form-group"><label class="form-label">Signature Kiri</label><input v-model="printTemplate.signatureKiri" class="form-input" /></div><div class="form-group"><label class="form-label">Signature Kanan</label><input v-model="printTemplate.signatureKanan" class="form-input" /></div></div>
            </div></div>

            <button class="btn btn-primary mt-md" @click="savePrintTemplate">Simpan Template</button>
          </div>

          <!-- Live Preview Panel -->
          <div class="print-preview-section">
            <h4 class="mb-sm">Live Preview</h4>
            <div class="preview-paper card">
              <div class="preview-header" v-if="!printTemplate.skipHeader">
                <div class="flex items-center gap-md" style="justify-content: center; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                  <img v-if="printTemplate.logoPath" :src="'/' + printTemplate.logoPath" style="height: 50px;" />
                  <div>
                    <h2 style="margin:0; font-size: 1.2rem;">{{ printTemplate.judul || 'Klinik Contoh' }}</h2>
                    <p style="margin:0; font-size: 0.8rem;">{{ printTemplate.alamat }}</p>
                    <p style="margin:0; font-size: 0.7rem;">Telp: {{ printTemplate.telepon }} | Email: {{ printTemplate.email }}</p>
                  </div>
                  <img v-if="printTemplate.logoKeduaPath" :src="'/' + printTemplate.logoKeduaPath" style="height: 50px;" />
                </div>
              </div>
              
              <div class="preview-content">
                <h3 style="text-align: center; margin-bottom: 20px; text-decoration: underline;">SURAT CONTOH</h3>
                <p>Ini adalah contoh konten utama surat medis. Konten akan menyesuaikan dengan pengaturan template yang Anda buat.</p>
                <br/><br/>
              </div>

              <div class="preview-footer" style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div style="text-align: center; font-size: 0.8rem;">
                  <p>{{ printTemplate.keterangan }}</p>
                  <p style="margin-top: 40px;">{{ printTemplate.signatureKiri }}</p>
                </div>
                <div style="text-align: center; font-size: 0.8rem;">
                  <p>Tanggal Cetak</p>
                  <p style="margin-top: 40px;">{{ printTemplate.signatureKanan }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ICD-10 Management -->
      <div v-if="activeTab === 'icd10'">
        <div class="page-header"><h3>Manajemen ICD-10</h3>
          <div class="flex gap-sm">
            <button class="btn btn-success" @click="showIcdForm = true"><Plus :size="16" /> Tambah</button>
            <button class="btn btn-outline" @click="showImportModal = true"><Upload :size="16" /> Import</button>
            <button class="btn btn-outline" @click="exportIcd10"><Download :size="16" /> Export</button>
          </div>
        </div>
        <div class="flex gap-sm mb-md">
          <input v-model="icdSearch" class="form-input" placeholder="Cari kode ICD-10..." @input="loadIcd10" style="flex:1" />
          <select v-model="icdCategory" class="form-select" @change="loadIcd10" style="width:200px"><option value="">Semua Kategori</option><option v-for="cat in icdCategories" :key="cat.category" :value="cat.category">{{ cat.category }} - {{ cat.categoryName }}</option></select>
        </div>
        <div class="card"><div class="card-body" style="padding:0;">
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Deskripsi EN</th><th>Deskripsi ID</th><th>Chapter</th><th>Kategori</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-for="icd in icd10List" :key="icd.id">
                <td><strong>{{ icd.code }}</strong></td><td>{{ icd.description }}</td><td>{{ icd.descriptionId || '-' }}</td>
                <td>{{ icd.chapter || '-' }}</td><td>{{ icd.category || '-' }}</td>
                <td class="table-actions">
                  <button class="btn btn-ghost btn-sm" @click="editIcd(icd)"><Pencil :size="14" /></button>
                  <button class="btn btn-ghost btn-sm" @click="deleteIcd(icd)"><Trash2 :size="14" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div></div>

        <!-- ICD Form Modal -->
        <div v-if="showIcdForm" class="modal-overlay" @click.self="showIcdForm = false">
          <div class="modal-dialog" style="width:600px">
            <div class="modal-header"><h3>{{ editingIcdId ? 'Edit' : 'Tambah' }} ICD-10</h3><button class="modal-close" @click="showIcdForm = false">&times;</button></div>
            <div class="modal-body">
              <div class="form-group"><label class="form-label required">Kode</label><input v-model="icdForm.code" class="form-input" /></div>
              <div class="form-group"><label class="form-label required">Deskripsi (EN)</label><input v-model="icdForm.description" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Deskripsi (ID)</label><input v-model="icdForm.descriptionId" class="form-input" /></div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Kategori</label><input v-model="icdForm.category" class="form-input" /></div>
                <div class="form-group"><label class="form-label">Nama Kategori</label><input v-model="icdForm.categoryName" class="form-input" /></div>
              </div>
              <div class="form-group"><label class="form-label">Chapter</label><input v-model="icdForm.chapter" class="form-input" /></div>
            </div>
            <div class="modal-footer"><button class="btn btn-ghost" @click="showIcdForm = false">Batal</button><button class="btn btn-primary" @click="saveIcd">Simpan</button></div>
          </div>
        </div>

        <!-- Import Modal -->
        <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
          <div class="modal-dialog" style="width:500px">
            <div class="modal-header"><h3>Import ICD-10</h3><button class="modal-close" @click="showImportModal = false">&times;</button></div>
            <div class="modal-body">
              <p class="text-muted mb-md">Upload file JSON atau Excel (.xlsx)</p>
              <input type="file" accept=".json,.xlsx,.xls" @change="handleImportFile" class="form-input" />
              <div v-if="importResult" class="mt-md card"><div class="card-body">
                <p class="text-success">Dibuat: {{ importResult.created }}</p>
                <p class="text-warning">Diupdate: {{ importResult.updated }}</p>
                <p class="text-muted">Dilewati: {{ importResult.skipped }}</p>
                <p v-if="importResult.errors?.length" class="text-danger">Error: {{ importResult.errors.length }}</p>
              </div></div>
            </div>
            <div class="modal-footer"><button class="btn btn-ghost" @click="showImportModal = false">Tutup</button></div>
          </div>
        </div>
      </div>

      <!-- Other tabs placeholder -->
      <div v-if="activeTab === 'medis'"><h3 class="mb-md">Info Tenaga Medis</h3><div class="card"><div class="card-body"><p class="text-muted">Informasi tenaga medis yang terdaftar.</p></div></div></div>
      <div v-if="activeTab === 'katalog'"><h3 class="mb-md">Katalog Harga Prosedur</h3><div class="card"><div class="card-body"><p class="text-muted">Katalog harga prosedur klinik.</p></div></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { formatPhoneMasked, formatEmailMasked } from '@/utils/formatters'
import { Plus, Upload, Download, Pencil, Trash2, Power, ChevronDown } from 'lucide-vue-next'

const route = useRoute()
const api = useApi()

const activeTab = computed(() => route.query.tab || 'general')
const expandedSection = ref('')
const printTab = ref('setup')

// Staff
const staff = ref([]); const showStaffForm = ref(false); const editingStaffId = ref(null)
const staffForm = ref({ namaStaf: '', username: '', password: '', role: 'ADMIN', jabatan: '', noHp: '', email: '' })

// Settings
const settings = ref({})
const generalSettingsForm = ref({ clinic_name: '', login_title: '', login_description: '', jam_buka: '08:00', jam_tutup: '21:00' })

// Print Template
const printTemplate = ref({})

// ICD-10
const icd10List = ref([]); const icdSearch = ref(''); const icdCategory = ref(''); const icdCategories = ref([])
const showIcdForm = ref(false); const editingIcdId = ref(null)
const icdForm = ref({ code: '', description: '', descriptionId: '', category: '', categoryName: '', chapter: '' })
const showImportModal = ref(false); const importResult = ref(null)

onMounted(() => { loadSettings(); loadStaff(); loadPrintTemplate(); loadIcd10(); loadIcdCategories() })
watch(activeTab, () => { if (activeTab.value === 'staff') loadStaff(); if (activeTab.value === 'icd10') { loadIcd10(); loadIcdCategories() } })

function toggleSection(s) { expandedSection.value = expandedSection.value === s ? '' : s }

async function loadSettings() { 
  try { 
    const { data } = await api.get('/settings'); 
    settings.value = data;
    generalSettingsForm.value.clinic_name = data.clinic_name || ''
    generalSettingsForm.value.login_title = data.login_title || ''
    generalSettingsForm.value.login_description = data.login_description || ''
    generalSettingsForm.value.jam_buka = data.jam_buka || '08:00'
    generalSettingsForm.value.jam_tutup = data.jam_tutup || '21:00'
  } catch {} 
}

async function saveGeneralSettings() {
  try {
    await api.put('/settings', { 
      clinic_name: generalSettingsForm.value.clinic_name,
      login_title: generalSettingsForm.value.login_title,
      login_description: generalSettingsForm.value.login_description,
      jam_buka: generalSettingsForm.value.jam_buka,
      jam_tutup: generalSettingsForm.value.jam_tutup
    });
    window.__toast?.('Pengaturan Umum berhasil disimpan', 'success')
  } catch (err) {
    window.__toast?.('Gagal menyimpan pengaturan umum', 'error')
  }
}
async function uploadIllustration(event) {
  const file = event.target.files[0]; if (!file) return
  const fd = new FormData(); fd.append('image', file)
  try {
    const { data } = await api.upload('/settings/illustration', fd)
    settings.value.login_illustration = data.path
    window.__toast?.('Ilustrasi login berhasil diupload', 'success')
  } catch {
    window.__toast?.('Gagal mengupload ilustrasi', 'error')
  }
}
async function loadStaff() { try { const { data } = await api.get('/staff'); staff.value = data.data } catch {} }
async function loadPrintTemplate() { try { const { data } = await api.get('/settings/print-template'); printTemplate.value = data } catch {} }
async function loadIcd10() { try { const { data } = await api.get('/icd10', { search: icdSearch.value, category: icdCategory.value, limit: 50 }); icd10List.value = data.data } catch {} }
async function loadIcdCategories() { try { const { data } = await api.get('/icd10/categories'); icdCategories.value = data } catch {} }

function editStaff(s) { staffForm.value = { ...s, password: '' }; editingStaffId.value = s.id; showStaffForm.value = true }
async function saveStaff() {
  try {
    const payload = { ...staffForm.value }; if (!payload.password) delete payload.password
    if (editingStaffId.value) await api.put(`/staff/${editingStaffId.value}`, payload)
    else await api.post('/staff', payload)
    showStaffForm.value = false; editingStaffId.value = null; loadStaff()
    window.__toast?.('Staff berhasil disimpan', 'success')
  } catch (err) { window.__toast?.(err.response?.data?.error || 'Gagal', 'error') }
}
async function toggleStaffActive(s) { try { await api.patch(`/staff/${s.id}/toggle-active`); loadStaff() } catch {} }

async function savePrintTemplate() {
  try { await api.put('/settings/print-template', printTemplate.value); window.__toast?.('Template berhasil disimpan', 'success') } catch {} }

async function uploadLogo(event, field) {
  const file = event.target.files[0]; if (!file) return
  const fd = new FormData(); fd.append('logo', file)
  try { const { data } = await api.upload(`/settings/print-template/logo?field=${field}`, fd); printTemplate.value = data.template; window.__toast?.('Logo berhasil diupload', 'success') } catch {} }

function editIcd(icd) { icdForm.value = { ...icd }; editingIcdId.value = icd.id; showIcdForm.value = true }
async function saveIcd() {
  try {
    if (editingIcdId.value) await api.put(`/icd10/${editingIcdId.value}`, icdForm.value)
    else await api.post('/icd10', icdForm.value)
    showIcdForm.value = false; editingIcdId.value = null; loadIcd10()
    window.__toast?.('ICD-10 berhasil disimpan', 'success')
  } catch (err) { window.__toast?.(err.response?.data?.error || 'Gagal', 'error') }
}
async function deleteIcd(icd) { if (!confirm(`Hapus ${icd.code}?`)) return; try { await api.delete(`/icd10/${icd.id}`); loadIcd10() } catch {} }
async function handleImportFile(event) {
  const file = event.target.files[0]; if (!file) return
  const fd = new FormData(); fd.append('file', file)
  try { const { data } = await api.upload('/icd10/import', fd); importResult.value = data; loadIcd10() } catch (err) { window.__toast?.(err.response?.data?.error || 'Import gagal', 'error') }
}
async function exportIcd10() { try { const { data } = await api.download('/export/icd10/excel'); const u = URL.createObjectURL(new Blob([data])); const a = document.createElement('a'); a.href = u; a.download = 'icd10-data.xlsx'; a.click() } catch {} }
</script>

<style scoped>
.settings-content { max-width: 1100px; width: 100%; }
.print-layout { display: flex; gap: 24px; }
.print-form-section { flex: 1; min-width: 400px; }
.print-preview-section { flex: 1; max-width: 500px; }
.preview-paper {
  background: white;
  padding: 30px;
  min-height: 400px;
  border: 1px solid #ccc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
  color: #333;
  transform-origin: top center;
}
</style>
