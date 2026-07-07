import prisma from '../config/database.js'

export const settingsController = {
  async getAll(req, res, next) {
    try {
      const settings = await prisma.setting.findMany()
      const result = {}
      settings.forEach((s) => { result[s.key] = s.value })
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const entries = Object.entries(req.body)
      for (const [key, value] of entries) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), category: req.body._category || 'general' },
        })
      }
      res.json({ message: 'Settings berhasil diperbarui' })
    } catch (error) {
      next(error)
    }
  },

  async getPrintTemplate(req, res, next) {
    try {
      let template = await prisma.printTemplate.findFirst()
      if (!template) {
        template = await prisma.printTemplate.create({
          data: {
            judul: 'Klinik Keluarga Sehat',
            alamat: 'Ruko Garden Boulevard Blok M.26 No.271-273, Citra Raya Kel.Panongan, Kec. Panongan, Kabupaten Tangerang, Banten. 15711',
            telepon: '02159663389',
          },
        })
      }
      res.json(template)
    } catch (error) {
      next(error)
    }
  },

  async updatePrintTemplate(req, res, next) {
    try {
      let template = await prisma.printTemplate.findFirst()
      if (template) {
        template = await prisma.printTemplate.update({
          where: { id: template.id },
          data: req.body,
        })
      } else {
        template = await prisma.printTemplate.create({ data: req.body })
      }
      res.json(template)
    } catch (error) {
      next(error)
    }
  },

  async uploadLogo(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' })

      const field = req.query.field === 'logoKedua' ? 'logoKeduaPath' : 'logoPath'
      const logoPath = `uploads/${req.file.filename}`

      let template = await prisma.printTemplate.findFirst()
      if (template) {
        template = await prisma.printTemplate.update({
          where: { id: template.id },
          data: { [field]: logoPath },
        })
      } else {
        template = await prisma.printTemplate.create({
          data: { [field]: logoPath, judul: 'Klinik Keluarga Sehat' },
        })
      }
      res.json({ path: logoPath, template })
    } catch (error) {
      next(error)
    }
  },

  async uploadIllustration(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' })

      const filePath = `uploads/${req.file.filename}`
      await prisma.setting.upsert({
        where: { key: 'login_illustration' },
        update: { value: filePath },
        create: { key: 'login_illustration', value: filePath, category: 'general' }
      })
      res.json({ path: filePath })
    } catch (error) {
      next(error)
    }
  },
}
