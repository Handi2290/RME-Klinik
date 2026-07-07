import prisma from '../config/database.js'
import { importIcd10FromJSON, importIcd10FromExcel } from '../services/icd10Import.service.js'

export const icd10Controller = {
  async list(req, res, next) {
    try {
      const { search, category, chapter, page = 1, limit = 20 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = { isActive: true }

      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { descriptionId: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (category) where.category = category
      if (chapter) where.chapter = chapter

      const [data, total] = await Promise.all([
        prisma.icd10.findMany({ where, skip, take: parseInt(limit), orderBy: { code: 'asc' } }),
        prisma.icd10.count({ where }),
      ])
      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async search(req, res, next) {
    try {
      const { q } = req.query
      if (!q || q.length < 2) return res.json([])

      const results = await prisma.icd10.findMany({
        where: {
          isActive: true,
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { descriptionId: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 20,
        orderBy: { code: 'asc' },
      })
      res.json(results)
    } catch (error) {
      next(error)
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await prisma.icd10.findMany({
        where: { isActive: true, category: { not: null } },
        distinct: ['category'],
        select: { category: true, categoryName: true, chapter: true },
        orderBy: { category: 'asc' },
      })
      res.json(categories)
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const icd = await prisma.icd10.findUnique({ where: { id: parseInt(req.params.id) } })
      if (!icd) return res.status(404).json({ error: 'Kode ICD-10 tidak ditemukan' })
      res.json(icd)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const icd = await prisma.icd10.create({ data: req.body })
      res.status(201).json(icd)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const icd = await prisma.icd10.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
      })
      res.json(icd)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.icd10.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: false },
      })
      res.json({ message: 'Kode ICD-10 berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },

  async import(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' })

      let results
      const ext = req.file.originalname.split('.').pop().toLowerCase()

      if (ext === 'json') {
        const jsonData = JSON.parse(req.file.buffer.toString())
        results = await importIcd10FromJSON(Array.isArray(jsonData) ? jsonData : [jsonData])
      } else if (['xlsx', 'xls'].includes(ext)) {
        results = await importIcd10FromExcel(req.file.buffer)
      } else {
        return res.status(400).json({ error: 'Format file tidak didukung' })
      }

      res.json(results)
    } catch (error) {
      next(error)
    }
  },
}
