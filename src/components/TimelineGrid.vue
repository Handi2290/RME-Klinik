<template>
  <div class="timeline-grid-wrapper">
    <!-- Header Controls / Info -->
    <div v-if="loading" class="loading-overlay"><div class="spinner"></div></div>
    
    <div class="timeline-table-container">
      <table class="timeline-table">
        <thead>
          <tr>
            <th class="time-col-header">WAKTU</th>
            <th v-for="(day, index) in days" :key="index" class="day-col-header">
              <span v-if="index === 0 && daysToShow > 1">NOW</span>
              <span v-else>{{ formatHeaderDate(day.date) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timeSlot in timeSlots" :key="timeSlot">
            <td class="time-cell">{{ timeSlot }} WIB</td>
            <td v-for="(day, index) in days" :key="index" class="data-cell">
              <div class="slot-visits">
                <div 
                  v-for="visit in getVisitsForSlot(timeSlot, day.date)" 
                  :key="visit.id" 
                  class="visit-card"
                  :class="`status-${visit.statusAntrean?.toLowerCase()}`"
                  @click="$emit('click-visit', visit)"
                >
                  <div class="visit-card-header">
                    <span class="visit-queue badge" :class="`badge-${visit.statusAntrean?.toLowerCase()}`">{{ visit.noAntrean }}</span>
                    <span class="visit-time">{{ visit.jamKunjungan || '-' }}</span>
                  </div>
                  <div class="visit-card-body">
                    <p class="visit-patient-name">{{ visit.patient?.namaPasien }}</p>
                    <p class="visit-detail">{{ visit.patient?.noRm }} · {{ formatAge(visit.patient?.tglLahir) }}</p>
                    <p class="visit-detail">{{ visit.poli }} <span v-if="visit.dokter">· {{ visit.dokter?.namaStaf }}</span></p>
                  </div>
                  <div class="visit-card-footer">
                    <span class="badge" :class="`badge-${visit.statusAntrean?.toLowerCase()}`">{{ visit.statusAntrean }}</span>
                    <span class="visit-type">{{ visit.patient?.tipePasien || 'Umum' }}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatAge } from '@/utils/formatters'

const props = defineProps({
  visits: { type: Array, default: () => [] },
  startDate: { type: Date, default: () => new Date() },
  daysToShow: { type: Number, default: 1 },
  startTime: { type: String, default: '08:00' },
  endTime: { type: String, default: '21:00' },
  loading: { type: Boolean, default: false }
})

defineEmits(['click-visit'])

// Helper to format date like "KAMIS, 28 MEI"
function formatHeaderDate(date) {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']
  
  if (props.daysToShow === 1) {
    // If only 1 day, show full date
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()].substring(0, 3)}`
}

// Generate the days columns
const days = computed(() => {
  const arr = []
  for (let i = 0; i < props.daysToShow; i++) {
    const d = new Date(props.startDate)
    d.setDate(d.getDate() + i)
    arr.push({ date: d })
  }
  return arr
})

// Generate time slots (15-min intervals)
const timeSlots = computed(() => {
  const slots = []
  let [startH, startM] = props.startTime.split(':').map(Number)
  const [endH, endM] = props.endTime.split(':').map(Number)
  
  const endMinutes = endH * 60 + endM
  
  while (startH * 60 + startM <= endMinutes) {
    const h = String(startH).padStart(2, '0')
    const m = String(startM).padStart(2, '0')
    slots.push(`${h}:${m}`)
    
    startM += 15
    if (startM >= 60) {
      startM -= 60
      startH += 1
    }
  }
  return slots
})

function getVisitsForSlot(timeStr, dateObj) {
  return props.visits.filter(v => {
    if (!v.tglKunjungan) return false
    
    const vDate = new Date(v.tglKunjungan)
    const isSameDate = vDate.getFullYear() === dateObj.getFullYear() && 
                       vDate.getMonth() === dateObj.getMonth() && 
                       vDate.getDate() === dateObj.getDate()
                       
    if (!isSameDate) return false
    
    const vTime = v.jamKunjungan || props.startTime
    const [h, m] = vTime.split(':').map(Number)
    const vMinutes = h * 60 + m
    
    const [th, tm] = timeStr.split(':').map(Number)
    const slotStart = th * 60 + tm
    const slotEnd = slotStart + 15
    
    return vMinutes >= slotStart && vMinutes < slotEnd
  })
}
</script>

<style scoped>
.timeline-grid-wrapper {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.timeline-table-container {
  overflow-x: auto;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.timeline-table th, .timeline-table td {
  border: 1px solid var(--color-border-light);
}

.timeline-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-primary);
  color: white;
}

.time-col-header {
  width: 100px;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  background: #1976d2; /* Slightly darker primary */
}

.day-col-header {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.time-cell {
  text-align: center;
  padding: 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg);
  vertical-align: top;
}

.data-cell {
  padding: 6px;
  vertical-align: top;
  min-width: 260px;
}

.slot-visits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Visit Card Styles */
.visit-card { 
  background: var(--color-surface); 
  border-radius: var(--radius-md); 
  padding: 10px; 
  box-shadow: var(--shadow-sm); 
  cursor: pointer; 
  transition: all var(--transition-fast); 
  border-left: 4px solid var(--color-border); 
}
.visit-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.visit-card.status-pending { border-left-color: var(--color-pending); }
.visit-card.status-confirmed { border-left-color: var(--color-confirmed); }
.visit-card.status-waiting { border-left-color: var(--color-waiting); }
.visit-card.status-engaged { border-left-color: var(--color-engaged); }
.visit-card.status-succeed { border-left-color: var(--color-succeed); }

.visit-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.visit-queue { font-weight: 700; font-size: 11px; }
.visit-time { font-size: 11px; color: var(--color-text-muted); }

.visit-patient-name { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
.visit-detail { font-size: 11px; color: var(--color-text-muted); }

.visit-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.visit-type { font-size: 11px; color: var(--color-text-muted); }
</style>
