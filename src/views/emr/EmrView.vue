<template>
  <div class="emr-layout-wrapper">
    <!-- EMR Top Header Area -->
    <div class="emr-top-header">
      <div class="emr-search-area">
        <div class="search-input-wrapper">
          <input v-model="searchQuery" type="text" placeholder="Cari Pasien / No MR / No KTP / No Asuransi..." class="form-input" />
          <User class="search-icon-right" :size="16" />
        </div>
        <button class="btn btn-primary ml-sm">Advance Search</button>
      </div>
      
      <div class="emr-title-area">
        <div>
          <h2 style="color: var(--color-primary-dark); margin: 0;">Electronic Medical Record</h2>
          <p style="color: var(--color-primary); margin: 0; font-size: 14px;">Klinik Keluarga Sehat</p>
        </div>
        <div class="status-legend">
          <span v-for="s in statuses" :key="s.key" class="legend-item">
            <span class="legend-dot" :style="{ background: s.color }"></span>{{ s.label }}
          </span>
          <button class="btn btn-outline btn-icon ml-md"><Printer :size="18" /></button>
          <button class="btn btn-outline btn-icon ml-sm" @click="loadQueueData"><RefreshCw :size="18" /></button>
        </div>
      </div>
    </div>

    <!-- EMR Main Split Layout -->
    <div class="emr-split-layout">
      
      <!-- Left Sidebar: Patient List -->
      <div class="emr-left-sidebar">
        <select v-model="queueFilter" @change="loadQueueData" class="form-select queue-filter-select">
          <option value="today">Hari Ini</option>
          <option value="all">Semua</option>
        </select>
        
        <div class="patient-list-container" v-if="!loading">
          <div 
            v-for="visit in filteredQueue" 
            :key="visit.id" 
            class="patient-list-item"
            :class="{ active: selectedVisit?.id === visit.id }"
            @click="openVisit(visit)"
          >
            {{ visit.patient?.namaPasien?.toUpperCase() }}
          </div>
          <div v-if="filteredQueue.length === 0" class="p-md text-center text-muted">
            Tidak ada pasien
          </div>
        </div>
        <div v-else class="p-md text-center">Loading...</div>
      </div>

      <!-- Center & Right: Patient Detail -->
      <div class="emr-main-content">
        <template v-if="selectedVisit">
          <!-- Patient Profile Card -->
          <div class="patient-profile-card">
            <div class="profile-avatar">
              <User :size="80" color="#ccc" />
            </div>
            <div class="profile-info">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="patient-name">{{ selectedVisit.patient?.namaPasien?.toUpperCase() }}</h2>
                  <p class="patient-sub">
                    {{ selectedVisit.patient?.noRm }} · {{ formatGender(selectedVisit.patient?.jenisKelamin) }} · {{ formatAge(selectedVisit.patient?.tglLahir) }}
                  </p>
                  <p class="patient-sub">{{ formatDate(selectedVisit.patient?.tglLahir) }}</p>
                </div>
                <button class="btn btn-outline btn-sm">EDIT DATA DIRI</button>
              </div>
              <div class="patient-details-grid">
                <div>
                  <strong>Alamat Rumah <EyeOff :size="14" class="inline-icon" /></strong>
                  <p>{{ selectedVisit.patient?.alamat || '-' }}</p>
                </div>
                <div>
                  <strong>Nomor KTP <EyeOff :size="14" class="inline-icon" /></strong>
                  <p>{{ selectedVisit.patient?.nik || '-' }}</p>
                </div>
                <div>
                  <strong>Nomor HP <EyeOff :size="14" class="inline-icon" /></strong>
                  <p>{{ selectedVisit.patient?.noHp || '-' }}</p>
                </div>
              </div>
              <div class="text-right mt-sm">
                <a href="#" class="text-primary" style="font-size: 13px;">Lihat data lainnya ></a>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="emr-tabs">
            <button class="emr-tab-btn" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'">TIMELINE</button>
            <button class="emr-tab-btn" :class="{ active: activeTab === 'record' }" @click="activeTab = 'record'">RECORD</button>
          </div>

          <!-- Tab Content -->
          <div class="emr-tab-content" v-if="activeTab === 'timeline'">
            <div class="emr-timeline-grid">
              
              <!-- EMR Form Area -->
              <div class="emr-form-area">
                
                <div class="visit-header-card mb-md">
                  <div class="visit-date-badge">
                    <span class="day">{{ getDay(selectedVisit.tglKunjungan) }}</span>
                    <span class="month-year">{{ getMonthYear(selectedVisit.tglKunjungan) }}</span>
                  </div>
                  <div class="visit-header-info">
                    <p class="poli-info">Poli {{ selectedVisit.poli }} dengan <span class="text-primary">{{ selectedVisit.dokter?.namaStaf }}</span></p>
                    <div class="payment-method-box">
                      Metode Pembayaran: {{ selectedVisit.tipePasien || 'Umum' }}
                    </div>
                    <div class="visit-time-info text-muted">
                      {{ selectedVisit.jamKunjungan }} WIB selama - menit
                    </div>
                  </div>
                  <div class="visit-header-actions">
                    <Printer :size="18" class="action-icon" />
                    <Eye :size="18" class="action-icon" />
                    <button class="btn btn-success btn-sm flex items-center gap-xs" @click="saveSoap">DONE <ChevronDown :size="14" /></button>
                  </div>
                </div>

                <!-- Dropdowns Header -->
                <div class="emr-status-dropdowns mb-md">
                  <div class="form-group">
                    <label class="form-label text-primary" style="font-size: 16px;">Kesadaran</label>
                    <select v-model="medicalRecordForm.kesadaran" class="form-select border-bottom-only">
                      <option value="Compos Mentis">Compos Mentis</option>
                      <option value="Apatis">Apatis</option>
                      <option value="Somnolen">Somnolen</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label text-primary" style="font-size: 16px;">Prognosa</label>
                    <select v-model="medicalRecordForm.prognosa" class="form-select border-bottom-only">
                      <option value="Sanam (Sembuh)">Sanam (Sembuh)</option>
                      <option value="Dubia">Dubia</option>
                      <option value="Malam">Malam</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label text-primary" style="font-size: 16px;">Status Pulang</label>
                    <select v-model="medicalRecordForm.statusPulang" class="form-select border-bottom-only">
                      <option value="Berobat Jalan">Berobat Jalan</option>
                      <option value="Rujuk">Rujuk</option>
                      <option value="Sembuh">Sembuh</option>
                    </select>
                  </div>
                </div>

                <!-- Vital Signs Block -->
                <div class="vitals-block mb-lg">
                  <div class="flex justify-between items-end mb-sm">
                    <h3 class="text-primary" style="margin:0;">VITAL SIGNS <span style="font-size:12px;color:#f9a825">{{ formatDateTime(medicalRecord?.createdAt || new Date()) }}</span></h3>
                    <span class="text-muted" style="font-size: 12px;">by <span class="text-primary">{{ selectedVisit.dokter?.namaStaf }}</span></span>
                  </div>
                  <div class="vitals-table-grid">
                    <div class="vital-row">
                      <span class="v-label">Weight</span>
                      <span class="v-val"><input v-model.number="vitalsForm.beratBadan" type="number" class="inline-input" /> Kg</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Sistole</span>
                      <span class="v-val"><input v-model.number="vitalsForm.sistole" type="number" class="inline-input" /> mmHg</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Height</span>
                      <span class="v-val"><input v-model.number="vitalsForm.tinggiBadan" type="number" class="inline-input" /> cm</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Diastole</span>
                      <span class="v-val"><input v-model.number="vitalsForm.diastole" type="number" class="inline-input" /> mmHg</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Temperature</span>
                      <span class="v-val"><input v-model.number="vitalsForm.suhu" type="number" step="0.1" class="inline-input" /> °Celcius</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Pulse</span>
                      <span class="v-val"><input v-model.number="vitalsForm.nadi" type="number" class="inline-input" /> Heart Beats / min</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Blood Sugar</span>
                      <span class="v-val"><input v-model.number="vitalsForm.gulaDarah" type="number" class="inline-input" /> mg / dL</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Resp. Rate</span>
                      <span class="v-val"><input v-model.number="vitalsForm.respirasi" type="number" class="inline-input" /> Breaths / min</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Oxygen Saturation</span>
                      <span class="v-val"><input v-model.number="vitalsForm.saturasiO2" type="number" class="inline-input" /> %</span>
                    </div>
                    <div class="vital-row">
                      <span class="v-label">Lingkar Perut</span>
                      <span class="v-val"><input v-model.number="vitalsForm.lingkarPerut" type="number" class="inline-input" /> cm</span>
                    </div>
                  </div>
                  <div class="text-right mt-sm">
                    <button class="btn btn-outline btn-sm" @click="saveVitals">Simpan Vitals</button>
                  </div>
                </div>

                <!-- Diagnosa Section -->
                <div class="emr-section mb-lg">
                  <div class="flex justify-between items-end mb-sm">
                    <h3 class="text-primary" style="margin:0; text-transform: uppercase;">DIAGNOSA</h3>
                    <span class="text-muted" style="font-size: 12px;">by <span class="text-primary">{{ selectedVisit.dokter?.namaStaf }}</span></span>
                  </div>
                  <div class="emr-section-box">
                    <!-- existing diagnoses -->
                    <div v-for="d in diagnoses" :key="d.id" class="diagnosa-row">
                      {{ d.icdCode }} {{ d.deskripsi || d.icd10?.description }} <span class="text-muted">({{ formatDateTime(d.createdAt) }})</span>
                      <button class="btn btn-ghost btn-sm text-danger" @click="removeDiagnosis(d)">&times;</button>
                    </div>
                    <div class="mt-sm" v-if="showAddDiagnosa">
                      <input v-model="icdSearch" type="text" class="form-input" placeholder="Cari ICD-10..." @input="searchICD" />
                      <div v-if="icdResults.length" class="icd-results-dropdown">
                        <div v-for="icd in icdResults" :key="icd.id" class="icd-result-item" @click="addDiagnosis(icd)">
                          <strong>{{ icd.code }}</strong> — {{ icd.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Catatan Dokter (SOAP) -->
                <div class="emr-section mb-lg">
                  <div class="flex justify-between items-end mb-sm">
                    <h3 class="text-primary" style="margin:0; text-transform: uppercase;">CATATAN DOKTER <span style="font-size:12px;color:#f9a825">{{ formatDateTime(medicalRecord?.createdAt || new Date()) }}</span></h3>
                    <span class="text-muted" style="font-size: 12px;">by <span class="text-primary">{{ selectedVisit.dokter?.namaStaf }}</span></span>
                  </div>
                  <div class="emr-section-box no-pad">
                    <table class="soap-table">
                      <tbody>
                        <tr>
                          <td class="soap-label">Subjektif</td>
                          <td class="soap-input"><textarea v-model="soapForm.subjective" class="form-textarea borderless" rows="1"></textarea></td>
                        </tr>
                        <tr>
                          <td class="soap-label">Objective</td>
                          <td class="soap-input"><textarea v-model="soapForm.objective" class="form-textarea borderless" rows="1"></textarea></td>
                        </tr>
                        <tr>
                          <td class="soap-label">Assesment</td>
                          <td class="soap-input"><textarea v-model="soapForm.assessment" class="form-textarea borderless" rows="1"></textarea></td>
                        </tr>
                        <tr>
                          <td class="soap-label">Plan</td>
                          <td class="soap-input"><textarea v-model="soapForm.plan" class="form-textarea borderless" rows="1"></textarea></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Resep -->
                <div class="emr-section mb-lg">
                  <div class="flex justify-between items-end mb-sm">
                    <h3 class="text-primary" style="margin:0; text-transform: uppercase;">RESEP</h3>
                    <span class="text-muted" style="font-size: 12px;">Oleh <span class="text-primary">{{ selectedVisit.dokter?.namaStaf }}</span></span>
                  </div>
                  <div class="emr-section-box no-pad">
                    <table class="emr-data-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Signatura</th>
                          <th>Jumlah</th>
                          <th>Harga</th>
                          <th>Tanggal Input</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="presc in existingPrescriptions" :key="presc.id">
                          <td>{{ presc.namaObat }}</td>
                          <td>{{ presc.aturanPakai }}</td>
                          <td>{{ presc.jumlah }} {{ presc.satuan }}</td>
                          <td>-</td>
                          <td>{{ formatDateTime(presc.createdAt) }}</td>
                          <td></td>
                        </tr>
                        <!-- Inline Add Prescription -->
                        <tr v-if="showAddResep">
                          <td>
                            <input v-model="newPrescription.medicineSearch" type="text" class="form-input btn-sm" placeholder="Cari obat..." @input="searchMedicine" />
                            <div v-if="medicineResults?.length" class="icd-results-dropdown">
                              <div v-for="med in medicineResults" :key="med.id" class="icd-result-item" @click="selectMedicine(med)">
                                <strong>{{ med.namaObat }}</strong> — Stok: {{ med.stok }}
                              </div>
                            </div>
                          </td>
                          <td><input v-model="newPrescription.aturanPakai" type="text" class="form-input btn-sm" placeholder="3x1" /></td>
                          <td><input v-model.number="newPrescription.jumlah" type="number" class="form-input btn-sm" style="width: 60px" /></td>
                          <td>-</td>
                          <td>-</td>
                          <td><button class="btn btn-primary btn-sm" @click="saveNewPrescription">Add</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- DDI Alerts UI -->
                  <div v-if="ddiAlerts.length > 0" class="mt-md p-md" style="background: #FFF3CD; border: 1px solid #FFE69C; border-radius: 8px;">
                    <strong style="color: #856404; display: flex; align-items: center; gap: 8px;">
                      <AlertTriangle :size="18" /> Drug Interaction Warning (DDI)!
                    </strong>
                    <ul style="margin: 8px 0 0; padding-left: 20px; color: #856404; font-size: 13px;">
                      <li v-for="alert in ddiAlerts" :key="alert.id" class="mb-xs">
                        <span style="font-weight: 600;">[{{ alert.severity }}] {{ alert.ingredient1.name }} + {{ alert.ingredient2.name }}</span>
                        <br/>
                        {{ alert.description }}
                      </li>
                    </ul>
                  </div>
                  <div class="mt-sm">
                    <button class="btn btn-outline btn-sm" @click="showAddResep = !showAddResep">+ Tambah Resep</button>
                    <button class="btn btn-primary btn-sm ml-sm">Kirim Resep</button>
                  </div>

                </div>
                
                <!-- Keluhan -->
                <div class="emr-section mb-lg">
                  <div class="flex justify-between items-end mb-sm">
                    <h3 class="text-primary" style="margin:0; text-transform: uppercase;">KELUHAN</h3>
                    <span class="text-muted" style="font-size: 12px;">by <span class="text-primary">Admin/Perawat</span></span>
                  </div>
                  <div class="emr-section-box">
                    keluhan pasien: {{ selectedVisit.keluhan || '-' }}
                  </div>
                </div>

              </div>

              <!-- Right Actions Area -->
              <div class="emr-right-actions">
                <button class="btn btn-secondary-light w-full mb-sm text-muted" @click="showAddDiagnosa = true">+TAMBAH DIAGNOSA</button>
                <button class="btn btn-primary w-full mb-lg">PRINT REKAM MEDIS</button>

                <div class="accordion">
                  <div class="accordion-item">
                    <div class="accordion-header">RIWAYAT PENYAKIT <ChevronDown :size="16" /></div>
                  </div>
                  <div class="accordion-item">
                    <div class="accordion-header">RIWAYAT PENYAKIT KELUARGA <ChevronDown :size="16" /></div>
                  </div>
                  <div class="accordion-item">
                    <div class="accordion-header">RIWAYAT ALERGI <ChevronDown :size="16" /></div>
                    <div class="accordion-body" style="display:block" v-if="selectedVisit.patient?.allergies?.length">
                      <ul style="margin:0; padding-left: 16px;">
                        <li v-for="a in selectedVisit.patient.allergies" :key="a.id" class="text-danger text-sm">
                          {{ a.namaAlergi }} ({{ a.tipeAlergi }})
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <div class="accordion-header">RIWAYAT PENGGUNAAN OBAT <ChevronDown :size="16" /></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <div class="emr-tab-content" v-if="activeTab === 'record'">
             <div class="p-lg text-center text-muted">
               Riwayat Record Lengkap (Placeholder)
             </div>
          </div>
        </template>
        <template v-else>
          <div class="empty-state">
            <ClipboardList :size="48" class="text-muted mb-md" />
            <h3 class="text-muted">Pilih pasien dari daftar di sebelah kiri</h3>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatAge, formatGender, formatDate } from '@/utils/formatters'
import { User, Printer, Eye, ChevronDown, RefreshCw, EyeOff, ClipboardList, AlertTriangle } from 'lucide-vue-next'

const api = useApi()

// Layout state
const activeTab = ref('timeline')
const queueFilter = ref('today') // 'today' or 'all'

const searchQuery = ref('')
const queue = ref([])
const selectedVisit = ref(null)
const medicalRecord = ref(null)
const diagnoses = ref([])
const existingPrescriptions = ref([])
const loading = ref(false)
const ddiAlerts = ref([])
const isCheckingDDI = ref(false)

// Forms
const soapForm = ref({ subjective: '', objective: '', assessment: '', plan: '' })
const vitalsForm = ref({ beratBadan: null, tinggiBadan: null, suhu: null, tensi: '', sistole: null, diastole: null, nadi: null, respirasi: null, saturasiO2: null, gulaDarah: null, lingkarPerut: null })
const medicalRecordForm = ref({ kesadaran: 'Compos Mentis', prognosa: 'Sanam (Sembuh)', statusPulang: 'Berobat Jalan' })

const showAddDiagnosa = ref(false)
const showAddResep = ref(false)

const icdSearch = ref('')
const icdResults = ref([])

const newPrescription = ref({ medicineSearch: '', medicineId: null, namaObat: '', jumlah: 1, satuan: 'Tablet', aturanPakai: '' })
const medicineResults = ref([])

const statuses = [
  { key: 'PENDING', label: 'Pending', color: '#F44336' },
  { key: 'CONFIRMED', label: 'Confirmed', color: '#FF9800' },
  { key: 'WAITING', label: 'Waiting', color: '#9C27B0' },
  { key: 'ENGAGED', label: 'Engaged', color: '#2196F3' },
  { key: 'SUCCEED', label: 'Succeed', color: '#4CAF50' },
]

const filteredQueue = computed(() => {
  if (!searchQuery.value) return queue.value
  const q = searchQuery.value.toLowerCase()
  return queue.value.filter(v => v.patient?.namaPasien?.toLowerCase().includes(q) || v.patient?.noRm?.includes(q) || v.patient?.nik?.includes(q))
})

onMounted(loadQueueData)

async function loadQueueData() {
  loading.value = true
  try {
    const endpoint = queueFilter.value === 'today' ? '/visits/today' : '/visits?limit=100'
    const res = await api.get(endpoint)
    queue.value = res.data?.data || res.data // Handle both paginated and direct array
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function openVisit(visit) {
  selectedVisit.value = visit
  activeTab.value = 'timeline'
  
  // reset state
  showAddDiagnosa.value = false
  showAddResep.value = false
  medicalRecord.value = null
  diagnoses.value = []
  existingPrescriptions.value = []
  ddiAlerts.value = []
  soapForm.value = { subjective: '', objective: '', assessment: '', plan: '' }
  vitalsForm.value = { beratBadan: null, tinggiBadan: null, suhu: null, sistole: null, diastole: null, nadi: null, respirasi: null, saturasiO2: null, gulaDarah: null, lingkarPerut: null }

  try {
    const { data } = await api.get(`/medical-records/visit/${visit.id}`)
    if (data) {
      medicalRecord.value = data
      diagnoses.value = data.diagnoses || []
      existingPrescriptions.value = data.prescriptions || []
      checkDDI()
      soapForm.value = { subjective: data.subjective || '', objective: data.objective || '', assessment: data.assessment || '', plan: data.plan || '' }
      
      if (data.vitalSigns) {
        // Parse tensi into sistole/diastole if needed
        let sistole = null, diastole = null;
        if (data.vitalSigns.tensi) {
          const parts = data.vitalSigns.tensi.split('/')
          if(parts.length === 2) {
             sistole = parseInt(parts[0]); diastole = parseInt(parts[1])
          }
        }
        vitalsForm.value = { 
          ...data.vitalSigns,
          sistole, diastole
        }
      }
    }
  } catch {
    // Medical record not created yet
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function getDay(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).getDate()
}
function getMonthYear(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

// ICD Search
let icdTimeout = null
async function searchICD() {
  clearTimeout(icdTimeout)
  if (icdSearch.value.length < 2) { icdResults.value = []; return }
  icdTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/icd10/search', { q: icdSearch.value })
      icdResults.value = data
    } catch {}
  }, 300)
}

async function addDiagnosis(icd) {
  await ensureMedicalRecord()
  try {
    const { data } = await api.post('/medical-records/diagnoses', { mrId: medicalRecord.value.id, icdId: icd.id, icdCode: icd.code, deskripsi: icd.description })
    diagnoses.value.push(data)
    icdSearch.value = ''
    icdResults.value = []
    showAddDiagnosa.value = false
  } catch {}
}

async function removeDiagnosis(d) {
  try {
    await api.delete(`/medical-records/diagnoses/${d.id}`)
    diagnoses.value = diagnoses.value.filter(x => x.id !== d.id)
  } catch {}
}

// Medicine Search
let medTimeout = null
async function searchMedicine() {
  clearTimeout(medTimeout)
  if (newPrescription.value.medicineSearch.length < 2) { medicineResults.value = []; return }
  medTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/medicines', { search: newPrescription.value.medicineSearch, limit: 5 })
      medicineResults.value = data.data || []
    } catch {}
  }, 300)
}

function selectMedicine(med) {
  newPrescription.value.medicineId = med.id
  newPrescription.value.namaObat = med.namaObat
  newPrescription.value.satuan = med.satuan || 'Tablet'
  newPrescription.value.medicineSearch = med.namaObat
  medicineResults.value = []
}

async function ensureMedicalRecord() {
  if (!medicalRecord.value) {
     const { data } = await api.post('/medical-records', { visitId: selectedVisit.value.id })
     medicalRecord.value = data
  }
}

async function saveNewPrescription() {
  if (!newPrescription.value.namaObat) return
  await ensureMedicalRecord()
  try {
    const { data } = await api.post('/prescriptions', {
      mrId: medicalRecord.value.id,
      medicineId: newPrescription.value.medicineId,
      namaObat: newPrescription.value.namaObat,
      jumlah: newPrescription.value.jumlah,
      satuan: newPrescription.value.satuan,
      aturanPakai: newPrescription.value.aturanPakai,
    })
    existingPrescriptions.value.push(data)
    checkDDI()
    newPrescription.value = { medicineSearch: '', medicineId: null, namaObat: '', jumlah: 1, satuan: 'Tablet', aturanPakai: '' }
    showAddResep.value = false
  } catch(err) {
     window.__toast?.(err.response?.data?.error || 'Gagal menyimpan resep', 'error')
  }
}

async function saveVitals() {
  await ensureMedicalRecord()
  // Combine sistole and diastole into tensi if provided
  if (vitalsForm.value.sistole && vitalsForm.value.diastole) {
     vitalsForm.value.tensi = `${vitalsForm.value.sistole}/${vitalsForm.value.diastole}`
  }
  try {
    if (medicalRecord.value?.vitalSigns?.id) {
      await api.put(`/medical-records/vital-signs/${medicalRecord.value.vitalSigns.id}`, vitalsForm.value)
    } else {
      await api.post('/medical-records/vital-signs', { mrId: medicalRecord.value.id, ...vitalsForm.value })
    }
    window.__toast?.('Vital signs tersimpan', 'success')
  } catch {}
}

async function saveSoap() {
  await ensureMedicalRecord()
  try {
    await api.put(`/medical-records/${medicalRecord.value.id}`, soapForm.value)
    window.__toast?.('SOAP tersimpan', 'success')
  } catch {}
}

async function checkDDI() {
  const medicineIds = existingPrescriptions.value.map(p => p.medicineId).filter(Boolean)
  if (medicineIds.length < 2) {
    ddiAlerts.value = []
    return
  }
  isCheckingDDI.value = true
  try {
    const { data } = await api.get('/ddi/check-medicines', { medicines: medicineIds.join(',') })
    ddiAlerts.value = data.interactions || []
  } catch (err) {
    console.error('Failed to check DDI:', err)
  } finally {
    isCheckingDDI.value = false
  }
}

</script>


<style scoped>
.emr-layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg);
}

.emr-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid var(--color-border-light);
}

.emr-search-area {
  display: flex;
  align-items: center;
  width: 450px;
}
.search-input-wrapper {
  position: relative;
  flex: 1;
}
.search-input-wrapper .form-input {
  width: 100%;
  border-radius: 20px;
  padding-right: 36px;
}
.search-icon-right {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
}

.emr-title-area {
  display: flex;
  align-items: center;
  gap: 32px;
}
.status-legend {
  display: flex;
  align-items: center;
  gap: 16px;
}
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--color-text-secondary); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }

.emr-split-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Left Sidebar Queue */
.emr-left-sidebar {
  width: 260px;
  background-color: white;
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}
.queue-filter-select {
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  border-radius: 0;
  padding: 16px;
  font-weight: 500;
  color: var(--color-text);
}
.patient-list-container {
  flex: 1;
  overflow-y: auto;
}
.patient-list-item {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}
.patient-list-item:hover {
  background-color: var(--color-bg);
}
.patient-list-item.active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
}

/* Main Content */
.emr-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.patient-profile-card {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}
.profile-avatar {
  width: 160px;
  height: 160px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-info {
  flex: 1;
}
.patient-name {
  margin: 0 0 8px 0;
  color: var(--color-text);
}
.patient-sub {
  margin: 0 0 4px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}
.patient-details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.patient-details-grid strong {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
  color: var(--color-text);
}
.patient-details-grid p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.inline-icon {
  vertical-align: middle;
  color: var(--color-text-muted);
}

.emr-tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border-light);
  margin-bottom: 24px;
}
.emr-tab-btn {
  background: none;
  border: none;
  padding: 12px 32px;
  font-weight: 600;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  position: relative;
}
.emr-tab-btn.active {
  color: var(--color-primary);
}
.emr-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
}

.emr-timeline-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

/* Visit Header Card */
.visit-header-card {
  display: flex;
  gap: 16px;
  align-items: center;
  border-left: 4px solid var(--color-success);
  padding-left: 16px;
}
.visit-date-badge {
  text-align: center;
}
.visit-date-badge .day {
  display: block;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text);
}
.visit-date-badge .month-year {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.visit-header-info {
  flex: 1;
}
.poli-info {
  margin: 0 0 8px 0;
  font-size: 14px;
}
.payment-method-box {
  display: inline-block;
  border: 1px solid var(--color-border);
  padding: 4px 12px;
  font-size: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 8px;
}
.visit-time-info {
  font-size: 12px;
}
.visit-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.action-icon {
  color: var(--color-text-secondary);
  cursor: pointer;
}

/* Dropdowns */
.emr-status-dropdowns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 16px;
}
.border-bottom-only {
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  padding-left: 0;
  background-color: transparent;
}

/* Vitals Table */
.vitals-block {
  background-color: #fffaf0; /* Light yellow/orange tint */
  padding: 16px;
  border-radius: 4px;
}
.vitals-table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 32px;
}
.vital-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding: 6px 0;
  font-size: 13px;
}
.v-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}
.v-val {
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 4px;
}
.inline-input {
  width: 60px;
  border: none;
  background: transparent;
  text-align: right;
  border-bottom: 1px dashed var(--color-border);
  outline: none;
  font-weight: 600;
}
.inline-input:focus {
  border-bottom-color: var(--color-primary);
}

/* Emr Sections */
.emr-section-box {
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 12px;
}
.emr-section-box.no-pad {
  padding: 0;
}

.diagnosa-row {
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-border-light);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.icd-results-dropdown {
  background: white;
  border: 1px solid var(--color-border);
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  z-index: 10;
}
.icd-result-item {
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 13px;
}
.icd-result-item:hover {
  background: var(--color-primary-light);
}

.soap-table {
  width: 100%;
  border-collapse: collapse;
}
.soap-table td {
  border: 1px solid #eee;
  padding: 8px;
  font-size: 13px;
}
.soap-label {
  width: 120px;
  font-weight: 500;
  background-color: #fff;
}
.borderless {
  border: none;
  background: transparent;
  padding: 0;
  min-height: 24px;
  width: 100%;
}
.borderless:focus {
  box-shadow: none;
}

.emr-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.emr-data-table th, .emr-data-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.emr-data-table th {
  background-color: #fff;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Right Actions */
.btn-secondary-light {
  background-color: #e0e0e0;
  color: var(--color-text);
  border: none;
}
.accordion {
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
.accordion-item {
  border-bottom: 1px solid var(--color-border);
}
.accordion-item:last-child {
  border-bottom: none;
}
.accordion-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  background-color: white;
}
.accordion-body {
  padding: 16px;
  background-color: #fafafa;
  border-top: 1px solid var(--color-border-light);
}
</style>
