<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h3>Rawat Jalan</h3>
        <p class="text-muted">Manajemen antrean dan pendaftaran pasien rawat jalan</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="loadData">
          <RefreshCw :size="16" :class="{ 'spin': loading }" /> Segarkan
        </button>
        <button class="btn btn-primary ml-sm" @click="showVisitModal = true">
          <Plus :size="16" /> Pendaftaran Baru
        </button>
      </div>
    </div>

    <!-- Search Bar & Filters in Card -->
    <div class="card mb-md">
      <div class="card-body">
        <div class="rj-search-section m-0">
          <div class="search-wrapper">
            <Search :size="18" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Pasien / No MR / No KTP / No Asuransi..." class="rj-search-input" />
          </div>
        </div>
      </div>
    </div>

    <!-- Date Navigator -->
    <div class="rj-date-nav">
      <button class="btn btn-ghost btn-sm" @click="changeDate(-1)"><ChevronLeft :size="16" /></button>
      <span class="date-display">{{ formatDayDate(currentDate) }}</span>
      <button class="btn btn-ghost btn-sm" @click="changeDate(1)"><ChevronRight :size="16" /></button>
      <button class="btn btn-outline btn-sm" @click="currentDate = new Date()">HARI INI</button>
    </div>

    <!-- Doctor List + Schedule Grid -->
    <div class="rj-body">
      <aside class="doctor-list">
        <h4 class="doctor-list-title">Seluruh Dokter</h4>
        <div v-for="doc in doctors" :key="doc.id" class="doctor-item" :class="{ active: selectedDoctor === doc.id }" @click="selectedDoctor = selectedDoctor === doc.id ? null : doc.id">
          <div class="doctor-avatar">{{ doc.namaStaf?.charAt(0) }}</div>
          <span class="doctor-name">{{ doc.namaStaf }}</span>
        </div>
      </aside>

      <div class="schedule-grid">
        <TimelineGrid 
          :loading="loading"
          :visits="filteredVisits"
          :start-date="currentDate"
          :days-to-show="4"
          :start-time="clinicSettings.jam_buka"
          :end-time="clinicSettings.jam_tutup"
          @click-visit="selectVisit"
        />
      </div>
    </div>

    <!-- Visit Form Modal -->
    <div v-if="showVisitModal" class="modal-overlay" @click.self="showVisitModal = false">
      <div class="modal-dialog" style="width: 800px">
        <div class="modal-header">
          <h3>Daftar Kunjungan</h3>
          <button class="modal-close" @click="showVisitModal = false">&times;</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <div class="form-checkbox mb-md">
            <input type="checkbox" v-model="isNewPatient" id="isNewPatient" />
            <label for="isNewPatient">Daftarkan Pasien Baru</label>
          </div>

          <!-- Existing Patient Search -->
          <div v-if="!isNewPatient" class="form-group">
            <label class="form-label">Cari Pasien</label>
            <input v-model="patientSearch" type="text" class="form-input" placeholder="Ketik nama / No RM pasien..." @input="searchPatient" />
            <div v-if="patientResults.length" class="patient-results">
              <div v-for="p in patientResults" :key="p.id" class="patient-result-item" @click="selectPatient(p)">
                <strong>{{ p.namaPasien }}</strong> — {{ p.noRm }} · {{ formatGender(p.jenisKelamin) }} · {{ formatAge(p.tglLahir) }}
              </div>
            </div>
          </div>

          <div v-if="!isNewPatient && selectedPatient" class="selected-patient-info card mb-md">
            <div class="card-body">
              <p><strong>{{ selectedPatient.namaPasien }}</strong></p>
              <p class="text-muted">{{ selectedPatient.noRm }} · {{ formatGender(selectedPatient.jenisKelamin) }} · {{ formatAge(selectedPatient.tglLahir) }}</p>
            </div>
          </div>

          <!-- New Patient Form -->
          <div v-if="isNewPatient" class="card mb-md"><div class="card-body">
            <h4 class="mb-sm">Data Pasien Baru</h4>
            <div class="form-group">
              <label class="form-label required">Nama Pasien</label>
              <input v-model="newPatientForm.namaPasien" class="form-input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Jenis Kelamin</label>
                <select v-model="newPatientForm.jenisKelamin" class="form-select">
                  <option value="LAKI_LAKI">Laki-Laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Tanggal Lahir</label>
                <input v-model="newPatientForm.tglLahir" type="date" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">No HP</label>
                <input v-model="newPatientForm.noHp" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Tipe Pasien</label>
                <select v-model="newPatientForm.tipePasien" class="form-select">
                  <option value="Umum">Umum</option>
                  <option value="BPJS">BPJS</option>
                </select>
              </div>
            </div>

            <h4 class="mt-md mb-sm">Pemeriksaan Awal (Opsional)</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Berat Badan (kg)</label>
                <input v-model="vitalSignsForm.beratBadan" type="number" step="0.1" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Tinggi Badan (cm)</label>
                <input v-model="vitalSignsForm.tinggiBadan" type="number" step="0.1" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tensi (mmHg)</label>
                <input v-model="vitalSignsForm.tensi" placeholder="120/80" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Suhu (°C)</label>
                <input v-model="vitalSignsForm.suhu" type="number" step="0.1" class="form-input" />
              </div>
            </div>
          </div></div>

          <h4 class="mb-sm">Detail Kunjungan</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tipe Bayar</label>
              <select v-model="visitForm.tipeBayar" class="form-select">
                <option value="Umum">Umum</option>
                <option value="BPJS">BPJS</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Poli</label>
              <select v-model="visitForm.poli" class="form-select">
                <option v-for="p in poliOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Dokter</label>
              <select v-model="visitForm.dokterId" class="form-select">
                <option value="">Pilih Dokter</option>
                <option v-for="d in doctors" :key="d.id" :value="d.id">{{ d.namaStaf }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Jam Kunjungan</label>
              <input v-model="visitForm.jamKunjungan" type="time" class="form-input" />
            </div>
          </div>

          <div class="form-group relative">
            <label class="form-label">Keluhan</label>
            <textarea v-model="visitForm.keluhan" class="form-textarea" rows="3" placeholder="Keluhan pasien (atau cari kode ICD)..." @input="searchIcd"></textarea>
            
            <div v-if="icdResults.length > 0" class="icd-autocomplete-results">
              <div v-for="icd in icdResults" :key="icd.id" class="icd-result-item" @click="selectIcd(icd)">
                <strong>{{ icd.code }}</strong> - {{ icd.descriptionId || icd.description }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showVisitModal = false">BATAL</button>
          <button class="btn btn-primary" @click="createVisit" :disabled="(!isNewPatient && !selectedPatient) || saving">
            <span v-if="saving" class="spinner spinner-sm"></span>
            SIMPAN
          </button>
        </div>
      </div>
    </div>

    <!-- Patient Popover / Detail -->
    <div v-if="selectedVisit" class="modal-overlay" @click.self="selectedVisit = null">
      <div class="modal-dialog" style="width:440px">
        <div class="modal-header">
          <h3>Detail Pasien</h3>
          <button class="modal-close" @click="selectedVisit = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="patient-detail-info">
            <p><strong>{{ selectedVisit.patient?.namaPasien }}</strong></p>
            <p>No RM: {{ selectedVisit.patient?.noRm }}</p>
            <p>{{ formatAge(selectedVisit.patient?.tglLahir) }} · {{ formatGender(selectedVisit.patient?.jenisKelamin) }}</p>
            <p>No HP: {{ selectedVisit.patient?.noHp || '-' }}</p>
            <p>Metode: {{ selectedVisit.tipeBayar }}</p>
          </div>
          <div class="mt-md">
            <label class="form-label">Ubah Status</label>
            <select v-model="newStatus" class="form-select" @change="updateVisitStatus">
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="WAITING">Waiting</option>
              <option value="ENGAGED">Engaged</option>
              <option value="SUCCEED">Succeed</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger btn-sm" @click="deleteVisit">Hapus</button>
          <button class="btn btn-primary btn-sm" @click="selectedVisit = null">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatDayDate, formatAge, formatGender } from '@/utils/formatters'
import { POLI_OPTIONS } from '@/utils/constants'
import { Search, Plus, ChevronLeft, ChevronRight, CalendarX, RefreshCw } from 'lucide-vue-next'
import TimelineGrid from '@/components/TimelineGrid.vue'

const api = useApi()

const currentDate = ref(new Date())
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const visits = ref([])
const doctors = ref([])
const selectedDoctor = ref(null)
const clinicSettings = ref({ jam_buka: '08:00', jam_tutup: '21:00' })
const showVisitModal = ref(false)
const selectedVisit = ref(null)
const newStatus = ref('')
const patientSearch = ref('')
const patientResults = ref([])
const selectedPatient = ref(null)
const poliOptions = POLI_OPTIONS

const isNewPatient = ref(false)
const newPatientForm = ref({ namaPasien: '', jenisKelamin: 'LAKI_LAKI', tglLahir: '', noHp: '', tipePasien: 'Umum' })
const vitalSignsForm = ref({ beratBadan: '', tinggiBadan: '', tensi: '', suhu: '' })

const icdResults = ref([])

const visitForm = ref({
  poli: 'Umum',
  dokterId: '',
  jamKunjungan: '',
  keluhan: '',
  tipeBayar: 'Umum',
})

const statuses = [
  { key: 'PENDING', label: 'Pending', color: '#F44336' },
  { key: 'CONFIRMED', label: 'Confirmed', color: '#FF9800' },
  { key: 'WAITING', label: 'Waiting', color: '#9C27B0' },
  { key: 'ENGAGED', label: 'Engaged', color: '#2196F3' },
  { key: 'SUCCEED', label: 'Succeed', color: '#4CAF50' },
]

const filteredVisits = computed(() => {
  let result = visits.value
  if (selectedDoctor.value) {
    result = result.filter(v => v.dokterId === selectedDoctor.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      v.patient?.namaPasien?.toLowerCase().includes(q) ||
      v.patient?.noRm?.includes(q)
    )
  }
  return result
})

onMounted(() => { loadData() })

async function loadData() {
  loading.value = true
  try {
    const startIso = currentDate.value.toISOString().split('T')[0]
    const endDate = new Date(currentDate.value)
    endDate.setDate(endDate.getDate() + 3) // 4 days total
    const endIso = endDate.toISOString().split('T')[0]
    
    const [visitsRes, doctorsRes, settingsRes] = await Promise.all([
      api.get('/visits', { startDate: startIso, endDate: endIso }),
      api.get('/staff/doctors'),
      api.get('/settings')
    ])
    visits.value = visitsRes.data.data || visitsRes.data
    doctors.value = doctorsRes.data
    if (settingsRes.data) {
      clinicSettings.value.jam_buka = settingsRes.data.jam_buka || '08:00'
      clinicSettings.value.jam_tutup = settingsRes.data.jam_tutup || '21:00'
    }
  } catch {} finally {
    loading.value = false
  }
}

function changeDate(offset) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  currentDate.value = d
  loadData()
}

function handleSearch() {}

let searchTimeout = null
async function searchPatient() {
  clearTimeout(searchTimeout)
  if (patientSearch.value.length < 2) { patientResults.value = []; return }
  searchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/patients', { search: patientSearch.value, limit: 5 })
      patientResults.value = data.data || []
    } catch {}
  }, 300)
}

function selectPatient(p) {
  selectedPatient.value = p
  patientResults.value = []
  patientSearch.value = p.namaPasien
}

let icdTimeout = null
async function searchIcd() {
  clearTimeout(icdTimeout)
  if (!visitForm.value.keluhan || visitForm.value.keluhan.length < 3) {
    icdResults.value = []
    return
  }
  
  // Extract the last word typed
  const words = visitForm.value.keluhan.split(/[\n,;]+/)
  const lastWord = words[words.length - 1].trim()
  
  if (lastWord.length < 3) return
  
  icdTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/icd10', { search: lastWord, limit: 10 })
      icdResults.value = data.data || []
    } catch {}
  }, 300)
}

function selectIcd(icd) {
  const currentText = visitForm.value.keluhan || ''
  const words = currentText.split(/[\n,;]+/)
  words.pop()
  
  const separator = words.length > 0 ? ', ' : ''
  const prefix = words.length > 0 ? words.join(', ') + separator : ''
  
  visitForm.value.keluhan = prefix + `${icd.code} - ${icd.descriptionId || icd.description}`
  icdResults.value = []
}

async function createVisit() {
  if (!isNewPatient.value && !selectedPatient.value) return
  if (isNewPatient.value && !newPatientForm.value.namaPasien) {
    window.__toast?.('Nama pasien baru wajib diisi', 'error')
    return
  }

  saving.value = true
  try {
    const payload = {
      tglKunjungan: currentDate.value.toISOString(),
      ...visitForm.value,
    }

    if (isNewPatient.value) {
      payload.newPatient = { ...newPatientForm.value }
      payload.vitalSigns = { ...vitalSignsForm.value }
    } else {
      payload.patientId = selectedPatient.value.id
    }

    await api.post('/visits', payload)
    
    showVisitModal.value = false
    selectedPatient.value = null
    patientSearch.value = ''
    isNewPatient.value = false
    newPatientForm.value = { namaPasien: '', jenisKelamin: 'LAKI_LAKI', tglLahir: '', noHp: '', tipePasien: 'Umum' }
    vitalSignsForm.value = { beratBadan: '', tinggiBadan: '', tensi: '', suhu: '' }
    visitForm.value = { poli: 'Umum', dokterId: '', jamKunjungan: '', keluhan: '', tipeBayar: 'Umum' }
    
    loadData()
    window.__toast?.('Kunjungan berhasil didaftarkan', 'success')
  } catch (err) {
    window.__toast?.(err.response?.data?.error || 'Gagal mendaftarkan', 'error')
  } finally { saving.value = false }
}

function selectVisit(v) {
  selectedVisit.value = v
  newStatus.value = v.statusAntrean
}

async function updateVisitStatus() {
  try {
    await api.patch(`/visits/${selectedVisit.value.id}/status`, { status: newStatus.value })
    loadData()
    window.__toast?.('Status berhasil diubah', 'success')
  } catch {}
}

async function deleteVisit() {
  if (!confirm('Hapus kunjungan ini?')) return
  try {
    await api.delete(`/visits/${selectedVisit.value.id}`)
    selectedVisit.value = null
    loadData()
    window.__toast?.('Kunjungan dihapus', 'success')
  } catch {}
}
</script>

<style scoped>
.rawat-jalan { padding: 0; }

.rj-search-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.rj-search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background: var(--color-surface);
}
.rj-search-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0,188,212,0.1); }

.status-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.rj-date-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.date-display {
  font-size: var(--font-size-base);
  font-weight: 600;
  min-width: 260px;
  text-align: center;
}

.rj-body {
  display: flex;
  gap: 16px;
  min-height: 500px;
}

.doctor-list {
  width: 200px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.doctor-list-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.doctor-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-bottom: 4px;
  transition: background var(--transition-fast);
}
.doctor-item:hover { background: var(--color-primary-light); }
.doctor-item.active { background: var(--color-primary-light); }

.doctor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.doctor-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-grid {
  flex: 1;
  position: relative;
}

.patient-results {
  position: absolute;
  z-index: 10;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
}

.patient-result-item {
  padding: 10px 14px;
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-light);
}
.patient-result-item:hover { background: var(--color-primary-light); }
.patient-result-item:last-child { border-bottom: none; }

.selected-patient-info { background: var(--color-primary-light); }

.patient-detail-info p { margin-bottom: 4px; font-size: var(--font-size-sm); }
</style>
