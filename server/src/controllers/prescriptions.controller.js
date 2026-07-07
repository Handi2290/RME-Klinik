import prisma from '../config/database.js'

export const prescriptionsController = {
  async getByMR(req, res, next) {
    try {
      const prescriptions = await prisma.prescription.findMany({
        where: { mrId: parseInt(req.params.mrId) },
        include: { medicine: true },
      })
      res.json(prescriptions)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const { mrId, medicineId, namaObat, jumlah, satuan, aturanPakai, frekuensi, depot, kfaCode, catatan } = req.body

      // Kurangi stok obat
      if (medicineId) {
        const medicine = await prisma.medicine.findUnique({ where: { id: parseInt(medicineId) } })
        if (medicine && medicine.stok < parseInt(jumlah)) {
          return res.status(400).json({ error: `Stok ${medicine.namaObat} tidak mencukupi. Tersedia: ${medicine.stok}` })
        }
        if (medicine) {
          await prisma.medicine.update({
            where: { id: parseInt(medicineId) },
            data: { stok: { decrement: parseInt(jumlah) } },
          })
        }
      }

      const prescription = await prisma.prescription.create({
        data: {
          mrId: parseInt(mrId),
          medicineId: medicineId ? parseInt(medicineId) : null,
          namaObat,
          jumlah: parseInt(jumlah),
          satuan, aturanPakai, frekuensi, depot, kfaCode, catatan,
        },
        include: { medicine: true },
      })
      res.status(201).json(prescription)
    } catch (error) {
      next(error)
    }
  },

  async createCompound(req, res, next) {
    try {
      const { mrId, namaRacikan, tipeRacik, jumlah, satuan, aturanPakai, frekuensi, bahan } = req.body

      // Kurangi stok bahan
      for (const b of bahan || []) {
        if (b.medicineId) {
          const medicine = await prisma.medicine.findUnique({ where: { id: parseInt(b.medicineId) } })
          if (medicine && medicine.stok < parseInt(b.jumlah)) {
            return res.status(400).json({ error: `Stok ${medicine.namaObat} tidak mencukupi` })
          }
          await prisma.medicine.update({
            where: { id: parseInt(b.medicineId) },
            data: { stok: { decrement: parseInt(b.jumlah) } },
          })
        }
      }

      const prescription = await prisma.prescription.create({
        data: {
          mrId: parseInt(mrId),
          namaObat: namaRacikan || 'Racikan',
          jumlah: parseInt(jumlah),
          satuan,
          aturanPakai,
          frekuensi,
          isRacikan: true,
          namaRacikan,
          tipeRacik,
          catatan: JSON.stringify(bahan),
        },
      })
      res.status(201).json(prescription)
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const prescription = await prisma.prescription.findUnique({
        where: { id: parseInt(req.params.id) },
      })

      // Kembalikan stok
      if (prescription?.medicineId) {
        await prisma.medicine.update({
          where: { id: prescription.medicineId },
          data: { stok: { increment: prescription.jumlah } },
        })
      }

      await prisma.prescription.delete({ where: { id: parseInt(req.params.id) } })
      res.json({ message: 'Resep berhasil dihapus' })
    } catch (error) {
      next(error)
    }
  },
}
