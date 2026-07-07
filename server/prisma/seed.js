import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // === USERS ===
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const users = [
    { username: 'owner', password: hashedPassword, role: 'MASTER', namaStaf: 'Cahaya Angriawan', jabatan: 'Owner', email: 'owner@klinik.com', noHp: '081234567890', isPic: true },
    { username: 'admin', password: hashedPassword, role: 'ADMIN', namaStaf: 'Berliana, SST', jabatan: 'Admin Pendaftaran', email: 'admin@klinik.com', noHp: '081234567891' },
    { username: 'dokter', password: hashedPassword, role: 'DOKTER', namaStaf: 'dr. Dwi Evita Ariyani', jabatan: 'Dokter Umum', email: 'dokter@klinik.com', noHp: '081234567892' },
    { username: 'apotek', password: hashedPassword, role: 'APOTEK', namaStaf: 'apt. Rizka Mardhiani, M.Farm', jabatan: 'Apoteker', email: 'apotek@klinik.com', noHp: '081234567893' },
  ]

  for (const user of users) {
    await prisma.user.upsert({ where: { username: user.username }, update: {}, create: user })
  }
  console.log('✅ Users seeded')

  // === PATIENTS ===
  const patients = [
    { noRm: '000001', namaPasien: 'QHAIRA AFYAZ ATHARI, AN', tglLahir: new Date('2021-05-15'), jenisKelamin: 'PEREMPUAN', alamat: 'Jl. Citra Raya Blok A1 No.5, Tangerang', noKtp: '3674015505210001', noHp: '081234567800', tipePasien: 'BPJS', noAsuransi: '086603892' },
    { noRm: '000002', namaPasien: 'ALTHAFARIZQI PUTRA SUGANDA', tglLahir: new Date('2015-03-20'), jenisKelamin: 'LAKI_LAKI', alamat: 'Jl. Boulevard Raya No.10, Tangerang', noKtp: '3674012003150002', noHp: '081234567801', tipePasien: 'BPJS', noAsuransi: '006769' },
    { noRm: '000003', namaPasien: 'AHMAD FAUZI', tglLahir: new Date('1985-08-10'), jenisKelamin: 'LAKI_LAKI', alamat: 'Jl. Panongan Raya No.15', noKtp: '3674011008850003', noHp: '081234567802', tipePasien: 'Umum' },
    { noRm: '000004', namaPasien: 'SITI NURHALIZA', tglLahir: new Date('1990-12-25'), jenisKelamin: 'PEREMPUAN', alamat: 'Perum Citra Garden 2 Blok B5', noKtp: '3674012512900004', noHp: '081234567803', tipePasien: 'Umum' },
    { noRm: '000005', namaPasien: 'BUDI SANTOSO', tglLahir: new Date('1978-04-03'), jenisKelamin: 'LAKI_LAKI', alamat: 'Jl. Raya Serang KM 5', noKtp: '3674010304780005', noHp: '081234567804', tipePasien: 'BPJS', noAsuransi: '009876' },
  ]

  for (const patient of patients) {
    await prisma.patient.upsert({ where: { noRm: patient.noRm }, update: {}, create: patient })
  }
  console.log('✅ Patients seeded')

  // === ALLERGIES ===
  const patient1 = await prisma.patient.findUnique({ where: { noRm: '000001' } })
  if (patient1) {
    await prisma.allergy.createMany({
      data: [
        { patientId: patient1.id, tipeAlergi: 'OBAT', namaAlergi: 'Amoxicillin', keterangan: 'Ruam kulit dan gatal' },
        { patientId: patient1.id, tipeAlergi: 'UMUM', namaAlergi: 'Debu', keterangan: 'Bersin-bersin dan hidung tersumbat' },
      ],
      skipDuplicates: true,
    })
  }
  console.log('✅ Allergies seeded')

  // === MEDICINES ===
  const medicines = [
    { kode: 'OBT000001', namaObat: 'PCT TAB (BPJS)', farmasi: 'PIM PHARMACEUTICALS', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '500mg', stok: 1387, hargaUmum: 500, hargaBeli: 300, hargaOtc: 1000, depot: 'Apotek', kfaCode: '93009361', kandungan: 'Paracetamol' },
    { kode: 'OBT000002', namaObat: 'PCT SIRUP (BPJS)', farmasi: 'PIM PHARMACEUTICALS', jenis: 'Sirup', kategori: 'Obat Keras', satuan: 'Botol', dosis: '120mg/5ml', stok: 15, hargaUmum: 8000, hargaBeli: 5000, hargaOtc: 12000, depot: 'Apotek' },
    { kode: 'OBT000003', namaObat: 'AMOXICILLIN 500MG', farmasi: 'INDOFARMA', jenis: 'Kapsul', kategori: 'Obat Keras', satuan: 'Kapsul', dosis: '500mg', stok: 500, hargaUmum: 800, hargaBeli: 500, hargaOtc: 1500, depot: 'Apotek', kandungan: 'Amoxicillin' },
    { kode: 'OBT000004', namaObat: 'OMEPRAZOLE 20MG', farmasi: 'DEXA MEDICA', jenis: 'Kapsul', kategori: 'Obat Keras', satuan: 'Kapsul', dosis: '20mg', stok: 300, hargaUmum: 1200, hargaBeli: 800, hargaOtc: 2000, depot: 'Apotek' },
    { kode: 'OBT000005', namaObat: 'CETIRIZINE 10MG', farmasi: 'KIMIA FARMA', jenis: 'Tablet', kategori: 'Obat Bebas Terbatas', satuan: 'Tablet', dosis: '10mg', stok: 200, hargaUmum: 600, hargaBeli: 350, hargaOtc: 1000, depot: 'Apotek' },
    { kode: 'OBT000006', namaObat: 'METFORMIN 500MG', farmasi: 'INDOFARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '500mg', stok: 450, hargaUmum: 700, hargaBeli: 400, hargaOtc: 1200, depot: 'Apotek' },
    { kode: 'OBT000007', namaObat: 'AMLODIPINE 5MG', farmasi: 'DEXA MEDICA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '5mg', stok: 350, hargaUmum: 900, hargaBeli: 600, hargaOtc: 1500, depot: 'Apotek' },
    { kode: 'OBT000008', namaObat: 'GG TAB (BPJS)', farmasi: 'INDOFARMA', jenis: 'Tablet', kategori: 'Obat Bebas', satuan: 'Tablet', dosis: '100mg', stok: 273, hargaUmum: 400, hargaBeli: 200, hargaOtc: 800, depot: 'Apotek', kfaCode: '93009362' },
    { kode: 'OBT000009', namaObat: 'CTM POT (BPJS)', farmasi: 'KIMIA FARMA', jenis: 'Tablet', kategori: 'Obat Bebas', satuan: 'Tablet', dosis: '4mg', stok: 0, hargaUmum: 300, hargaBeli: 150, hargaOtc: 500, depot: 'Apotek' },
    { kode: 'OBT000010', namaObat: 'DEXAMETHASONE 0.5MG', farmasi: 'INDOFARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '0.5mg', stok: 180, hargaUmum: 500, hargaBeli: 250, hargaOtc: 800, depot: 'Apotek' },
    { kode: 'OBT000011', namaObat: 'MIRASIC 500MG', farmasi: 'SANBE FARMA', jenis: 'Kaplet', kategori: 'Obat Bebas', satuan: 'Kaplet', dosis: '500mg', stok: 800, hargaUmum: 600, hargaBeli: 400, hargaOtc: 1000, depot: 'Apotek', kandungan: 'Paracetamol' },
    { kode: 'OBT000012', namaObat: 'IBUPROFEN 400MG', farmasi: 'KIMIA FARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '400mg', stok: 250, hargaUmum: 800, hargaBeli: 500, hargaOtc: 1300, depot: 'Apotek' },
    { kode: 'OBT000013', namaObat: 'VITAMIN C 500MG', farmasi: 'INDOFARMA', jenis: 'Tablet', kategori: 'Suplemen', satuan: 'Tablet', dosis: '500mg', stok: 600, hargaUmum: 300, hargaBeli: 150, hargaOtc: 500, depot: 'Apotek' },
    { kode: 'OBT000014', namaObat: 'ANTASIDA DOEN', farmasi: 'INDOFARMA', jenis: 'Tablet Kunyah', kategori: 'Obat Bebas', satuan: 'Tablet', dosis: '-', stok: 400, hargaUmum: 400, hargaBeli: 200, hargaOtc: 700, depot: 'Apotek' },
    { kode: 'OBT000015', namaObat: 'SALBUTAMOL 2MG', farmasi: 'KIMIA FARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '2mg', stok: 3, hargaUmum: 600, hargaBeli: 350, hargaOtc: 1000, depot: 'Apotek', tglExpired: new Date('2026-07-15') },
    { kode: 'OBT000016', namaObat: 'LOPERAMIDE 2MG', farmasi: 'DEXA MEDICA', jenis: 'Kapsul', kategori: 'Obat Keras', satuan: 'Kapsul', dosis: '2mg', stok: 120, hargaUmum: 700, hargaBeli: 400, hargaOtc: 1200, depot: 'Apotek' },
    { kode: 'OBT000017', namaObat: 'DOMPERIDONE 10MG', farmasi: 'SANBE FARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '10mg', stok: 0, hargaUmum: 800, hargaBeli: 500, hargaOtc: 1300, depot: 'Apotek' },
    { kode: 'OBT000018', namaObat: 'RANITIDINE 150MG', farmasi: 'INDOFARMA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '150mg', stok: 5, hargaUmum: 600, hargaBeli: 350, hargaOtc: 1000, depot: 'Apotek', tglExpired: new Date('2026-06-10') },
    { kode: 'OBT000019', namaObat: 'METHYLPREDNISOLONE 4MG', farmasi: 'DEXA MEDICA', jenis: 'Tablet', kategori: 'Obat Keras', satuan: 'Tablet', dosis: '4mg', stok: 200, hargaUmum: 1500, hargaBeli: 1000, hargaOtc: 2500, depot: 'Apotek' },
    { kode: 'OBT000020', namaObat: 'CEFIXIME 100MG', farmasi: 'SANBE FARMA', jenis: 'Kapsul', kategori: 'Obat Keras', satuan: 'Kapsul', dosis: '100mg', stok: 150, hargaUmum: 2000, hargaBeli: 1500, hargaOtc: 3000, depot: 'Apotek' },
  ]

  for (const med of medicines) {
    await prisma.medicine.upsert({ where: { kode: med.kode }, update: {}, create: med })
  }
  console.log('✅ Medicines seeded')

  // === CONSUMABLES ===
  const consumables = [
    { kode: 'BHP000001', namaBarang: 'Sarung Tangan Latex M', brand: 'Sensi', jenis: 'Sarung Tangan', satuan: 'Pasang', stok: 500, hargaUmum: 3000, hargaBeli: 1500, depot: 'Apotek' },
    { kode: 'BHP000002', namaBarang: 'Masker Medis 3 Ply', brand: 'Sensi', jenis: 'Masker', satuan: 'Pcs', stok: 1000, hargaUmum: 2000, hargaBeli: 1000, depot: 'Apotek' },
    { kode: 'BHP000003', namaBarang: 'Kapas Bulat', brand: 'OneMed', jenis: 'Kapas', satuan: 'Pak', stok: 50, hargaUmum: 15000, hargaBeli: 10000, depot: 'Apotek' },
    { kode: 'BHP000004', namaBarang: 'Alcohol Swab', brand: 'OneMed', jenis: 'Swab', satuan: 'Box', stok: 30, hargaUmum: 25000, hargaBeli: 18000, depot: 'Apotek' },
    { kode: 'BHP000005', namaBarang: 'Plester Luka', brand: 'Hansaplast', jenis: 'Plester', satuan: 'Pcs', stok: 200, hargaUmum: 1500, hargaBeli: 800, depot: 'Apotek' },
    { kode: 'BHP000006', namaBarang: 'Kasa Steril 16x16', brand: 'OneMed', jenis: 'Kasa', satuan: 'Pcs', stok: 300, hargaUmum: 3000, hargaBeli: 1500, depot: 'Apotek' },
    { kode: 'BHP000007', namaBarang: 'Spuit 3ml', brand: 'OneMed', jenis: 'Spuit', satuan: 'Pcs', stok: 400, hargaUmum: 2500, hargaBeli: 1200, depot: 'Apotek' },
    { kode: 'BHP000008', namaBarang: 'Spuit 5ml', brand: 'OneMed', jenis: 'Spuit', satuan: 'Pcs', stok: 350, hargaUmum: 3000, hargaBeli: 1500, depot: 'Apotek' },
    { kode: 'BHP000009', namaBarang: 'Perban Elastis 10cm', brand: 'OneMed', jenis: 'Perban', satuan: 'Roll', stok: 100, hargaUmum: 8000, hargaBeli: 5000, depot: 'Apotek' },
    { kode: 'BHP000010', namaBarang: 'Betadine 30ml', brand: 'Mundipharma', jenis: 'Antiseptik', satuan: 'Botol', stok: 25, hargaUmum: 20000, hargaBeli: 14000, depot: 'Apotek' },
  ]

  for (const item of consumables) {
    await prisma.consumable.upsert({ where: { kode: item.kode }, update: {}, create: item })
  }
  console.log('✅ Consumables seeded')

  // === ICD-10 ===
  const icd10Data = [
    { code: 'A00', description: 'Cholera', descriptionId: 'Kolera', category: 'A00-A09', categoryName: 'Penyakit infeksi usus', chapter: 'I' },
    { code: 'A01.0', description: 'Typhoid fever', descriptionId: 'Demam tifoid', category: 'A00-A09', categoryName: 'Penyakit infeksi usus', chapter: 'I' },
    { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', descriptionId: 'Gastroenteritis infeksi', category: 'A00-A09', categoryName: 'Penyakit infeksi usus', chapter: 'I' },
    { code: 'A15', description: 'Respiratory tuberculosis', descriptionId: 'Tuberkulosis paru', category: 'A15-A19', categoryName: 'Tuberkulosis', chapter: 'I' },
    { code: 'B20', description: 'HIV disease', descriptionId: 'Penyakit HIV', category: 'B20-B24', categoryName: 'Penyakit HIV', chapter: 'I' },
    { code: 'E10', description: 'Insulin-dependent diabetes mellitus', descriptionId: 'Diabetes melitus tipe 1', category: 'E10-E14', categoryName: 'Diabetes melitus', chapter: 'IV' },
    { code: 'E11', description: 'Non-insulin-dependent diabetes mellitus', descriptionId: 'Diabetes melitus tipe 2', category: 'E10-E14', categoryName: 'Diabetes melitus', chapter: 'IV' },
    { code: 'E78.0', description: 'Pure hypercholesterolaemia', descriptionId: 'Hiperkolesterolemia murni', category: 'E70-E90', categoryName: 'Gangguan metabolisme', chapter: 'IV' },
    { code: 'I10', description: 'Essential (primary) hypertension', descriptionId: 'Hipertensi esensial (primer)', category: 'I10-I15', categoryName: 'Penyakit hipertensi', chapter: 'IX' },
    { code: 'I20', description: 'Angina pectoris', descriptionId: 'Angina pektoris', category: 'I20-I25', categoryName: 'Penyakit jantung iskemik', chapter: 'IX' },
    { code: 'J00', description: 'Acute nasopharyngitis (common cold)', descriptionId: 'Nasofaringitis akut (pilek)', category: 'J00-J06', categoryName: 'Infeksi saluran napas atas akut', chapter: 'X' },
    { code: 'J02', description: 'Acute pharyngitis', descriptionId: 'Faringitis akut', category: 'J00-J06', categoryName: 'Infeksi saluran napas atas akut', chapter: 'X' },
    { code: 'J03', description: 'Acute tonsillitis', descriptionId: 'Tonsilitis akut', category: 'J00-J06', categoryName: 'Infeksi saluran napas atas akut', chapter: 'X' },
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', descriptionId: 'ISPA tidak spesifik', category: 'J00-J06', categoryName: 'Infeksi saluran napas atas akut', chapter: 'X' },
    { code: 'J18.9', description: 'Pneumonia, unspecified', descriptionId: 'Pneumonia tidak spesifik', category: 'J09-J18', categoryName: 'Influenza dan pneumonia', chapter: 'X' },
    { code: 'J45', description: 'Asthma', descriptionId: 'Asma', category: 'J40-J47', categoryName: 'Penyakit saluran napas bawah kronik', chapter: 'X' },
    { code: 'K21', description: 'Gastro-oesophageal reflux disease', descriptionId: 'GERD', category: 'K20-K31', categoryName: 'Penyakit esofagus, lambung dan duodenum', chapter: 'XI' },
    { code: 'K29', description: 'Gastritis and duodenitis', descriptionId: 'Gastritis dan duodenitis', category: 'K20-K31', categoryName: 'Penyakit esofagus, lambung dan duodenum', chapter: 'XI' },
    { code: 'K30', description: 'Functional dyspepsia', descriptionId: 'Dispepsia fungsional', category: 'K20-K31', categoryName: 'Penyakit esofagus, lambung dan duodenum', chapter: 'XI' },
    { code: 'K59.0', description: 'Constipation', descriptionId: 'Konstipasi', category: 'K55-K64', categoryName: 'Penyakit usus lainnya', chapter: 'XI' },
    { code: 'L20', description: 'Atopic dermatitis', descriptionId: 'Dermatitis atopik', category: 'L20-L30', categoryName: 'Dermatitis dan eksim', chapter: 'XII' },
    { code: 'L50', description: 'Urticaria', descriptionId: 'Urtikaria (biduran)', category: 'L50-L54', categoryName: 'Urtikaria dan eritema', chapter: 'XII' },
    { code: 'M54.5', description: 'Low back pain', descriptionId: 'Nyeri punggung bawah', category: 'M50-M54', categoryName: 'Dorsopati lainnya', chapter: 'XIII' },
    { code: 'M79.3', description: 'Panniculitis, unspecified', descriptionId: 'Panikulitis', category: 'M70-M79', categoryName: 'Gangguan jaringan lunak lainnya', chapter: 'XIII' },
    { code: 'N39.0', description: 'Urinary tract infection, site not specified', descriptionId: 'Infeksi saluran kemih', category: 'N30-N39', categoryName: 'Penyakit saluran kemih lainnya', chapter: 'XIV' },
    { code: 'R05', description: 'Cough', descriptionId: 'Batuk', category: 'R00-R09', categoryName: 'Gejala sistem sirkulasi dan pernapasan', chapter: 'XVIII' },
    { code: 'R10.4', description: 'Other and unspecified abdominal pain', descriptionId: 'Nyeri abdomen tidak spesifik', category: 'R10-R19', categoryName: 'Gejala sistem pencernaan dan abdomen', chapter: 'XVIII' },
    { code: 'R11', description: 'Nausea and vomiting', descriptionId: 'Mual dan muntah', category: 'R10-R19', categoryName: 'Gejala sistem pencernaan dan abdomen', chapter: 'XVIII' },
    { code: 'R50.9', description: 'Fever, unspecified', descriptionId: 'Demam tidak spesifik', category: 'R50-R69', categoryName: 'Gejala umum', chapter: 'XVIII' },
    { code: 'R51', description: 'Headache', descriptionId: 'Sakit kepala', category: 'R50-R69', categoryName: 'Gejala umum', chapter: 'XVIII' },
    { code: 'Z00.0', description: 'General adult medical examination', descriptionId: 'Pemeriksaan umum dewasa', category: 'Z00-Z13', categoryName: 'Pemeriksaan dan investigasi', chapter: 'XXI' },
  ]

  for (const icd of icd10Data) {
    await prisma.icd10.upsert({ where: { code: icd.code }, update: {}, create: icd })
  }
  console.log('✅ ICD-10 seeded')

  // === PRINT TEMPLATE ===
  const existingTemplate = await prisma.printTemplate.findFirst()
  if (!existingTemplate) {
    await prisma.printTemplate.create({
      data: {
        judul: 'Klinik Keluarga Sehat',
        alamat: 'Ruko Garden Boulevard Blok M.26 No.271-273, Citra Raya Kel.Panongan, Kec. Panongan, Kabupaten Tangerang, Banten. 15711',
        telepon: '02159663389',
      },
    })
  }
  console.log('✅ Print template seeded')

  // === SETTINGS ===
  const settings = [
    { key: 'bridging_satu_sehat_enabled', value: 'false', category: 'bridging' },
    { key: 'bridging_satu_sehat_client_id', value: '', category: 'bridging' },
    { key: 'bridging_satu_sehat_client_secret', value: '', category: 'bridging' },
    { key: 'bridging_satu_sehat_org_id', value: '100118005', category: 'bridging' },
    { key: 'nama_klinik', value: 'Klinik Keluarga Sehat', category: 'general' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({ where: { key: setting.key }, update: {}, create: setting })
  }
  console.log('✅ Settings seeded')

  console.log('🎉 Seeding selesai!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
