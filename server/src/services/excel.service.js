import * as XLSX from 'xlsx'

export function generateExcel(data, columns, sheetName = 'Sheet1') {
  const wb = XLSX.utils.book_new()
  const headers = columns.map((c) => c.header)
  const keys = columns.map((c) => c.key)

  const rows = data.map((item) => keys.map((key) => item[key] ?? ''))
  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto column width
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i] || '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

export function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(ws)
}
