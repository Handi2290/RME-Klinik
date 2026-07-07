import { isValidLicenseKey, getLicenseKey } from '../utils/license.js'

export const validateLicense = (req, res) => {
  const { licenseKey } = req.body
  if (!licenseKey || !isValidLicenseKey(licenseKey)) {
    return res.status(400).json({ success: false, message: 'License key tidak valid.' })
  }

  return res.json({ success: true, key: getLicenseKey() })
}
