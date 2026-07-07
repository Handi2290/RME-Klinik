import multer from 'multer'
import path from 'path'
import { config } from '../config/env.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, SVG, WebP)'), false)
  }
}

const importFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  const allowedExts = ['.json', '.xlsx', '.xls']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Hanya file JSON atau Excel yang diperbolehkan'), false)
  }
}

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: config.maxFileSize },
})

export const uploadImport = multer({
  storage: multer.memoryStorage(),
  fileFilter: importFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for import files
})
