export const STATUS_COLORS = {
  PENDING: { bg: '#FFEBEE', color: '#F44336', label: 'Pending' },
  CONFIRMED: { bg: '#FFF3E0', color: '#FF9800', label: 'Confirmed' },
  WAITING: { bg: '#F3E5F5', color: '#9C27B0', label: 'Waiting' },
  ENGAGED: { bg: '#E3F2FD', color: '#2196F3', label: 'Engaged' },
  SUCCEED: { bg: '#E8F5E9', color: '#4CAF50', label: 'Succeed' },
}

export const ROLES = {
  MASTER: 'Owner/Master',
  ADMIN: 'Admin Pendaftaran',
  DOKTER: 'Dokter',
  APOTEK: 'Apoteker',
}

export const ROLE_REDIRECT = {
  MASTER: '/rawat-jalan',
  ADMIN: '/rawat-jalan',
  DOKTER: '/emr',
  APOTEK: '/apotek/antrean',
}

export const TIPE_SURAT = {
  SURAT_SAKIT: 'Surat Keterangan Sakit',
  SURAT_SEHAT: 'Surat Keterangan Sehat',
  SURAT_BEROBAT: 'Surat Keterangan Berobat',
  PERSETUJUAN: 'Surat Persetujuan',
  PENOLAKAN: 'Surat Penolakan',
}

export const METODE_BAYAR = [
  { value: 'TUNAI', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
]

export const POLI_OPTIONS = ['Umum', 'Gigi', 'Anak', 'THT', 'Mata', 'Kulit']

export const JENIS_KUNJUNGAN = ['Kunjungan Baru', 'Kunjungan Lama', 'Rujukan']

export const JENIS_PERAWATAN = ['Rawat Jalan']

export const TIPE_PASIEN = ['Umum', 'BPJS']
