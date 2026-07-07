import prisma from '../config/database.js'
import { generatePDF } from '../services/pdf.service.js'

export const medicalLettersController = {
  async create(req, res, next) {
    try {
      const letter = await prisma.medicalLetter.create({
        data: {
          mrId: parseInt(req.body.mrId),
          tipeSurat: req.body.tipeSurat,
          isiSurat: req.body.isiSurat,
          tglMulai: req.body.tglMulai ? new Date(req.body.tglMulai) : null,
          tglSelesai: req.body.tglSelesai ? new Date(req.body.tglSelesai) : null,
          durasiHari: req.body.durasiHari ? parseInt(req.body.durasiHari) : null,
        },
      })
      res.status(201).json(letter)
    } catch (error) {
      next(error)
    }
  },

  async generatePdf(req, res, next) {
    try {
      const letter = await prisma.medicalLetter.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          medicalRecord: {
            include: {
              visit: {
                include: {
                  patient: true,
                  dokter: { select: { namaStaf: true } },
                },
              },
            },
          },
        },
      })

      if (!letter) return res.status(404).json({ error: 'Surat tidak ditemukan' })

      const patient = letter.medicalRecord.visit.patient
      const templateMap = {
        SURAT_SAKIT: 'surat-sakit',
        SURAT_SEHAT: 'surat-sehat',
        SURAT_BEROBAT: 'surat-berobat',
        PERSETUJUAN: 'surat-persetujuan',
        PENOLAKAN: 'surat-penolakan',
      }

      const formatDate = (d) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      }

      const data = {
        namaPasien: patient.namaPasien,
        noRm: patient.noRm,
        tglLahir: formatDate(patient.tglLahir),
        jenisKelamin: patient.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
        alamat: patient.alamat || '-',
        tglPeriksa: formatDate(letter.medicalRecord.tglPeriksa),
        tglMulai: formatDate(letter.tglMulai),
        tglSelesai: formatDate(letter.tglSelesai),
        durasiHari: String(letter.durasiHari || 0),
        isiSurat: letter.isiSurat || '',
        dokter: letter.medicalRecord.visit.dokter?.namaStaf || '-',
      }

      const pdfBuffer = await generatePDF(templateMap[letter.tipeSurat] || 'surat-sakit', data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="surat-${letter.tipeSurat.toLowerCase()}-${patient.noRm}.pdf"`)
      res.send(Buffer.from(pdfBuffer))
    } catch (error) {
      next(error)
    }
  },
}
