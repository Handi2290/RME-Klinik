import prisma from '../config/database.js'
import { parseExcel } from './excel.service.js'

export async function importIcd10FromJSON(jsonData) {
  const results = { created: 0, updated: 0, skipped: 0, errors: [] }

  for (const item of jsonData) {
    try {
      if (!item.code || !item.description) {
        results.skipped++
        continue
      }

      const existing = await prisma.icd10.findUnique({ where: { code: item.code } })

      if (existing) {
        await prisma.icd10.update({
          where: { code: item.code },
          data: {
            description: item.description,
            descriptionId: item.descriptionId || item.description_id || existing.descriptionId,
            category: item.category || existing.category,
            categoryName: item.categoryName || item.category_name || existing.categoryName,
            chapter: item.chapter || existing.chapter,
            isActive: true,
          },
        })
        results.updated++
      } else {
        await prisma.icd10.create({
          data: {
            code: item.code,
            description: item.description,
            descriptionId: item.descriptionId || item.description_id || null,
            category: item.category || null,
            categoryName: item.categoryName || item.category_name || null,
            chapter: item.chapter || null,
          },
        })
        results.created++
      }
    } catch (error) {
      results.errors.push({ code: item.code, error: error.message })
    }
  }

  return results
}

export async function importIcd10FromExcel(buffer) {
  const rows = parseExcel(buffer)

  const jsonData = rows.map((row) => ({
    code: row.Code || row.code || row.Kode || row.kode,
    description: row.Description || row.description || row.Deskripsi || row.deskripsi,
    descriptionId: row.Description_ID || row.description_id || row.Deskripsi_ID || row.deskripsi_id,
    category: row.Category || row.category || row.Kategori || row.kategori,
    categoryName: row.Category_Name || row.category_name || row.Nama_Kategori,
    chapter: row.Chapter || row.chapter || row.Bab || row.bab,
  }))

  return importIcd10FromJSON(jsonData)
}
