import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'

export const staffController = {
  async list(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = {}

      if (search) {
        where.OR = [
          { namaStaf: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [data, total] = await Promise.all([
        prisma.user.findMany({
          where, skip, take: parseInt(limit),
          orderBy: { namaStaf: 'asc' },
          select: {
            id: true, username: true, role: true, namaStaf: true,
            jabatan: true, noHp: true, email: true, noPegawai: true,
            isPic: true, isActive: true, createdAt: true, updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ])
      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { username, password, role, namaStaf, jabatan, noHp, email, noPegawai, catatan, isPic, isActive, tglLahir } = req.body
      const hashedPassword = await bcrypt.hash(password || 'default123', 10)

      const user = await prisma.user.create({
        data: {
          username, password: hashedPassword, role, namaStaf,
          jabatan, noHp, email, noPegawai, catatan, isPic,
          isActive: isActive !== undefined ? isActive : true,
          tglLahir: tglLahir ? new Date(tglLahir) : null,
        },
        select: {
          id: true, username: true, role: true, namaStaf: true,
          jabatan: true, noHp: true, email: true, isActive: true,
        },
      })
      res.status(201).json(user)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const data = { ...req.body }
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      } else {
        delete data.password
      }
      if (data.tglLahir) data.tglLahir = new Date(data.tglLahir)

      const user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data,
        select: {
          id: true, username: true, role: true, namaStaf: true,
          jabatan: true, noHp: true, email: true, isActive: true,
        },
      })
      res.json(user)
    } catch (error) {
      next(error)
    }
  },

  async toggleActive(req, res, next) {
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } })
      if (!user) return res.status(404).json({ error: 'Staff tidak ditemukan' })

      const updated = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: !user.isActive },
        select: { id: true, namaStaf: true, isActive: true },
      })
      res.json(updated)
    } catch (error) {
      next(error)
    }
  },

  async getDoctors(req, res, next) {
    try {
      const doctors = await prisma.user.findMany({
        where: { role: 'DOKTER', isActive: true },
        select: { id: true, namaStaf: true, jabatan: true },
        orderBy: { namaStaf: 'asc' },
      })
      res.json(doctors)
    } catch (error) {
      next(error)
    }
  },
}
