import puppeteer from 'puppeteer'
import prisma from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')

async function getPrintTemplate() {
  let template = await prisma.printTemplate.findFirst()
  if (!template) {
    template = {
      tipePrinter: 'inkjet',
      marginKiri: '1 inch',
      marginKanan: '1 inch',
      marginAtas: '1 inch',
      marginBawah: '1 inch',
      orientation: 'portrait',
      kertas: 'A4',
      font: '12pt',
      judul: 'Klinik Keluarga Sehat',
      alamat: '',
      telepon: '',
      email: '',
      logoPath: null,
      logoKeduaPath: null,
      skipHeader: false,
      keterangan: '',
      signatureKiri: '',
      signatureKanan: '',
    }
  }
  return template
}

function parseMargin(marginStr) {
  const val = parseFloat(marginStr) || 1
  if (marginStr?.includes('cm')) return `${val}cm`
  return `${val}in`
}

function buildHeaderHtml(template) {
  if (template.skipHeader) return ''
  
  let logoHtml = ''
  if (template.logoPath) {
    const logoFullPath = path.resolve(template.logoPath)
    if (fs.existsSync(logoFullPath)) {
      const logoData = fs.readFileSync(logoFullPath)
      const base64 = logoData.toString('base64')
      const ext = path.extname(logoFullPath).replace('.', '')
      logoHtml = `<img src="data:image/${ext};base64,${base64}" style="max-height:60px;margin-right:15px;" />`
    }
  }

  return `
    <div style="display:flex;align-items:center;border-bottom:2px solid #00BCD4;padding-bottom:10px;margin-bottom:20px;">
      ${logoHtml}
      <div>
        <h2 style="margin:0;color:#00BCD4;font-size:18px;">${template.judul || ''}</h2>
        <p style="margin:2px 0;font-size:10px;color:#666;">${template.alamat || ''}</p>
        ${template.telepon ? `<p style="margin:2px 0;font-size:10px;color:#666;">Telp: ${template.telepon}</p>` : ''}
        ${template.email ? `<p style="margin:2px 0;font-size:10px;color:#666;">Email: ${template.email}</p>` : ''}
      </div>
    </div>
  `
}

function buildFooterHtml(template) {
  return `
    <div style="margin-top:40px;border-top:1px solid #eee;padding-top:10px;">
      ${template.keterangan ? `<p style="font-size:9px;color:#888;text-align:center;">${template.keterangan}</p>` : ''}
      <div style="display:flex;justify-content:space-between;margin-top:30px;">
        <div style="text-align:center;min-width:200px;">
          ${template.signatureKiri ? `<p style="font-size:10px;">${template.signatureKiri}</p>` : ''}
          <div style="margin-top:60px;border-top:1px solid #333;"></div>
        </div>
        <div style="text-align:center;min-width:200px;">
          ${template.signatureKanan ? `<p style="font-size:10px;">${template.signatureKanan}</p>` : ''}
          <div style="margin-top:60px;border-top:1px solid #333;"></div>
        </div>
      </div>
    </div>
  `
}

export async function generatePDF(templateName, data) {
  const printTemplate = await getPrintTemplate()
  
  let htmlContent = ''
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`)
  
  if (fs.existsSync(templatePath)) {
    htmlContent = fs.readFileSync(templatePath, 'utf-8')
  } else {
    htmlContent = buildDefaultTemplate(templateName, data)
  }

  // Replace template variables
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    htmlContent = htmlContent.replace(regex, data[key] ?? '')
  })

  // Inject header & footer
  htmlContent = htmlContent.replace('{{HEADER}}', buildHeaderHtml(printTemplate))
  htmlContent = htmlContent.replace('{{FOOTER}}', buildFooterHtml(printTemplate))

  const paperSize = printTemplate.kertas === 'Letter' ? 'Letter' : 'A4'
  const landscape = printTemplate.orientation === 'landscape'

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({
    format: paperSize,
    landscape,
    margin: {
      top: parseMargin(printTemplate.marginAtas),
      bottom: parseMargin(printTemplate.marginBawah),
      left: parseMargin(printTemplate.marginKiri),
      right: parseMargin(printTemplate.marginKanan),
    },
    printBackground: true,
  })

  await browser.close()
  return pdfBuffer
}

function buildDefaultTemplate(templateName, data) {
  const baseStyle = `
    <style>
      body { font-family: 'Inter', Arial, sans-serif; font-size: 12pt; color: #333; }
      h1 { font-size: 16pt; color: #00BCD4; text-align: center; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
      th { background: #E0F7FA; font-weight: 600; }
      .info-row { display: flex; margin: 5px 0; }
      .info-label { font-weight: 600; min-width: 150px; }
    </style>
  `

  if (templateName === 'surat-sakit') {
    return `<!DOCTYPE html><html><head>${baseStyle}</head><body>
      {{HEADER}}
      <h1>SURAT KETERANGAN SAKIT</h1>
      <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
      <div class="info-row"><span class="info-label">Nama</span>: {{namaPasien}}</div>
      <div class="info-row"><span class="info-label">No. Rekam Medis</span>: {{noRm}}</div>
      <div class="info-row"><span class="info-label">Tanggal Lahir</span>: {{tglLahir}}</div>
      <div class="info-row"><span class="info-label">Jenis Kelamin</span>: {{jenisKelamin}}</div>
      <div class="info-row"><span class="info-label">Alamat</span>: {{alamat}}</div>
      <p>Berdasarkan pemeriksaan yang dilakukan pada tanggal <strong>{{tglPeriksa}}</strong>, 
      pasien tersebut dinyatakan sakit dan memerlukan istirahat selama 
      <strong>{{durasiHari}} hari</strong>, terhitung mulai tanggal 
      <strong>{{tglMulai}}</strong> sampai dengan <strong>{{tglSelesai}}</strong>.</p>
      <p>{{isiSurat}}</p>
      <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
      {{FOOTER}}
    </body></html>`
  }

  if (templateName === 'surat-sehat') {
    return `<!DOCTYPE html><html><head>${baseStyle}</head><body>
      {{HEADER}}
      <h1>SURAT KETERANGAN SEHAT</h1>
      <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
      <div class="info-row"><span class="info-label">Nama</span>: {{namaPasien}}</div>
      <div class="info-row"><span class="info-label">No. Rekam Medis</span>: {{noRm}}</div>
      <div class="info-row"><span class="info-label">Tanggal Lahir</span>: {{tglLahir}}</div>
      <div class="info-row"><span class="info-label">Jenis Kelamin</span>: {{jenisKelamin}}</div>
      <div class="info-row"><span class="info-label">Alamat</span>: {{alamat}}</div>
      <p>Setelah dilakukan pemeriksaan pada tanggal <strong>{{tglPeriksa}}</strong>, 
      yang bersangkutan dinyatakan dalam keadaan <strong>SEHAT</strong>.</p>
      <p>{{isiSurat}}</p>
      <p>Demikian surat keterangan ini dibuat dengan sebenarnya.</p>
      {{FOOTER}}
    </body></html>`
  }

  if (templateName === 'struk-pembayaran') {
    return `<!DOCTYPE html><html><head>${baseStyle}
      <style>
        .total-row { font-weight:700; font-size:14pt; color:#00BCD4; }
      </style>
    </head><body>
      {{HEADER}}
      <h1>STRUK PEMBAYARAN</h1>
      <div class="info-row"><span class="info-label">No. Invoice</span>: {{noInvoice}}</div>
      <div class="info-row"><span class="info-label">No. Kwitansi</span>: {{noKwitansi}}</div>
      <div class="info-row"><span class="info-label">Tanggal</span>: {{tanggal}}</div>
      <div class="info-row"><span class="info-label">Pasien</span>: {{namaPasien}}</div>
      <div class="info-row"><span class="info-label">No. RM</span>: {{noRm}}</div>
      <table>
        <thead><tr><th>Deskripsi</th><th>Jml</th><th>Harga</th><th>Diskon</th><th>Total</th></tr></thead>
        <tbody>{{itemRows}}</tbody>
      </table>
      <div class="info-row total-row"><span class="info-label">TOTAL</span>: Rp{{totalBayar}}</div>
      <div class="info-row"><span class="info-label">Metode Bayar</span>: {{metodeBayar}}</div>
      <div class="info-row"><span class="info-label">Dibayar Oleh</span>: {{dibayarOleh}}</div>
      {{FOOTER}}
    </body></html>`
  }

  return `<!DOCTYPE html><html><head>${baseStyle}</head><body>
    {{HEADER}}<h1>${templateName}</h1><p>{{isiSurat}}</p>{{FOOTER}}
  </body></html>`
}
