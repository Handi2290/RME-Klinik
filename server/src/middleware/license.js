import { isValidLicenseKey } from '../utils/license.js'

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/license/validate',
  '/api/health',
]

export const licenseMiddleware = (req, res, next) => {
  const path = req.originalUrl
  if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
    return next()
  }

  const licenseKey = req.headers['x-license-key'] || req.body?.licenseKey || req.query?.licenseKey
  if (licenseKey && !isValidLicenseKey(licenseKey)) {
    return res.status(401).json({ error: 'License key backend tidak valid.' })
  }

  next()
}
