<template>
  <div class="antrean-view">
    <div class="page-header">
      <h3>Antrean Apotek</h3>
      <div class="flex gap-sm">
        <div class="tabs">
          <button class="tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">BELUM SELESAI</button>
          <button class="tab" :class="{ active: activeTab === 'done' }" @click="activeTab = 'done'">SUDAH SELESAI</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay"><div class="spinner"></div></div>

    <div v-else class="antrean-list">
      <TimelineGrid 
        :loading="loading"
        :visits="filteredVisits"
        :start-date="new Date()"
        :days-to-show="1"
        :start-time="clinicSettings.jam_buka"
        :end-time="clinicSettings.jam_tutup"
        @click-visit="openVisit"
      />

      <div v-if="expandedId" class="modal-overlay" @click.self="expandedId = null">
        <div class="modal-dialog" style="width: 500px">
          <div class="modal-header">
            <h3>Detail Antrean Apotek</h3>
            <button class="modal-close" @click="expandedId = null">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="expandedVisit" class="card mb-md">
              <div class="card-body">
                <div class="flex items-center gap-md">
                  <span class="badge badge-primary">{{ expandedVisit.noAntrean }}</span>
                  <div>
                    <strong>{{ expandedVisit.patient?.namaPasien }}</strong>
                    <p class="text-muted" style="font-size:12px;">No RM: {{ expandedVisit.patient?.noRm }} · {{ expandedVisit.patient?.tipePasien }}</p>
                  </div>
                </div>
                <div class="antrean-info">
                  <p><strong>Dokter:</strong> {{ expandedVisit.dokter?.namaStaf || '-' }}</p>
                  <p><strong>Poli:</strong> {{ expandedVisit.poli }}</p>
                </div>
              </div>
            </div>

            <div v-if="expandedVisit?.medicalRecord?.prescriptions?.length" class="mt-md">
              <h5 class="mb-sm">Resep Obat</h5>
              <table class="data-table">
                <thead><tr><th>Nama Obat</th><th>Jumlah</th><th>Aturan Pakai</th><th>Catatan</th></tr></thead>
                <tbody>
                  <tr v-for="p in expandedVisit.medicalRecord.prescriptions" :key="p.id">
                    <td>{{ p.namaObat }}</td>
                    <td>{{ p.jumlah }} {{ p.satuan }}</td>
                    <td>{{ p.aturanPakai || '-' }}</td>
                    <td>{{ p.catatan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-muted mt-md">Belum ada resep obat</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="expandedId = null">Tutup</button>
            <button class="btn btn-success" @click="markDone(expandedVisit)">SELESAIKAN ANTREAN</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatAge } from '@/utils/formatters'
import TimelineGrid from '@/components/TimelineGrid.vue'

const api = useApi()
const loading = ref(false)
const visits = ref([])
const activeTab = ref('pending')
const expandedId = ref(null)
const expandedVisit = ref(null)
const clinicSettings = ref({ jam_buka: '08:00', jam_tutup: '21:00' })

const filteredVisits = computed(() => {
  if (activeTab.value === 'done') return visits.value.filter(v => v.statusAntrean === 'SUCCEED')
  return visits.value.filter(v => v.statusAntrean !== 'SUCCEED')
})

onMounted(loadQueue)

async function loadQueue() {
  loading.value = true
  try {
    const [visitsRes, settingsRes] = await Promise.all([
      api.get('/visits/today'),
      api.get('/settings')
    ])
    visits.value = visitsRes.data
    if (settingsRes.data) {
      clinicSettings.value.jam_buka = settingsRes.data.jam_buka || '08:00'
      clinicSettings.value.jam_tutup = settingsRes.data.jam_tutup || '21:00'
    }
  } catch {} finally { loading.value = false }
}

function openVisit(visit) { 
  expandedId.value = visit.id
  expandedVisit.value = visit
}

async function markDone(visit) {
  try {
    await api.patch(`/visits/${visit.id}/status`, { status: 'SUCCEED' })
    loadQueue()
    window.__toast?.('Antrean selesai', 'success')
  } catch {}
}
</script>

<style scoped>
.antrean-list { position: relative; }

.antrean-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: var(--font-size-sm); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-light); }

</style>
