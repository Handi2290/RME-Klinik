import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'
import { config } from '../config/env.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        namaStaf: true,
        isActive: true,
        sessionToken: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'User tidak ditemukan' })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun tidak aktif' })
    }

    // Single session enforcement
    if (user.sessionToken !== token) {
      return res.status(401).json({ error: 'Sesi telah berakhir. Silakan login kembali.' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token sudah expired' })
    }
    next(error)
  }
}
