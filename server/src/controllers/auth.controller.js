import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'
import { config } from '../config/env.js'

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi' })
      }

      const user = await prisma.user.findUnique({ where: { username } })
      if (!user) {
        return res.status(401).json({ error: 'Username atau password salah' })
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Akun tidak aktif. Hubungi administrator.' })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ error: 'Username atau password salah' })
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
      )

      // Single session: update token di database
      await prisma.user.update({
        where: { id: user.id },
        data: { sessionToken: token },
      })

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          namaStaf: user.namaStaf,
          jabatan: user.jabatan,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async logout(req, res, next) {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { sessionToken: null },
      })
      res.json({ message: 'Berhasil logout' })
    } catch (error) {
      next(error)
    }
  },

  async me(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          role: true,
          namaStaf: true,
          jabatan: true,
          email: true,
          noHp: true,
          isPic: true,
        },
      })
      res.json(user)
    } catch (error) {
      next(error)
    }
  },
}
