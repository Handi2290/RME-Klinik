import prisma from '../config/database.js'
import { generateNoRM } from '../utils/idGenerator.js'

export const patientsController = {
  async list(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query
      const skip = (parseInt(page) - 1) * parseInt(limit)

      const where = search
        ? {
            OR: [
              { namaPasien: { contains: search, mode: 'insensitive' } },
              { noRm: { contains: search, mode: 'insensitive' } },
              { noKtp: { contains: search, mode: 'insensitive' } },
              { noHp: { contains: search, mode: 'insensitive' } },
              { noAsuransi: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const [data, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: { allergies: true },
        }),
        prisma.patient.count({ where }),
      ])

      res.json({ data, total, page: parseInt(page), limit: parseInt(limit) })
    } catch (error) {
      next(error)
    }
  },

  async getById(req, res, next) {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          allergies: true,
          visits: {
            orderBy: { tglKunjungan: 'desc' },
            take: 10,
            include: {
              dokter: { select: { namaStaf: true } },
              medicalRecord: {
                include: {
                  diagnoses: { include: { icd10: true } },
                  prescriptions: true,
                },
              },
            },
          },
        },
      })
      if (!patient) return res.status(404).json({ error: 'Pasien tidak ditemukan' })
      res.json(patient)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const noRm = await generateNoRM()
      const patient = await prisma.patient.create({
        data: { ...req.body, noRm },
        include: { allergies: true },
      })
      res.status(201).json(patient)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const patient = await prisma.patient.update({
        where: { id: parseInt(req.params.id) },
        data: req.body,
        include: { allergies: true },
      })
      res.json(patient)
    } catch (error) {
      next(error)
    }
  },

  async getHistory(req, res, next) {
    try {
      const visits = await prisma.visit.findMany({
        where: { patientId: parseInt(req.params.id) },
        orderBy: { tglKunjungan: 'desc' },
        include: {
          dokter: { select: { namaStaf: true } },
          medicalRecord: {
            include: {
              vitalSigns: true,
              diagnoses: { include: { icd10: true } },
              prescriptions: true,
              medicalLetters: true,
            },
          },
        },
      })
      res.json(visits)
    } catch (error) {
      next(error)
    }
  },
}
