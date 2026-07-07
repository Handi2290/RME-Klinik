import prisma from '../config/database.js'
import { generateInvoiceNo, generateKwitansiNo } from '../utils/idGenerator.js'

export const invoicesController = {
  async list(req, res, next) {
    try {
      const { search, status, from, to, page = 1, limit = 10 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = {}

      if (search) {
        where.OR = [
          { noInvoice: { contains: search, mode: 'insensitive' } },
          { visit: { patient: { namaPasien: { contains: search, mode: 'insensitive' } } } },
        ]
      }
      if (status) where.statusBayar = status
      if (from || to) {
        where.createdAt = {}
        if (from) where.createdAt.gte = new Date(from)
        if (to) {
          const endDate = new Date(to)
          endDate.setHours(23, 59, 59, 999)
          where.createdAt.lte = endDate
        }
      }

      const [data, total] = await Promise.all([
        prisma.invoice.findMany({
          where, skip, take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payments: true,
            visit: {
              include: {
                patient: true,
                dokter: { select: { namaStaf: true } },
                medicalRecord: { include: { prescriptions: true } },
              },
            },
          },
        }),
        prisma.invoice.count({ where }),
      ])
      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const noInvoice = await generateInvoiceNo()
      const { visitId, items, metodeBayar, catatan } = req.body

      let totalBayar = 0
      const itemsData = (items || []).map((item) => {
        const total = (item.harga * item.jumlah) - (item.diskon || 0)
        totalBayar += total
        return { ...item, totalHarga: total }
      })

      const invoice = await prisma.invoice.create({
        data: {
          visitId: parseInt(visitId),
          noInvoice,
          totalBayar,
          metodeBayar: metodeBayar || 'TUNAI',
          catatan,
          items: { create: itemsData },
        },
        include: { items: true, visit: { include: { patient: true } } },
      })
      res.status(201).json(invoice)
    } catch (error) {
      next(error)
    }
  },

  async processPayment(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const { nominal, metodeBayar, penanggungJawab } = req.body

      const noKwitansi = await generateKwitansiNo()

      const payment = await prisma.payment.create({
        data: {
          invoiceId: id,
          nominal: parseFloat(nominal),
          metodeBayar: metodeBayar || 'TUNAI',
          penanggungJawab,
        },
      })

      // Calculate total paid
      const payments = await prisma.payment.findMany({ where: { invoiceId: id } })
      const totalPaid = payments.reduce((sum, p) => sum + p.nominal, 0)
      const invoice = await prisma.invoice.findUnique({ where: { id } })

      const statusBayar = totalPaid >= (invoice?.totalBayar || 0) ? 'LUNAS' : 'BELUM_LUNAS'

      await prisma.invoice.update({
        where: { id },
        data: { statusBayar, noKwitansi, dibayarOleh: penanggungJawab },
      })

      res.json({ payment, statusBayar, totalPaid })
    } catch (error) {
      next(error)
    }
  },

  async getPaymentHistory(req, res, next) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          items: true,
          payments: { orderBy: { tanggal: 'desc' } },
          visit: {
            include: {
              patient: true,
              dokter: { select: { namaStaf: true } },
            },
          },
        },
      })
      if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' })
      res.json(invoice)
    } catch (error) {
      next(error)
    }
  },
}
