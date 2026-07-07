Laporan ini menyajikan detail **Business Requirement Document (BRD)** dan rancangan **Entity Relationship Diagram (ERD)** untuk sistem Rekam Medis Elektronik (RME) Klinik Keluarga Sehat. Dokumen ini disusun berdasarkan transkrip wawancara dengan end-user dan tangkapan layar sistem referensi yang disediakan.

---

### **1. Business Requirement Document (BRD)**

#### **A. Tujuan Sistem**
Sistem ini bertujuan untuk mendigitalkan seluruh proses operasional klinik, mulai dari pendaftaran, pemeriksaan medis (RME), pengelolaan farmasi, hingga kasir, dengan antarmuka yang bersih dan mudah digunakan (user-friendly).

#### **B. Peran Pengguna (User Roles) & Hak Akses**
Sistem akan memiliki empat peran utama:
1.  **Master (Owner):** Memiliki hak akses penuh ke seluruh sistem, termasuk pengaturan staf, manajemen password, dan hak akses.
2.  **Admin Pendaftaran:** Mengelola registrasi pasien, antrean, dan mencatat data dasar pasien.
3.  **Dokter:** Berfokus pada pengisian rekam medis (SOAP), diagnosis (ICD-10), resep obat, dan pembuatan surat medis.
4.  **Apotek & Kasir:** Mengelola stok obat, memproses resep, dan mencatat transaksi pembayaran (Tunai/QRIS).

#### **C. Kebutuhan Fungsional per Modul**

**1. Modul Pendaftaran & Antrean**
*   **Registrasi Pasien:** Mencatat Nama, Tanggal Lahir, Alamat, Nomor HP, dan Nomor KTP (opsional). Nomor Rekam Medis (RM) dihasilkan otomatis oleh sistem.
*   **Dashboard Antrean:** Menampilkan status pasien secara *real-time*:
    *   *Pending*: Reservasi awal.
    *   *Confirmed*: Sudah dikonfirmasi admin.
    *   *Waiting*: Berada di ruang tunggu.
    *   *Engaged*: Sedang diperiksa dokter.
    *   *Success/Down*: Selesai pemeriksaan dan pembayaran.
*   **Sortir Antrean:** Pasien yang belum ditangani (Confirmed/Waiting) berada di atas, sedangkan yang sudah selesai (Success) di bawah.

**2. Modul Rekam Medis Elektronik (RME)**
*   **Format SOAP:** Pencatatan medis menggunakan standar Subjektif, Objektif, Asesmen, dan Plan.
*   **Vital Signs:** Mencatat berat badan, tinggi badan, suhu tubuh, pernapasan, tensi darah, saturasi oksigen (SpO2), dan gula darah. Sistem dapat menghitung BMI secara otomatis.
*   **Diagnosis ICD-10:** Fitur pencarian kode ICD-10 dengan kamus bawaan. Jika kode tidak ditemukan, dokter dapat mengisi diagnosis secara manual.
*   **Manajemen Alergi:** Mencatat alergi umum dan alergi obat. **Peringatan alergi harus ditampilkan dengan warna merah mencolok** agar dokter segera menyadarinya.
*   **Riwayat Medis (Timeline):** Riwayat kunjungan ditampilkan dalam bentuk timeline yang informatif untuk melihat tren kesehatan pasien.
*   **Edit History:** Fitur edit data medis tidak boleh menampilkan "coretan" (strike-through) yang mengganggu estetika; sistem harus menyimpan log perubahan di latar belakang.

**3. Modul Farmasi & Inventori**
*   **E-Resep:** Mendukung resep obat standar dan resep racikan (*puyer*).
*   **Manajemen Stok:** Stok obat berkurang otomatis setelah resep diproses.
*   **Peringatan Stok & Expired:** Menampilkan notifikasi jika obat mendekati tanggal kedaluwarsa atau stok rendah.

**4. Modul Surat Medis**
*   Mencetak Surat Sakit (dengan durasi hari otomatis), Surat Keterangan Sehat, Surat Keterangan Berobat, serta Surat Persetujuan/Penolakan Tindakan Medis.
*   **Keamanan:** Tidak menggunakan barcode/QR code rumit untuk menghindari penyalahgunaan data medis oleh pihak luar.

**5. Modul Kasir & Pelaporan**
*   **Pembayaran:** Mendukung metode Tunai dan QRIS.
*   **Invoice:** Detail harga obat tidak ditampilkan di struk pasien secara default (hanya total harga), kecuali diminta.
*   **Laporan:** Export data harian dan bulanan ke format Excel.

#### **D. Kebutuhan Non-Fungsional**
*   **Keamanan Akun:** Satu akun hanya diperbolehkan login di satu perangkat (*single session*).
*   **Integrasi Masa Depan:** Struktur data harus kompatibel dengan standar Satu Sehat dan BPJS, meskipun integrasi aktif belum dilakukan saat ini.

---

### **2. Entity Relationship Diagram (ERD)**

Berdasarkan kebutuhan bisnis tersebut, berikut adalah struktur entitas dan hubungannya:

#### **Entitas & Atribut Utama:**
1.  **Users:** `user_id` (PK), `username`, `password`, `role` (Master/Dokter/Apotek/Admin), `nama_staf`, `no_hp`.
2.  **Patients:** `patient_id` (PK), `no_rm` (Unique), `nama_pasien`, `tgl_lahir`, `jenis_kelamin`, `alamat`, `no_ktp`, `no_hp`.
3.  **Allergies:** `allergy_id` (PK), `patient_id` (FK), `tipe_alergi` (Obat/Umum), `nama_alergi`, `keterangan`.
4.  **Visits (Antrean):** `visit_id` (PK), `patient_id` (FK), `user_id` (FK-Dokter), `tgl_kunjungan`, `jam_kunjungan`, `status_antrean` (Pending/Waiting/Engaged/Success).
5.  **Medical_Records (SOAP):** `mr_id` (PK), `visit_id` (FK), `subjective`, `objective`, `assessment`, `plan`, `tgl_periksa`.
6.  **Vital_Signs:** `vs_id` (PK), `mr_id` (FK), `berat_badan`, `tinggi_badan`, `suhu`, `tensi`, `nadi`, `respirasi`, `saturasi_o2`, `gula_darah`, `bmi`.
7.  **ICD10_Master:** `icd_code` (PK), `description`.
8.  **Diagnoses:** `diag_id` (PK), `mr_id` (FK), `icd_code` (FK), `catatan_manual`.
9.  **Medicines:** `medicine_id` (PK), `nama_obat`, `stok_saat_ini`, `satuan`, `harga_jual`, `tgl_expired`.
10. **Prescriptions:** `presc_id` (PK), `mr_id` (FK), `medicine_id` (FK), `jumlah`, `aturan_pakai`, `is_racikan` (Boolean).
11. **Medical_Letters:** `letter_id` (PK), `mr_id` (FK), `tipe_surat`, `isi_surat`, `tgl_mulai`, `tgl_selesai`.
12. **Invoices:** `invoice_id` (PK), `visit_id` (FK), `total_bayar`, `metode_bayar` (Tunai/QRIS), `status_bayar`.

#### **Hubungan (Relationships):**
*   **Patients (1) --- (N) Allergies:** Satu pasien bisa memiliki banyak catatan alergi.
*   **Patients (1) --- (N) Visits:** Satu pasien dapat melakukan banyak kunjungan dari waktu ke waktu.
*   **Visits (1) --- (1) Medical_Records:** Satu kunjungan menghasilkan satu catatan pemeriksaan SOAP.
*   **Medical_Records (1) --- (1) Vital_Signs:** Setiap catatan medis memiliki satu set data tanda vital.
*   **Medical_Records (1) --- (N) Diagnoses:** Satu pemeriksaan bisa menghasilkan lebih dari satu diagnosa penyakit.
*   **Medical_Records (1) --- (N) Prescriptions:** Dokter dapat meresepkan beberapa obat dalam satu kunjungan.
*   **Medical_Records (1) --- (N) Medical_Letters:** Satu kunjungan bisa menghasilkan berbagai jenis surat keterangan.
*   **Visits (1) --- (1) Invoices:** Setiap kunjungan diakhiri dengan satu proses transaksi pembayaran.
*   **Medicines (1) --- (N) Prescriptions:** Satu jenis obat dapat diresepkan kepada banyak pasien berbeda.

Laporan ini mencakup seluruh kebutuhan inti yang disampaikan dalam sesi interview untuk memastikan sistem RME yang dibangun sesuai dengan alur kerja Klinik Keluarga Sehat.

---

### **3. Cara Deploy Aplikasi**

Berikut adalah alur deploy yang sesuai dengan struktur project saat ini, yang terdiri dari frontend Vue 3 + Vite dan backend Express + Prisma.

#### **A. Prasyarat**
- Node.js 18+ dan npm
- PostgreSQL yang sudah berjalan
- (Opsional) PM2/Nginx untuk deploy di VPS

#### **B. Siapkan Environment Backend**
Buat file `server/.env` dengan isi berikut:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="ganti-dengan-string-rahasia"
```

Pastikan folder `server/uploads` bisa ditulis oleh proses aplikasi.

#### **C. Install Dependency**
```bash
cd /path/to/RME-Klinik
npm install
cd server
npm install
```

#### **D. Jalankan Migrasi Database**
```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

Perintah di atas akan membuat tabel database dan mengisi data awal seperti user, pasien, obat, ICD-10, dan setting dasar.

#### **E. Build Frontend**
```bash
cd /path/to/RME-Klinik
npm run build
```

Hasil build akan berada di folder `dist/`.

#### **F. Jalankan Backend**
Untuk mode produksi, jalankan backend dengan:

```bash
cd server
npm start
```

Jika deploy di VPS, disarankan gunakan PM2:

```bash
npm install -g pm2
pm2 start npm --name rme-klinik-server -- start
```

#### **G. Serve Frontend dan Backend**
Ada dua pendekatan deploy yang umum:

1. **Deploy di VPS / Server Mandiri**
   - Build frontend ke folder `dist/`
   - Letakkan hasil build di direktori web seperti `/var/www/rme-klinik`
   - Gunakan Nginx untuk mengarahkan:
     - `/` ke hasil build frontend
     - `/api` dan `/uploads` ke backend Express di port `3000`

   Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/rme-klinik;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **Deploy ke PaaS (Render / Railway / Fly.io / Vercel untuk frontend)**
   - Deploy backend ke Render/Railway/Fly.io dengan start command:

```bash
cd server && npm start
```

   - Deploy frontend ke Vercel/Netlify dengan build command:

```bash
npm run build
```

   - Pastikan domain frontend dapat mengakses backend melalui URL API yang konsisten. Jika menggunakan domain berbeda, tambahkan domain tersebut ke whitelist CORS pada server.

#### **H. Catatan Penting**
- Frontend sudah dikonfigurasi menggunakan proxy Vite di mode development untuk mengarahkan `/api` dan `/uploads` ke `http://localhost:3000`.
- Untuk produksi, pastikan reverse proxy atau hosting backend sudah mengarahkan request tersebut dengan benar.
- Jika ingin login ke sistem awal, seed data membuat akun default berikut:
  - `owner` / `admin123`
  - `admin` / `admin123`
  - `dokter` / `admin123`
  - `apotek` / `admin123`
