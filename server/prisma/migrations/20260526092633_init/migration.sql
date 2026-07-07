-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'ADMIN', 'DOKTER', 'APOTEK');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "TipeAlergi" AS ENUM ('OBAT', 'UMUM');

-- CreateEnum
CREATE TYPE "StatusAntrean" AS ENUM ('PENDING', 'CONFIRMED', 'WAITING', 'ENGAGED', 'SUCCEED');

-- CreateEnum
CREATE TYPE "TipeSurat" AS ENUM ('SURAT_SAKIT', 'SURAT_SEHAT', 'SURAT_BEROBAT', 'PERSETUJUAN', 'PENOLAKAN');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('TUNAI', 'QRIS');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('LUNAS', 'BELUM_LUNAS');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "namaStaf" TEXT NOT NULL,
    "jabatan" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "noPegawai" TEXT,
    "catatan" TEXT,
    "tglLahir" TIMESTAMP(3),
    "isPic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "noRm" TEXT NOT NULL,
    "namaPasien" TEXT NOT NULL,
    "tglLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "alamat" TEXT,
    "noKtp" TEXT,
    "noHp" TEXT,
    "email" TEXT,
    "tipePasien" TEXT NOT NULL DEFAULT 'Umum',
    "noAsuransi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "tipeAlergi" "TipeAlergi" NOT NULL,
    "namaAlergi" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "dokterId" INTEGER,
    "tglKunjungan" TIMESTAMP(3) NOT NULL,
    "jamKunjungan" TEXT,
    "statusAntrean" "StatusAntrean" NOT NULL DEFAULT 'PENDING',
    "noAntrean" TEXT,
    "poli" TEXT NOT NULL DEFAULT 'Umum',
    "jenisKunjungan" TEXT,
    "jenisPerawatan" TEXT NOT NULL DEFAULT 'Rawat Jalan',
    "keluhan" TEXT,
    "lamaPeriksa" INTEGER NOT NULL DEFAULT 10,
    "tipeBayar" TEXT NOT NULL DEFAULT 'Langsung',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "tglPeriksa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "beratBadan" DOUBLE PRECISION,
    "tinggiBadan" DOUBLE PRECISION,
    "suhu" DOUBLE PRECISION,
    "tensi" TEXT,
    "nadi" INTEGER,
    "respirasi" INTEGER,
    "saturasiO2" DOUBLE PRECISION,
    "gulaDarah" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "lingkarPerut" DOUBLE PRECISION,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd10_master" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionId" TEXT,
    "category" TEXT,
    "categoryName" TEXT,
    "chapter" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icd10_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "icdId" INTEGER,
    "icdCode" TEXT,
    "deskripsi" TEXT,
    "catatanManual" TEXT,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicines" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaObat" TEXT NOT NULL,
    "farmasi" TEXT,
    "jenis" TEXT,
    "kategori" TEXT,
    "satuan" TEXT,
    "dosis" TEXT,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "hargaUmum" DOUBLE PRECISION,
    "hargaBeli" DOUBLE PRECISION,
    "avgHpp" DOUBLE PRECISION,
    "hargaOtc" DOUBLE PRECISION,
    "marginProfit" DOUBLE PRECISION,
    "tglExpired" TIMESTAMP(3),
    "nomorBatch" TEXT,
    "barcode" TEXT,
    "kfaCode" TEXT,
    "kandungan" TEXT,
    "deskripsi" TEXT,
    "kunciHarga" BOOLEAN NOT NULL DEFAULT false,
    "depot" TEXT NOT NULL DEFAULT 'Apotek',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumables" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "brand" TEXT,
    "jenis" TEXT,
    "satuan" TEXT,
    "ukuranDosis" TEXT,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "hargaUmum" DOUBLE PRECISION,
    "hargaBeli" DOUBLE PRECISION,
    "avgHpp" DOUBLE PRECISION,
    "hargaOtc" DOUBLE PRECISION,
    "marginProfit" DOUBLE PRECISION,
    "tglExpired" TIMESTAMP(3),
    "nomorBatch" TEXT,
    "barcode" TEXT,
    "kunciHarga" BOOLEAN NOT NULL DEFAULT false,
    "bisaDijualApotek" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "depot" TEXT NOT NULL DEFAULT 'Apotek',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "medicineId" INTEGER,
    "namaObat" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "satuan" TEXT,
    "aturanPakai" TEXT,
    "frekuensi" TEXT,
    "isRacikan" BOOLEAN NOT NULL DEFAULT false,
    "namaRacikan" TEXT,
    "tipeRacik" TEXT,
    "depot" TEXT NOT NULL DEFAULT 'Apotek',
    "kfaCode" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_letters" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "tipeSurat" "TipeSurat" NOT NULL,
    "isiSurat" TEXT,
    "tglMulai" TIMESTAMP(3),
    "tglSelesai" TIMESTAMP(3),
    "durasiHari" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "visitId" INTEGER NOT NULL,
    "noInvoice" TEXT NOT NULL,
    "noKwitansi" TEXT,
    "totalBayar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pembulatan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metodeBayar" "MetodeBayar" NOT NULL DEFAULT 'TUNAI',
    "statusBayar" "StatusBayar" NOT NULL DEFAULT 'BELUM_LUNAS',
    "dibayarOleh" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "depot" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "harga" DOUBLE PRECISION NOT NULL,
    "diskon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHarga" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nominal" DOUBLE PRECISION NOT NULL,
    "metodeBayar" TEXT NOT NULL,
    "penanggungJawab" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edit_history" (
    "id" SERIAL NOT NULL,
    "mrId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_templates" (
    "id" SERIAL NOT NULL,
    "tipePrinter" TEXT NOT NULL DEFAULT 'inkjet',
    "marginKiri" TEXT NOT NULL DEFAULT '1 inch',
    "marginKanan" TEXT NOT NULL DEFAULT '1 inch',
    "marginAtas" TEXT NOT NULL DEFAULT '1 inch',
    "marginBawah" TEXT NOT NULL DEFAULT '1 inch',
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "kertas" TEXT NOT NULL DEFAULT 'A4',
    "font" TEXT NOT NULL DEFAULT '12pt',
    "judul" TEXT NOT NULL DEFAULT 'Klinik Keluarga Sehat',
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "logoPath" TEXT,
    "logoKeduaPath" TEXT,
    "skipHeader" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "signatureKiri" TEXT,
    "signatureKanan" TEXT,
    "additionalInfo" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "category" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "patients_noRm_key" ON "patients"("noRm");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_visitId_key" ON "medical_records"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "vital_signs_mrId_key" ON "vital_signs"("mrId");

-- CreateIndex
CREATE UNIQUE INDEX "icd10_master_code_key" ON "icd10_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "medicines_kode_key" ON "medicines"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "consumables_kode_key" ON "consumables"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_visitId_key" ON "invoices"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_noInvoice_key" ON "invoices"("noInvoice");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_icdId_fkey" FOREIGN KEY ("icdId") REFERENCES "icd10_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_letters" ADD CONSTRAINT "medical_letters_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_history" ADD CONSTRAINT "edit_history_mrId_fkey" FOREIGN KEY ("mrId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
