const LICENSE_KEY = process.env.LICENSE_KEY || 'RMEKLINIK-KEY-2026'

export function getLicenseKey() {
  return LICENSE_KEY
}

export function isValidLicenseKey(key) {
  return String(key || '').trim() === LICENSE_KEY
}
