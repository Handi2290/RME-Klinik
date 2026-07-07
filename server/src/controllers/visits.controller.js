import prisma from '../config/database.js'
import { generateAntreanNo } from '../utils/idGenerator.js'

export const visitsController = {
  async list(req, res, next) {
    try {
      const { date, dokterId, status, page = 1, limit = 50 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)
      const where = {}

      if (req.query.startDate && req.query.endDate) {
        const start = new Date(req.query.startDate); start.setHours(0,0,0,0)
        const end = new Date(req.query.endDate); end.setHours(23,59,59,999)
        where.tglKunjungan = { gte: start, lte: end }
      } else if (date) {
        const d = new Date(date)
        const start = new Date(d); start.setHours(0,0,0,0)
        const end = new Date(d); end.setHours(23,59,59,999)
        where.tglKunjungan = { gte: start, lte: end }
      }
      if (dokterId) where.dokterId = parseInt(dokterId)
      if (status) where.statusAntrean = status

      const [data, total] = await Promise.all([
        prisma.visit.findMany({
          where, skip, take: parseInt(limit),
          orderBy: [{ tglKunjungan: 'asc' }, { jamKunjungan: 'asc' }],
          include: {
            patient: { include: { allergies: true } },
            dokter: { select: { id: true, namaStaf: true } },
          },
        }),
        prisma.visit.count({ where }),
      ])

      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async getToday(req, res, next) {
    try {
      const today = new Date()
      const start = new Date(today); start.setHours(0,0,0,0)
      const end = new Date(today); end.setHours(23,59,59,999)

      const data = await prisma.visit.findMany({
        where: { tglKunjungan: { gte: start, lte: end } },
        orderBy: [{ noAntrean: 'asc' }],
        include: {
          patient: { include: { allergies: true } },
          dokter: { select: { id: true, namaStaf: true } },
          medicalRecord: {
            include: { prescriptions: true, diagnoses: { include: { icd10: true } } },
          },
        },
      })

      res.json(data)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const tglKunjungan = new Date(req.body.tglKunjungan || new Date())
      const noAntrean = await generateAntreanNo(tglKunjungan)
      
      let patientId = req.body.patientId ? parseInt(req.body.patientId) : null;
      
      // Jika mendaftarkan pasien baru
      if (!patientId && req.body.newPatient) {
        const { namaPasien, jenisKelamin, tglLahir, noHp, tipePasien } = req.body.newPatient;
        // Generate No RM: yyyyMMdd + random 4 digit
        const noRm = new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(1000 + Math.random() * 9000);
        const patient = await prisma.patient.create({
          data: {
            noRm,
            namaPasien,
            jenisKelamin,
            tglLahir: new Date(tglLahir),
            noHp,
            tipePasien: tipePasien || 'Umum',
          }
        });
        patientId = patient.id;
      }

      if (!patientId) {
        return res.status(400).json({ error: 'Pasien tidak valid' });
      }

      // Pisahkan field untuk visit, buang yang khusus untuk MR/Vitals
      const { newPatient, vitalSigns, ...visitData } = req.body;

      const visit = await prisma.visit.create({
        data: {
          ...visitData,
          tglKunjungan,
          noAntrean,
          dokterId: req.body.dokterId ? parseInt(req.body.dokterId) : null,
          patientId,
          medicalRecord: {
            create: {
              tglPeriksa: tglKunjungan,
              subjective: req.body.keluhan || '',
              vitalSigns: vitalSigns ? {
                create: {
                  beratBadan: vitalSigns.beratBadan ? parseFloat(vitalSigns.beratBadan) : null,
                  tinggiBadan: vitalSigns.tinggiBadan ? parseFloat(vitalSigns.tinggiBadan) : null,
                  suhu: vitalSigns.suhu ? parseFloat(vitalSigns.suhu) : null,
                  tensi: vitalSigns.tensi || null,
                }
              } : undefined
            }
          }
        },
        include: {
          patient: true,
          dokter: { select: { id: true, namaStaf: true } },
        },
      })
      res.status(201).json(visit)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const visit = await prisma.visit.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
        include: { patient: true, dokter: { select: { id: true, namaStaf: true } } },
      })
      res.json(visit)
    } catch (error) {
      next(error)
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body
      const visit = await prisma.visit.update({
        where: { id: parseInt(req.params.id) },
        data: { statusAntrean: status },
        include: { patient: true, dokter: { select: { id: true, namaStaf: true } } },
      })
      res.json(visit)
    } catch (error) {
      next(error)
    }
  },

  async getQueueStats(req, res, next) {
    try {
      const today = new Date()
      const start = new Date(today); start.setHours(0,0,0,0)
      const end = new Date(today); end.setHours(23,59,59,999)

      const where = { tglKunjungan: { gte: start, lte: end } }
      const [total, handled] = await Promise.all([
        prisma.visit.count({ where }),
        prisma.visit.count({ where: { ...where, statusAntrean: 'SUCCEED' } }),
      ])
      res.json({ total, handled, pending: total - handled })
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.visit.delete({ where: { id: parseInt(req.params.id) } })
      res.json({ message: 'Kunjungan berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },
}
