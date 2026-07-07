import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { config } from './config/env.js'
import { authMiddleware } from './middleware/auth.js'
import { licenseMiddleware } from './middleware/license.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import licenseRoutes from './routes/license.routes.js'
import patientsRoutes from './routes/patients.routes.js'
import visitsRoutes from './routes/visits.routes.js'
import medicalRecordsRoutes from './routes/medicalRecords.routes.js'
import prescriptionsRoutes from './routes/prescriptions.routes.js'
import medicinesRoutes from './routes/medicines.routes.js'
import consumablesRoutes from './routes/consumables.routes.js'
import invoicesRoutes from './routes/invoices.routes.js'
import medicalLettersRoutes from './routes/medicalLetters.routes.js'
import icd10Routes from './routes/icd10.routes.js'
import staffRoutes from './routes/staff.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import exportRoutes from './routes/export.routes.js'
import ddiRoutes from './routes/ddi.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Buat folder uploads jika belum ada
const uploadsDir = path.resolve(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Static files
app.use('/uploads', express.static(uploadsDir))

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/license', licenseRoutes)

// License protected routes
app.use(licenseMiddleware)

// Protected routes
app.use('/api/patients', authMiddleware, patientsRoutes)
app.use('/api/visits', authMiddleware, visitsRoutes)
app.use('/api/medical-records', authMiddleware, medicalRecordsRoutes)
app.use('/api/prescriptions', authMiddleware, prescriptionsRoutes)
app.use('/api/medicines', authMiddleware, medicinesRoutes)
app.use('/api/consumables', authMiddleware, consumablesRoutes)
app.use('/api/invoices', authMiddleware, invoicesRoutes)
app.use('/api/medical-letters', authMiddleware, medicalLettersRoutes)
app.use('/api/icd10', authMiddleware, icd10Routes)
app.use('/api/staff', authMiddleware, staffRoutes)
app.use('/api/settings', authMiddleware, settingsRoutes)
app.use('/api/export', authMiddleware, exportRoutes)
app.use('/api/ddi', authMiddleware, ddiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  console.log(`🏥 RME Klinik Server berjalan di port ${config.port}`)
  console.log(`📋 API: http://localhost:${config.port}/api`)
  console.log(`🔧 Mode: ${config.nodeEnv}`)
})

export default app
