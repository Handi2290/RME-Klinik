# 🏥 RME-Klinik

**Rumah Medis Electronic (RME-Klinik)** adalah sistem manajemen rekam medis elektronik yang komprehensif untuk klinik modern. Dibangun dengan teknologi terkini untuk meningkatkan efisiensi administrasi kesehatan dan pelayanan pasien.

[![GitHub License](https://img.shields.io/github/license/Handi2290/RME-Klinik)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/Handi2290/RME-Klinik)](../../releases)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## ✨ Fitur Utama

### 👥 Manajemen Pasien
- Registrasi dan profil pasien lengkap
- Riwayat medis pasien
- Manajemen data demografi
- Tracking status pasien

### 📋 Rekam Medis Elektronik
- Catatan kunjungan medis
- Diagnosis dan tanda vital
- Resep obat terintegrasi
- Alergis dan riwayat penyakit

### 💊 Manajemen Farmasi
- Inventory obat
- Interaksi obat (DDI - Drug-Drug Interactions)
- Manajemen gudang apotek
- Tracking konsumsi obat

### 💰 Sistem Keuangan
- Billing dan invoicing
- Manajemen pembayaran
- Laporan keuangan
- Integrasi kasir

### 📊 Analitik & Laporan
- Statistik pasien
- Laporan kesehatan
- Export data (Excel, PDF)
- Dashboard interaktif dengan Chart.js

### 🔐 Keamanan
- Autentikasi JWT
- Kontrol akses berbasis role (RBAC)
- Enkripsi password dengan bcrypt
- Manajemen lisensi

### 📄 Dokumen Medis
- Surat sakit
- Surat sehat
- Struk pembayaran
- Template dokumen yang dapat dikustomisasi

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript Framework
- **Vite** - Next Generation Frontend Tooling
- **Vue Router** - Routing untuk SPA
- **Pinia** - State Management
- **Axios** - HTTP Client
- **Chart.js** - Data Visualization
- **XLSX** - Excel Export

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **Prisma** - ORM Database
- **PostgreSQL/SQLite** - Database
- **JWT** - Authentication
- **Multer** - File Upload
- **Puppeteer** - PDF Generation
- **Google GenAI** - AI Integration

### Tools
- **Nodemon** - Development Server
- **Morgan** - HTTP Logging
- **CORS** - Cross-Origin Resource Sharing
- **Joi** - Data Validation
- **bcryptjs** - Password Hashing

## 📦 Instalasi

### Prerequisites
- Node.js >= 18.0.0
- npm atau yarn
- Database (PostgreSQL atau SQLite)

### Setup Project

1. **Clone Repository**
```bash
git clone https://github.com/Handi2290/RME-Klinik.git
cd RME-Klinik
```

2. **Install Dependencies - Frontend**
```bash
npm install
```

3. **Install Dependencies - Backend**
```bash
cd server
npm install
```

4. **Setup Environment Variables**
```bash
# Di folder server/, buat file .env berdasarkan .env.example
cp .env.example .env

# Edit .env dengan konfigurasi database Anda
nano .env
```

5. **Setup Database**
```bash
# Jalankan Prisma migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

## 🚀 Development

### Menjalankan Frontend (Development Mode)
```bash
# Dari root folder
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

### Menjalankan Backend (Development Mode)
```bash
# Dari folder server/
npm run dev
```
Backend akan berjalan di: `http://localhost:3000`

### Build untuk Production
```bash
# Frontend
npm run build

# Output akan di folder dist/
```

### Preview Production Build
```bash
npm run preview
```

## 🗄️ Database Management

### Prisma Commands
```bash
cd server

# Buat migration baru
npx prisma migrate dev --name <migration_name>

# Reset database (development only)
npx prisma migrate reset

# Buka Prisma Studio (GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## 📁 Struktur Project

```
RME-Klinik/
├── src/                          # Frontend Vue
│   ├── components/               # Vue Components
│   ├── views/                    # Page Components
│   ├── router/                   # Vue Router Config
│   ├── stores/                   # Pinia Stores
│   ├── composables/              # Vue Composables
│   ├── assets/                   # CSS dan Static Assets
│   └── utils/                    # Utility Functions
├── server/                       # Backend Express
│   ├── src/
│   │   ├── controllers/          # Request Handlers
│   │   ├── routes/               # API Routes
│   │   ├── middleware/           # Express Middleware
│   │   ├── services/             # Business Logic
│   │   ├── utils/                # Utility Functions
│   │   ├── config/               # Configuration
│   │   └── index.js              # Entry Point
│   ├── prisma/
│   │   ├── schema.prisma         # Database Schema
│   │   └── migrations/           # DB Migrations
│   ├── templates/                # HTML Templates
│   ├── scripts/                  # Database Scripts
│   └── package.json
├── package.json                  # Frontend Dependencies
├── vite.config.js                # Vite Configuration
├── Documentation.md              # Detailed Documentation
├── LICENSE                       # MIT License
└── README.md                     # This File

```

## 🔐 API Routes

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `POST /api/auth/logout` - Logout user

### Patients
- `GET /api/patients` - List pasien
- `POST /api/patients` - Buat pasien baru
- `GET /api/patients/:id` - Detail pasien
- `PUT /api/patients/:id` - Update pasien
- `DELETE /api/patients/:id` - Hapus pasien

### Medical Records
- `GET /api/medical-records` - List rekam medis
- `POST /api/medical-records` - Buat rekam medis
- `GET /api/medical-records/:id` - Detail rekam medis

### Medicines
- `GET /api/medicines` - List obat
- `POST /api/medicines` - Tambah obat
- `GET /api/medicines/ddi/check` - Check interaksi obat

### Prescriptions
- `GET /api/prescriptions` - List resep
- `POST /api/prescriptions` - Buat resep

### Invoices
- `GET /api/invoices` - List invoice
- `POST /api/invoices` - Buat invoice

*Lihat Documentation.md untuk API lengkap*

## 🔒 Roles & Permissions

- **Admin** - Full access ke semua fitur
- **Doctor** - Akses mengelola pasien, resep, dan rekam medis
- **Nurse** - Akses mengelola vital signs dan data pasien
- **Receptionist** - Akses registrasi dan appointment
- **Pharmacist** - Akses manajemen farmasi
- **Cashier** - Akses manajemen pembayaran

## 📝 Environment Variables

Buat file `.env` di folder `server/`:

```env
# Database
DATABASE_URL="file:./dev.db"
# atau untuk PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/rme_klinik"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development

# Google GenAI (optional)
GOOGLE_API_KEY=your_google_api_key_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🧪 Testing

```bash
# Jalankan tests (jika tersedia)
npm run test
```

## 🚢 Deployment

### Docker (Optional)
```bash
# Build image
docker build -t rme-klinik .

# Run container
docker run -p 3000:3000 rme-klinik
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure database production
- [ ] Setup JWT secret yang kuat
- [ ] Enable CORS untuk domain yang sesuai
- [ ] Setup SSL/TLS certificate
- [ ] Configure logging dan monitoring
- [ ] Setup backup database
- [ ] Test semua fitur di production environment

## 📚 Documentation

Dokumentasi lengkap tersedia di [Documentation.md](Documentation.md) dan [Walkthrough.md](Walkthrough.md)

## 🤝 Contributing

Kontribusi sangat diterima! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines.

### Development Workflow
1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📋 Roadmap

- [ ] Mobile app (React Native)
- [ ] Telemedicine integration
- [ ] AI-powered diagnosis suggestion
- [ ] Advanced analytics dashboard
- [ ] Multi-clinic management
- [ ] SMS notification system
- [ ] Integration dengan BPJS
- [ ] Backup & disaster recovery system
- [ ] Audit trail lengkap
- [ ] Performance optimization

## 🐛 Bug Reporting

Temukan bug? Buka issue di [GitHub Issues](../../issues) dengan detail:
- Deskripsi bug
- Steps untuk reproduce
- Expected vs actual behavior
- Screenshot (jika relevan)

## 📞 Support

Untuk support atau pertanyaan:
- Email: support@rme-klinik.com
- GitHub Issues: [Issues](../../issues)
- Documentation: [Documentation.md](Documentation.md)

## 📄 License

Project ini dilisensikan di bawah MIT License - lihat [LICENSE](LICENSE) file untuk detail.

## 👨‍💻 Author

**Handi**
- GitHub: [@Handi2290](https://github.com/Handi2290)

## 🙏 Acknowledgments

- Vue.js community
- Express.js community
- Prisma documentation
- All contributors dan users

---

**Made with ❤️ for better healthcare management**

