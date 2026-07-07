import prisma from '../config/database.js'
import { calculateBMI } from '../utils/bmiCalculator.js'

export const medicalRecordsController = {
  async getByVisit(req, res, next) {
    try {
      const record = await prisma.medicalRecord.findUnique({
        where: { visitId: parseInt(req.params.visitId) },
        include: {
          vitalSigns: true,
          diagnoses: { include: { icd10: true } },
          prescriptions: { include: { medicine: true } },
          medicalLetters: true,
          editHistory: { orderBy: { changedAt: 'desc' } },
          visit: { include: { patient: { include: { allergies: true } }, dokter: { select: { namaStaf: true } } } },
        },
      })
      if (!record) return res.status(404).json({ error: 'Rekam medis tidak ditemukan' })
      res.json(record)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { visitId, subjective, objective, assessment, plan, vitalSigns } = req.body

      const record = await prisma.medicalRecord.create({
        data: {
          visitId: parseInt(visitId),
          subjective,
          objective,
          assessment,
          plan,
          vitalSigns: vitalSigns
            ? {
                create: {
                  ...vitalSigns,
                  bmi: calculateBMI(vitalSigns.beratBadan, vitalSigns.tinggiBadan),
                },
              }
            : undefined,
        },
        include: {
          vitalSigns: true,
          diagnoses: true,
          prescriptions: true,
          visit: { include: { patient: true } },
        },
      })

      // Update visit status ke ENGAGED
      await prisma.visit.update({
        where: { id: parseInt(visitId) },
        data: { statusAntrean: 'ENGAGED' },
      })

      res.status(201).json(record)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const { subjective, objective, assessment, plan } = req.body

      // Log edit history
      const existing = await prisma.medicalRecord.findUnique({ where: { id } })
      if (existing) {
        const fields = { subjective, objective, assessment, plan }
        const historyEntries = []
        for (const [field, newValue] of Object.entries(fields)) {
          if (newValue !== undefined && existing[field] !== newValue) {
            historyEntries.push({
              mrId: id,
              fieldName: field,
              oldValue: existing[field],
              newValue: newValue,
              changedBy: req.user.namaStaf,
            })
          }
        }
        if (historyEntries.length > 0) {
          await prisma.editHistory.createMany({ data: historyEntries })
        }
      }

      const record = await prisma.medicalRecord.update({
        where: { id },
        data: { subjective, objective, assessment, plan },
        include: {
          vitalSigns: true,
          diagnoses: { include: { icd10: true } },
          prescriptions: true,
          editHistory: { orderBy: { changedAt: 'desc' } },
        },
      })
      res.json(record)
    } catch (error) {
      next(error)
    }
  },

  async getEditHistory(req, res, next) {
    try {
      const history = await prisma.editHistory.findMany({
        where: { mrId: parseInt(req.params.id) },
        orderBy: { changedAt: 'desc' },
      })
      res.json(history)
    } catch (error) {
      next(error)
    }
  },
}

export const vitalSignsController = {
  async create(req, res, next) {
    try {
      const data = { ...req.body, mrId: parseInt(req.body.mrId) }
      data.bmi = calculateBMI(data.beratBadan, data.tinggiBadan)

      const vs = await prisma.vitalSign.create({ data })
      res.status(201).json(vs)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const data = { ...req.body }
      if (data.beratBadan !== undefined || data.tinggiBadan !== undefined) {
        const existing = await prisma.vitalSign.findUnique({ where: { id: parseInt(req.params.id) } })
        data.bmi = calculateBMI(
          data.beratBadan ?? existing?.beratBadan,
          data.tinggiBadan ?? existing?.tinggiBadan
        )
      }
      const vs = await prisma.vitalSign.update({ where: { id: parseInt(req.params.id) }, data })
      res.json(vs)
    } catch (error) {
      next(error)
    }
  },
}

export const diagnosesController = {
  async getByMR(req, res, next) {
    try {
      const diagnoses = await prisma.diagnosis.findMany({
        where: { mrId: parseInt(req.params.mrId) },
        include: { icd10: true },
      })
      res.json(diagnoses)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data = {
        mrId: parseInt(req.body.mrId),
        icdId: req.body.icdId ? parseInt(req.body.icdId) : null,
        icdCode: req.body.icdCode || null,
        deskripsi: req.body.deskripsi || null,
        catatanManual: req.body.catatanManual || null,
      }
      const diagnosis = await prisma.diagnosis.create({ data, include: { icd10: true } })
      res.status(201).json(diagnosis)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.diagnosis.delete({ where: { id: parseInt(req.params.id) } })
      res.json({ message: 'Diagnosis berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },
}

export const allergiesController = {
  async getByPatient(req, res, next) {
    try {
      const allergies = await prisma.allergy.findMany({
        where: { patientId: parseInt(req.params.patientId) },
      })
      res.json(allergies)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const allergy = await prisma.allergy.create({
        data: {
          patientId: parseInt(req.body.patientId),
          tipeAlergi: req.body.tipeAlergi,
          namaAlergi: req.body.namaAlergi,
          keterangan: req.body.keterangan,
        },
      })
      res.status(201).json(allergy)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      await prisma.allergy.delete({ where: { id: parseInt(req.params.id) } })
      res.json({ message: 'Alergi berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },
}
