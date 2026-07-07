import prisma from '../config/database.js'
import { generateMedicineCode, generateConsumableCode } from '../utils/idGenerator.js'

export const medicinesController = {
  async list(req, res, next) {
    try {
      const { search, kategori, page = 1, limit = 10 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = { isActive: true }

      if (search) {
        where.OR = [
          { namaObat: { contains: search, mode: 'insensitive' } },
          { kode: { contains: search, mode: 'insensitive' } },
          { farmasi: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (kategori) where.kategori = kategori

      const [data, total] = await Promise.all([
        prisma.medicine.findMany({ where, skip, take: parseInt(limit), orderBy: { namaObat: 'asc' } }),
        prisma.medicine.count({ where }),
      ])
      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const med = await prisma.medicine.findUnique({ where: { id: parseInt(req.params.id) } })
      if (!med) return res.status(404).json({ error: 'Obat tidak ditemukan' })
      res.json(med)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const kode = await generateMedicineCode()
      const medicine = await prisma.medicine.create({ data: { ...req.body, kode } })
      res.status(201).json(medicine)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const medicine = await prisma.medicine.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
      })
      res.json(medicine)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.medicine.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: false },
      })
      res.json({ message: 'Obat berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },

  async getLowStock(req, res, next) {
    try {
      const data = await prisma.medicine.findMany({
        where: { isActive: true, stok: { lte: 5 } },
        orderBy: { stok: 'asc' },
      })
      res.json(data)
    } catch (error) {
      next(error)
    }
  },

  async getNearExpiry(req, res, next) {
    try {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const data = await prisma.medicine.findMany({
        where: {
          isActive: true,
          tglExpired: { not: null, lte: thirtyDaysFromNow },
        },
        orderBy: { tglExpired: 'asc' },
      })
      res.json(data)
    } catch (error) {
      next(error)
    }
  },

  async restock(req, res, next) {
    try {
      const { id, jumlah } = req.body
      const medicine = await prisma.medicine.update({
        where: { id: parseInt(id) },
        data: { stok: { increment: parseInt(jumlah) } },
      })
      res.json(medicine)
    } catch (error) {
      next(error)
    }
  },
}

export const consumablesController = {
  async list(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = { isActive: true }

      if (search) {
        where.OR = [
          { namaBarang: { contains: search, mode: 'insensitive' } },
          { kode: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [data, total] = await Promise.all([
        prisma.consumable.findMany({ where, skip, take: parseInt(limit), orderBy: { namaBarang: 'asc' } }),
        prisma.consumable.count({ where }),
      ])
      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const kode = await generateConsumableCode()
      const item = await prisma.consumable.create({ data: { ...req.body, kode } })
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const item = await prisma.consumable.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
      })
      res.json(item)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.consumable.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: false },
      })
      res.json({ message: 'Barang berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },

  async getLowStock(req, res, next) {
    try {
      const data = await prisma.consumable.findMany({
        where: { isActive: true, stok: { lte: 5 } },
        orderBy: { stok: 'asc' },
      })
      res.json(data)
    } catch (error) {
      next(error)
    }
  },

  async getNearExpiry(req, res, next) {
    try {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      const data = await prisma.consumable.findMany({
        where: { isActive: true, tglExpired: { not: null, lte: thirtyDaysFromNow } },
        orderBy: { tglExpired: 'asc' },
      })
      res.json(data)
    } catch (error) {
      next(error)
    }
  },
}
