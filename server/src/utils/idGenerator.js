import prisma from '../config/database.js'

export async function generateNoRM() {
  const lastPatient = await prisma.patient.findFirst({
    orderBy: { id: 'desc' },
    select: { noRm: true },
  })
  const lastNum = lastPatient ? parseInt(lastPatient.noRm, 10) : 0
  return String(lastNum + 1).padStart(6, '0')
}

export async function generateInvoiceNo() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { id: 'desc' },
    select: { noInvoice: true },
  })
  const lastNum = lastInvoice ? parseInt(lastInvoice.noInvoice.replace('INV', ''), 10) : 0
  return 'INV' + String(lastNum + 1).padStart(6, '0')
}

export async function generateKwitansiNo() {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { noKwitansi: { not: null } },
    orderBy: { id: 'desc' },
    select: { noKwitansi: true },
  })
  const lastNum = lastInvoice?.noKwitansi ? parseInt(lastInvoice.noKwitansi.replace('KWI', ''), 10) : 0
  return 'KWI' + String(lastNum + 1).padStart(8, '0')
}

export async function generateMedicineCode() {
  const last = await prisma.medicine.findFirst({
    orderBy: { id: 'desc' },
    select: { kode: true },
  })
  const lastNum = last ? parseInt(last.kode.replace('OBT', ''), 10) : 0
  return 'OBT' + String(lastNum + 1).padStart(6, '0')
}

export async function generateConsumableCode() {
  const last = await prisma.consumable.findFirst({
    orderBy: { id: 'desc' },
    select: { kode: true },
  })
  const lastNum = last ? parseInt(last.kode.replace('BHP', ''), 10) : 0
  return 'BHP' + String(lastNum + 1).padStart(6, '0')
}

export async function generateAntreanNo(tglKunjungan) {
  const startOfDay = new Date(tglKunjungan)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(tglKunjungan)
  endOfDay.setHours(23, 59, 59, 999)

  const count = await prisma.visit.count({
    where: {
      tglKunjungan: { gte: startOfDay, lte: endOfDay },
    },
  })
  return 'A' + String(count + 1).padStart(2, '0')
}
