# Changelog

Semua perubahan penting pada project ini akan didokumentasikan dalam file ini.

Format ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-07

### Added
- Initial release dari RME-Klinik
- Sistem manajemen pasien lengkap
  - Registrasi pasien
  - Profil dan riwayat medis
  - Tracking data demografi
- Modul rekam medis elektronik
  - Pencatatan kunjungan
  - Manajemen diagnosis
  - Tracking tanda vital
- Sistem resep obat terintegrasi
  - Manajemen resep
  - Tracking obat
  - Checking interaksi obat (DDI)
- Modul farmasi dan apotek
  - Inventory management
  - Tracking konsumsi obat
  - Report penggunaan obat
- Sistem billing dan invoicing
  - Invoice management
  - Payment tracking
  - Financial reports
- Dashboard dan analytics
  - Data visualization dengan Chart.js
  - Statistik pasien
  - Laporan kesehatan
- Sistem autentikasi dan otorisasi
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Multi-user support
- Export data
  - Export ke Excel
  - Export ke PDF
  - Generate dokumen medis

### Security
- Password encryption dengan bcryptjs
- JWT token-based authentication
- CORS protection
- Input validation dengan Joi
- Role-based permission system

### Infrastructure
- Frontend build dengan Vite
- Backend dengan Express.js
- Database ORM dengan Prisma
- Version control dengan Git
- Professional project setup
  - MIT License
  - .editorconfig
  - .gitignore
  - Code of Conduct
  - Contributing guidelines

---

## Versionning

Project ini mengikuti [Semantic Versioning](https://semver.org/):

- **MAJOR** version untuk incompatible API changes
- **MINOR** version untuk penambahan functionality yang backward compatible
- **PATCH** version untuk bug fixes yang backward compatible

---

## Future Roadmap

### v1.1.0 (Coming Soon)
- [ ] Mobile app (React Native)
- [ ] Enhanced reporting dashboard
- [ ] SMS notification system
- [ ] Email notification system
- [ ] Backup & restore functionality

### v1.2.0
- [ ] Telemedicine features
- [ ] AI-powered diagnosis suggestions
- [ ] Multi-clinic management
- [ ] Integration dengan BPJS

### v2.0.0
- [ ] Complete redesign UI/UX
- [ ] Advanced analytics
- [ ] Machine learning features
- [ ] API v2 dengan GraphQL

---

## Support

Untuk pertanyaan atau issues, silakan buka issue di [GitHub Issues](../../issues)

---

**Last Updated: 2026-07-07**
