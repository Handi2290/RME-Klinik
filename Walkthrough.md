# Walkthrough Project RME Klinik

Dokumen ini menjelaskan alur kerja, struktur folder, dan cara menjalankan aplikasi RME Klinik secara umum.

## 1. Gambaran Umum
Project ini adalah aplikasi manajemen klinik berbasis web yang mencakup:
- Pendaftaran pasien dan antrean
- Rekam Medis Elektronik (RME)
- Manajemen obat dan apotek
- Kasir dan invoice
- Export data dan surat medis

Aplikasi terdiri dari dua bagian utama:
- Frontend: Vue 3 + Vite + Pinia + Vue Router
- Backend: Express + Prisma + PostgreSQL

## 2. Arsitektur Aplikasi

### Frontend
Frontend berada di folder root, dengan fokus utama pada UI dan routing.

Folder penting:
- src/ : entry utama aplikasi
- src/views/ : halaman berdasarkan modul seperti pendaftaran, EMR, apotek, kasir, dan settings
- src/components/ : komponen reusable UI
- src/stores/ : state management dengan Pinia
- src/router/ : konfigurasi routing
- src/composables/ : hook reusable untuk komunikasi API

### Backend
Backend berada di folder server/ dan menangani API, autentikasi, validasi, database, dan file upload.

Folder penting:
- server/src/index.js : entry point server Express
- server/src/controllers/ : logika bisnis per modul
- server/src/routes/ : definisi endpoint API
- server/src/middleware/ : auth, role guard, upload handler, error handling
- server/src/services/ : service khusus seperti Excel, PDF, ICD-10 import
- server/prisma/ : schema database dan seed data

## 3. Alur Penggunaan Aplikasi

### A. Login dan Akses
Aplikasi menggunakan autentikasi berbasis JWT. Setelah login, role pengguna akan menentukan akses modul.

Role yang tersedia:
- MASTER
- ADMIN
- DOKTER
- APOTEK

### B. Modul Pendaftaran
Pengguna dapat melakukan:
- Registrasi pasien baru
- Membuat kunjungan / antrean
- Melihat status antrean

### C. Modul Rekam Medis
Dokter dapat mengisi:
- SOAP
- Tanda vital
- Diagnosis ICD-10
- Alergi pasien
- Resep obat
- Surat medis

### D. Modul Apotek dan Kasir
Pengguna apotek/kasir dapat:
- Mengelola stok obat
- Memproses resep
- Membuat invoice
- Mencatat pembayaran

## 4. Cara Menjalankan Project Secara Lokal

### Prasyarat
- Node.js 18+
- npm
- PostgreSQL

### 1. Install dependency
```bash
cd /path/to/RME-Klinik
npm install
cd server
npm install
```

### 2. Siapkan database
Buat file `server/.env` terlebih dahulu, lalu jalankan:

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 3. Jalankan backend
```bash
cd server
npm run dev
```

Backend akan berjalan di port 3000.

### 4. Jalankan frontend
```bash
cd /path/to/RME-Klinik
npm run dev
```

Frontend akan berjalan di port 5173 secara default.

## 5. Login Default Setelah Seed
Jika database berhasil di-seed, akun berikut bisa dipakai:
- owner / admin123
- admin / admin123
- dokter / admin123
- apotek / admin123

## 6. Catatan Arsitektur yang Perlu Diperhatikan
- Frontend memanggil API melalui path `/api` dan `/uploads`.
- Saat development, Vite proxy akan mengarahkan request tersebut ke backend lokal.
- Untuk deployment production, perlu ada reverse proxy atau host yang mengarahkan traffic API ke backend.
- File upload disimpan di folder `server/uploads`.

## 7. Fokus Pengembangan yang Sering Dipakai
Untuk memahami bagian aplikasi paling penting, mulai dari modul berikut:
1. Pendaftaran pasien dan antrean
2. Rekam medis dokter
3. Manajemen obat dan resep
4. Invoice dan pembayaran
5. Pengaturan sistem dan template surat

## 8. Ringkasan Singkat
Project ini adalah sistem klinik digital lengkap yang menggabungkan workflow administrasi, rekam medis, farmasi, dan kasir dalam satu aplikasi web. Frontend memberikan pengalaman pengguna yang modern, sedangkan backend menyediakan API dan integrasi database yang terstruktur.
