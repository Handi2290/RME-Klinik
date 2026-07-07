<template>
  <div class="cashier-view">
    <div class="page-header">
      <h3>Pembayaran</h3>
      <button class="btn btn-success" @click="showPaymentModal = true"><Plus :size="16" /> Pembayaran</button>
    </div>

    <div class="flex gap-sm mb-md">
      <input v-model="from" type="date" class="form-input" style="width:auto" />
      <span class="flex items-center">—</span>
      <input v-model="to" type="date" class="form-input" style="width:auto" />
      <button class="btn btn-primary btn-sm" @click="loadData">FILTER</button>
    </div>

    <div class="card"><div class="card-body" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>No Invoice</th><th>Pasien</th><th>Tanggal</th><th>Total</th><th>Metode</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td>{{ inv.noInvoice }}</td>
            <td>{{ inv.visit?.patient?.namaPasien }}</td>
            <td>{{ formatDate(inv.createdAt) }}</td>
            <td>{{ formatCurrency(inv.totalBayar) }}</td>
            <td>{{ inv.metodeBayar }}</td>
            <td><span class="badge" :class="inv.statusBayar === 'LUNAS' ? 'badge-success' : 'badge-warning'">{{ inv.statusBayar }}</span></td>
            <td class="table-actions">
              <button class="btn btn-ghost btn-sm" @click="viewInvoice(inv)"><Eye :size="14" /></button>
              <button v-if="inv.statusBayar !== 'LUNAS'" class="btn btn-primary btn-sm" @click="payInvoice(inv)">Bayar</button>
              <button class="btn btn-ghost btn-sm" @click="printInvoice(inv)"><Printer :size="14" /></button>
            </td>
          </tr>
          <tr v-if="!invoices.length"><td colspan="7" class="text-center text-muted" style="padding:20px">Belum ada invoice</td></tr>
        </tbody>
      </table>
    </div></div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-dialog" style="width:700px">
        <div class="modal-header"><h3>Pembayaran</h3><button class="modal-close" @click="showPaymentModal = false">&times;</button></div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Cari Pasien/Visit</label>
            <input v-model="visitSearch" class="form-input" placeholder="Cari berdasarkan nama pasien..." @input="searchVisits" />
            <div v-if="visitResults.length" class="patient-results">
              <div v-for="v in visitResults" :key="v.id" class="patient-result-item" @click="selectVisitForPayment(v)">
                <strong>{{ v.patient?.namaPasien }}</strong> — {{ v.noAntrean }} · {{ v.poli }}
              </div>
            </div>
          </div>
          <div v-if="paymentVisit" class="card mb-md"><div class="card-body">
            <p><strong>{{ paymentVisit.patient?.namaPasien }}</strong> — {{ paymentVisit.patient?.noRm }}</p>
            <div class="form-row mt-md">
              <div class="form-group"><label class="form-label">Total Bayar</label><input v-model.number="paymentForm.totalBayar" type="number" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Metode Bayar</label>
                <select v-model="paymentForm.metodeBayar" class="form-select"><option value="TUNAI">Tunai</option><option value="QRIS">QRIS</option></select>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Dibayar Oleh</label><input v-model="paymentForm.dibayarOleh" class="form-input" /></div>
          </div></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showPaymentModal = false">Batal</button>
          <button class="btn btn-primary" @click="createInvoice" :disabled="!paymentVisit">Proses</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { Plus, Eye, Printer } from 'lucide-vue-next'
const api = useApi(); const invoices = ref([]); const from = ref(''); const to = ref('')
const showPaymentModal = ref(false); const visitSearch = ref(''); const visitResults = ref([]); const paymentVisit = ref(null)
const paymentForm = ref({ totalBayar: 0, metodeBayar: 'TUNAI', dibayarOleh: '' })
onMounted(loadData)
async function loadData() { try { const { data } = await api.get('/invoices', { from: from.value, to: to.value }); invoices.value = data.data } catch {} }
let t = null
async function searchVisits() { clearTimeout(t); if (visitSearch.value.length < 2) { visitResults.value = []; return }; t = setTimeout(async () => { try { const { data } = await api.get('/visits/today'); visitResults.value = data.filter(v => v.patient?.namaPasien?.toLowerCase().includes(visitSearch.value.toLowerCase())) } catch {} }, 300) }
function selectVisitForPayment(v) { paymentVisit.value = v; visitSearch.value = v.patient?.namaPasien; visitResults.value = [] }
async function createInvoice() {
  try {
    const { data } = await api.post('/invoices', { visitId: paymentVisit.value.id, items: [{ deskripsi: 'Konsultasi', jumlah: 1, harga: paymentForm.value.totalBayar, diskon: 0 }], metodeBayar: paymentForm.value.metodeBayar })
    await api.post(`/invoices/${data.id}/pay`, { nominal: paymentForm.value.totalBayar, metodeBayar: paymentForm.value.metodeBayar, penanggungJawab: paymentForm.value.dibayarOleh })
    showPaymentModal.value = false; paymentVisit.value = null; loadData()
    window.__toast?.('Pembayaran berhasil', 'success')
  } catch (err) { window.__toast?.(err.response?.data?.error || 'Gagal', 'error') }
}
async function payInvoice(inv) { try { const nominal = prompt('Jumlah bayar:', inv.totalBayar); if (!nominal) return; await api.post(`/invoices/${inv.id}/pay`, { nominal: parseFloat(nominal), metodeBayar: 'TUNAI' }); loadData(); window.__toast?.('Pembayaran berhasil', 'success') } catch {} }
function viewInvoice(inv) { /* TODO */ }
async function printInvoice(inv) { window.open(`/api/export/invoice/${inv.id}/pdf`, '_blank') }
</script>
<style scoped>
.patient-results{position:absolute;z-index:10;background:white;border:1px solid var(--color-border);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);max-height:200px;overflow-y:auto;width:100%}
.patient-result-item{padding:10px 14px;font-size:var(--font-size-sm);cursor:pointer;border-bottom:1px solid var(--color-border-light)}
.patient-result-item:hover{background:var(--color-primary-light)}
</style>
