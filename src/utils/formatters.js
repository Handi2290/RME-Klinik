const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const DAYS_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']

export function formatCurrency(num) {
  if (num === null || num === undefined) return 'Rp0'
  return 'Rp' + Number(num).toLocaleString('id-ID')
}

export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins} WIB`
}

export function formatTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${mins} WIB`
}

export function formatDayDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

export function formatAge(birthDate) {
  if (!birthDate) return '-'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  
  if (age < 1) {
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth()
    return `${months} Bulan`
  }
  return `${age} Tahun`
}

export function formatPhoneMasked(phone) {
  if (!phone) return '-'
  if (phone.length <= 4) return phone
  return '*'.repeat(phone.length - 3) + phone.slice(-3)
}

export function formatEmailMasked(email) {
  if (!email) return '-'
  const [user, domain] = email.split('@')
  if (!domain) return email
  return user.charAt(0) + '***@' + domain
}

export function formatGender(gender) {
  if (gender === 'LAKI_LAKI') return 'Laki-laki'
  if (gender === 'PEREMPUAN') return 'Perempuan'
  return gender || '-'
}
