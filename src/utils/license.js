const INSTALL_DATE_KEY = 'rme_install_date'
const UNLOCKED_KEY = 'rme_license_unlocked'
const CONTACT_PHONE = '081298883337'
const CONTACT_EMAIL = 'handikomara22@gmail.com'
const TRIAL_DAYS = 14

function getInstallDate() {
  const stored = localStorage.getItem(INSTALL_DATE_KEY)
  if (stored) {
    const parsed = new Date(stored)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  const baseDate = new Date()
  localStorage.setItem(INSTALL_DATE_KEY, baseDate.toISOString())
  return baseDate
}

function getDaysUsed() {
  const installDate = getInstallDate()
  const now = new Date()
  const diff = now.getTime() - installDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getDaysRemaining() {
  return TRIAL_DAYS - getDaysUsed()
}

function isExpired() {
  return getDaysRemaining() < 0
}

function isUnlocked() {
  return localStorage.getItem(UNLOCKED_KEY) === 'true'
}

function markUnlocked() {
  localStorage.setItem(UNLOCKED_KEY, 'true')
}

function resetLicense() {
  localStorage.removeItem(UNLOCKED_KEY)
  localStorage.removeItem(INSTALL_DATE_KEY)
}

function computePin(phone, email) {
  let sum = 0
  const normalized = `${phone}|${email}`
  for (let i = 0; i < normalized.length; i += 1) {
    sum += normalized.charCodeAt(i)
  }
  const pin = (sum + 1971) % 10000
  return String(pin).padStart(4, '0')
}

function getLicensePin() {
  return computePin(CONTACT_PHONE, CONTACT_EMAIL)
}

function tryUnlock(pinValue) {
  if (String(pinValue).trim() === getLicensePin()) {
    markUnlocked()
    return true
  }
  return false
}

function getContactInfo() {
  return {
    phone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
  }
}

function getLicenseMessage() {
  return `Pendaftaran uji coba berlaku selama ${TRIAL_DAYS} hari. Setelah masa aktif berakhir, aplikasi akan terkunci secara otomatis.`
}

export {
  getInstallDate,
  getDaysUsed,
  getDaysRemaining,
  isExpired,
  isUnlocked,
  tryUnlock,
  resetLicense,
  getContactInfo,
  getLicensePin,
  getLicenseMessage,
}
