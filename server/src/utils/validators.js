import Joi from 'joi';

// ======================== AUTH ==============================
export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username wajib diisi.',
    'any.required': 'Username wajib diisi.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password wajib diisi.',
    'any.required': 'Password wajib diisi.',
  }),
});

// ======================== USER / STAFF =====================
export const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('MASTER', 'ADMIN', 'DOKTER', 'APOTEK').required(),
  namaStaf: Joi.string().allow(null, ''),
  jabatan: Joi.string().allow(null, ''),
  noHp: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  noPegawai: Joi.string().allow(null, ''),
  catatan: Joi.string().allow(null, ''),
  isPic: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

export const userUpdateSchema = Joi.object({
  username: Joi.string().min(3).max(50),
  password: Joi.string().min(6).max(100).allow(null, ''),
  role: Joi.string().valid('MASTER', 'ADMIN', 'DOKTER', 'APOTEK'),
  namaStaf: Joi.string().allow(null, ''),
  jabatan: Joi.string().allow(null, ''),
  noHp: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  noPegawai: Joi.string().allow(null, ''),
  catatan: Joi.string().allow(null, ''),
  isPic: Joi.boolean(),
  isActive: Joi.boolean(),
});

// ======================== PATIENT ==========================
export const patientSchema = Joi.object({
  noRm: Joi.string().allow(null, ''),
  namaPasien: Joi.string().required().messages({
    'string.empty': 'Nama pasien wajib diisi.',
    'any.required': 'Nama pasien wajib diisi.',
  }),
  tglLahir: Joi.date().iso().allow(null),
  jenisKelamin: Joi.string().valid('LAKI_LAKI', 'PEREMPUAN').allow(null),
  alamat: Joi.string().allow(null, ''),
  noKtp: Joi.string().allow(null, ''),
  noHp: Joi.string().allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  tipePasien: Joi.string().default('Umum'),
});

// ======================== ALLERGY ==========================
export const allergySchema = Joi.object({
  patientId: Joi.number().integer().required(),
  tipeAlergi: Joi.string().valid('OBAT', 'UMUM').required(),
  namaAlergi: Joi.string().required(),
  keterangan: Joi.string().allow(null, ''),
});

// ======================== VISIT ============================
export const visitSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  dokterId: Joi.number().integer().allow(null),
  tglKunjungan: Joi.date().iso().required(),
  jamKunjungan: Joi.string().allow(null, ''),
  statusAntrean: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'WAITING', 'ENGAGED', 'SUCCEED')
    .default('PENDING'),
  noAntrean: Joi.string().allow(null, ''),
  poli: Joi.string().allow(null, ''),
  jenisKunjungan: Joi.string().allow(null, ''),
  jenisPerawatan: Joi.string().allow(null, ''),
  keluhan: Joi.string().allow(null, ''),
  lamaPeriksa: Joi.number().integer().allow(null),
  tipeBayar: Joi.string().allow(null, ''),
});

// ======================== MEDICAL RECORD ===================
export const medicalRecordSchema = Joi.object({
  visitId: Joi.number().integer().required(),
  subjective: Joi.string().allow(null, ''),
  objective: Joi.string().allow(null, ''),
  assessment: Joi.string().allow(null, ''),
  plan: Joi.string().allow(null, ''),
  tglPeriksa: Joi.date().iso().allow(null),
});

// ======================== VITAL SIGN =======================
export const vitalSignSchema = Joi.object({
  mrId: Joi.number().integer().required(),
  beratBadan: Joi.number().allow(null),
  tinggiBadan: Joi.number().allow(null),
  suhu: Joi.number().allow(null),
  tensi: Joi.string().allow(null, ''),
  nadi: Joi.number().integer().allow(null),
  respirasi: Joi.number().integer().allow(null),
  saturasiO2: Joi.number().allow(null),
  gulaDarah: Joi.number().allow(null),
  bmi: Joi.number().allow(null),
  lingkarPerut: Joi.number().allow(null),
});

// ======================== DIAGNOSIS ========================
export const diagnosisSchema = Joi.object({
  mrId: Joi.number().integer().required(),
  icdId: Joi.number().integer().allow(null),
  icdCode: Joi.string().allow(null, ''),
  catatanManual: Joi.string().allow(null, ''),
});

// ======================== PRESCRIPTION =====================
export const prescriptionSchema = Joi.object({
  mrId: Joi.number().integer().required(),
  medicineId: Joi.number().integer().allow(null),
  namaObat: Joi.string().allow(null, ''),
  jumlah: Joi.number().integer().min(1).default(1),
  satuan: Joi.string().allow(null, ''),
  aturanPakai: Joi.string().allow(null, ''),
  frekuensi: Joi.string().allow(null, ''),
  isRacikan: Joi.boolean().default(false),
  namaRacikan: Joi.string().allow(null, ''),
  tipeRacik: Joi.string().allow(null, ''),
  depot: Joi.string().allow(null, ''),
  kfaCode: Joi.string().allow(null, ''),
  catatan: Joi.string().allow(null, ''),
});

// ======================== MEDICINE =========================
export const medicineSchema = Joi.object({
  kode: Joi.string().allow(null, ''),
  namaObat: Joi.string().required().messages({
    'string.empty': 'Nama obat wajib diisi.',
    'any.required': 'Nama obat wajib diisi.',
  }),
  farmasi: Joi.string().allow(null, ''),
  jenis: Joi.string().allow(null, ''),
  kategori: Joi.string().allow(null, ''),
  satuan: Joi.string().allow(null, ''),
  dosis: Joi.string().allow(null, ''),
  stok: Joi.number().integer().min(0).default(0),
  hargaUmum: Joi.number().allow(null),
  hargaBeli: Joi.number().allow(null),
  avgHpp: Joi.number().allow(null),
  hargaOtc: Joi.number().allow(null),
  marginProfit: Joi.number().allow(null),
  tglExpired: Joi.date().iso().allow(null),
  nomorBatch: Joi.string().allow(null, ''),
  barcode: Joi.string().allow(null, ''),
  kfaCode: Joi.string().allow(null, ''),
  kandungan: Joi.string().allow(null, ''),
  deskripsi: Joi.string().allow(null, ''),
  kunciHarga: Joi.boolean().default(false),
  depot: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true),
});

// ======================== CONSUMABLE =======================
export const consumableSchema = Joi.object({
  kode: Joi.string().allow(null, ''),
  namaBarang: Joi.string().required().messages({
    'string.empty': 'Nama barang wajib diisi.',
    'any.required': 'Nama barang wajib diisi.',
  }),
  brand: Joi.string().allow(null, ''),
  jenis: Joi.string().allow(null, ''),
  satuan: Joi.string().allow(null, ''),
  ukuranDosis: Joi.string().allow(null, ''),
  stok: Joi.number().integer().min(0).default(0),
  hargaUmum: Joi.number().allow(null),
  hargaBeli: Joi.number().allow(null),
  avgHpp: Joi.number().allow(null),
  hargaOtc: Joi.number().allow(null),
  marginProfit: Joi.number().allow(null),
  tglExpired: Joi.date().iso().allow(null),
  nomorBatch: Joi.string().allow(null, ''),
  barcode: Joi.string().allow(null, ''),
  kunciHarga: Joi.boolean().default(false),
  bisaDijualApotek: Joi.boolean().default(false),
  keterangan: Joi.string().allow(null, ''),
  depot: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true),
});

// ======================== INVOICE ==========================
export const invoiceSchema = Joi.object({
  visitId: Joi.number().integer().required(),
  noInvoice: Joi.string().allow(null, ''),
  noKwitansi: Joi.string().allow(null, ''),
  totalBayar: Joi.number().default(0),
  pembulatan: Joi.number().allow(null),
  metodeBayar: Joi.string().valid('TUNAI', 'QRIS').default('TUNAI'),
  statusBayar: Joi.string().valid('LUNAS', 'BELUM_LUNAS').default('BELUM_LUNAS'),
  dibayarOleh: Joi.string().allow(null, ''),
  catatan: Joi.string().allow(null, ''),
  items: Joi.array()
    .items(
      Joi.object({
        deskripsi: Joi.string().allow(null, ''),
        depot: Joi.string().allow(null, ''),
        jumlah: Joi.number().integer().min(1).default(1),
        harga: Joi.number().default(0),
        diskon: Joi.number().default(0),
        totalHarga: Joi.number().default(0),
      })
    )
    .allow(null),
});

// ======================== PAYMENT ==========================
export const paymentSchema = Joi.object({
  invoiceId: Joi.number().integer().required(),
  tanggal: Joi.date().iso().allow(null),
  nominal: Joi.number().required(),
  metodeBayar: Joi.string().allow(null, ''),
  penanggungJawab: Joi.string().allow(null, ''),
});

// ======================== MEDICAL LETTER ===================
export const medicalLetterSchema = Joi.object({
  mrId: Joi.number().integer().required(),
  tipeSurat: Joi.string()
    .valid('SURAT_SAKIT', 'SURAT_SEHAT', 'SURAT_BEROBAT', 'PERSETUJUAN', 'PENOLAKAN')
    .required(),
  isiSurat: Joi.string().allow(null, ''),
  tglMulai: Joi.date().iso().allow(null),
  tglSelesai: Joi.date().iso().allow(null),
  durasiHari: Joi.number().integer().allow(null),
});

// ======================== ICD-10 ===========================
export const icd10Schema = Joi.object({
  code: Joi.string().required(),
  description: Joi.string().required(),
  descriptionId: Joi.string().allow(null, ''),
  category: Joi.string().allow(null, ''),
  categoryName: Joi.string().allow(null, ''),
  chapter: Joi.string().allow(null, ''),
  isActive: Joi.boolean().default(true),
});

// ======================== SETTING ==========================
export const settingSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().allow(null, ''),
  category: Joi.string().allow(null, ''),
});

// ======================== PRINT TEMPLATE ===================
export const printTemplateSchema = Joi.object({
  tipePrinter: Joi.string().allow(null, ''),
  marginKiri: Joi.number().allow(null),
  marginKanan: Joi.number().allow(null),
  marginAtas: Joi.number().allow(null),
  marginBawah: Joi.number().allow(null),
  orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
  kertas: Joi.string().allow(null, ''),
  font: Joi.string().allow(null, ''),
  judul: Joi.string().allow(null, ''),
  alamat: Joi.string().allow(null, ''),
  telepon: Joi.string().allow(null, ''),
  email: Joi.string().allow(null, ''),
  logoPath: Joi.string().allow(null, ''),
  logoKeduaPath: Joi.string().allow(null, ''),
  skipHeader: Joi.boolean().default(false),
  keterangan: Joi.string().allow(null, ''),
  signatureKiri: Joi.string().allow(null, ''),
  signatureKanan: Joi.string().allow(null, ''),
  additionalInfo: Joi.object().allow(null),
});
