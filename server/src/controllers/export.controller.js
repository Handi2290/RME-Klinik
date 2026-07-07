import prisma from '../config/database.js'
import { generateExcel } from '../services/excel.service.js'
import { generatePDF } from '../services/pdf.service.js'

export const exportController = {
  async medicinesExcel(req, res, next) {
    try {
      const data = await prisma.medicine.findMany({ where: { isActive: true }, orderBy: { namaObat: 'asc' } })
      const columns = [
        { header: 'Kode', key: 'kode' },
        { header: 'Nama Obat', key: 'namaObat' },
        { header: 'Farmasi', key: 'farmasi' },
        { header: 'Jenis', key: 'jenis' },
        { header: 'Kategori', key: 'kategori' },
        { header: 'Satuan', key: 'satuan' },
        { header: 'Stok', key: 'stok' },
        { header: 'Harga Umum', key: 'hargaUmum' },
        { header: 'Harga Beli', key: 'hargaBeli' },
        { header: 'Harga OTC', key: 'hargaOtc' },
        { header: 'Expired', key: 'tglExpired' },
        { header: 'Batch', key: 'nomorBatch' },
      ]
      const buffer = generateExcel(data, columns, 'Data Obat')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="data-obat.xlsx"')
      res.send(Buffer.from(buffer))
    } catch (error) {
      next(error)
    }
  },

  async consumablesExcel(req, res, next) {
    try {
      const data = await prisma.consumable.findMany({ where: { isActive: true }, orderBy: { namaBarang: 'asc' } })
      const columns = [
        { header: 'Kode', key: 'kode' },
        { header: 'Nama Barang', key: 'namaBarang' },
        { header: 'Brand', key: 'brand' },
        { header: 'Jenis', key: 'jenis' },
        { header: 'Satuan', key: 'satuan' },
        { header: 'Stok', key: 'stok' },
        { header: 'Harga Umum', key: 'hargaUmum' },
        { header: 'Harga Beli', key: 'hargaBeli' },
        { header: 'Expired', key: 'tglExpired' },
      ]
      const buffer = generateExcel(data, columns, 'Data BHP')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="data-bhp.xlsx"')
      res.send(Buffer.from(buffer))
    } catch (error) {
      next(error)
    }
  },

  async icd10Excel(req, res, next) {
    try {
      const data = await prisma.icd10.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } })
      const columns = [
        { header: 'Code', key: 'code' },
        { header: 'Description', key: 'description' },
        { header: 'Description_ID', key: 'descriptionId' },
        { header: 'Category', key: 'category' },
        { header: 'Category_Name', key: 'categoryName' },
        { header: 'Chapter', key: 'chapter' },
      ]
      const buffer = generateExcel(data, columns, 'ICD-10')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename="icd10-data.xlsx"')
      res.send(Buffer.from(buffer))
    } catch (error) {
      next(error)
    }
  },

  async invoicePdf(req, res, next) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          items: true,
          payments: true,
          visit: { include: { patient: true, dokter: { select: { namaStaf: true } } } },
        },
      })
      if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' })

      const itemRows = invoice.items
        .map((item) => `<tr><td>${item.deskripsi}</td><td>${item.jumlah}</td><td>Rp${item.harga.toLocaleString('id-ID')}</td><td>Rp${item.diskon.toLocaleString('id-ID')}</td><td>Rp${item.totalHarga.toLocaleString('id-ID')}</td></tr>`)
        .join('')

      const data = {
        noInvoice: invoice.noInvoice,
        noKwitansi: invoice.noKwitansi || '-',
        tanggal: new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        namaPasien: invoice.visit.patient.namaPasien,
        noRm: invoice.visit.patient.noRm,
        itemRows,
        totalBayar: invoice.totalBayar.toLocaleString('id-ID'),
        metodeBayar: invoice.metodeBayar,
        dibayarOleh: invoice.dibayarOleh || '-',
      }

      const pdfBuffer = await generatePDF('struk-pembayaran', data)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="struk-${invoice.noInvoice}.pdf"`)
      res.send(Buffer.from(pdfBuffer))
    } catch (error) {
      next(error)
    }
  },
}
