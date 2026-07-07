# Contributing to RME-Klinik

Terima kasih telah tertarik untuk berkontribusi pada RME-Klinik! Dokumen ini menjelaskan bagaimana Anda dapat berkontribusi pada project ini.

## Code of Conduct

Project ini dan semua peserta diatur oleh [Code of Conduct](CODE_OF_CONDUCT.md). Dengan berpartisipasi, Anda diharapkan menjunjung tinggi kode ini.

## Bagaimana Saya Bisa Berkontribusi?

### 🐛 Melaporkan Bug

Sebelum membuat bug report, silakan periksa issue list karena Anda mungkin menemukan bug sudah dilaporkan.

Ketika membuat bug report, sertakan sebanyak mungkin detail:

* **Gunakan judul yang deskriptif** untuk issue
* **Deskripsi masalah secara detail**, dengan urutan langkah spesifik untuk mereproduksi
* **Berikan contoh spesifik** untuk mendemonstrasikan langkah-langkah
* **Jelaskan behavior yang diamati** dan **behavior yang diharapkan**
* **Include screenshots/video** jika memungkinkan
* **Cantumkan informasi environment** (OS, Node version, etc)

### 💡 Mengusulkan Enhancement

Ketika membuat enhancement suggestion, sertakan:

* **Gunakan judul yang deskriptif** untuk suggestion
* **Berikan deskripsi detail** tentang enhancement yang disarankan
* **Berikan contoh spesifik** untuk mendemonstrasikan penggunaan
* **Jelaskan mengapa enhancement ini bermanfaat**
* **Daftar project lain** yang mungkin sudah memiliki fitur serupa

## Pull Request Process

1. **Fork** repository dan buat branch baru dari `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server
   npm install
   ```

3. **Buat perubahan Anda**
   - Ikuti coding style project
   - Tulis atau update tests jika diperlukan
   - Update documentation jika diperlukan

4. **Test perubahan Anda**
   ```bash
   # Frontend
   npm run dev
   
   # Backend
   cd server
   npm run dev
   ```

5. **Commit dengan message yang jelas**
   ```bash
   git commit -m "Add: brief description of changes"
   ```

6. **Push ke branch Anda**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Buat Pull Request** dengan deskripsi yang detail

### PR Description Template

```markdown
## Description
Jelaskan perubahan yang Anda buat dengan jelas.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number) (jika ada)

## How to Test
Jelaskan bagaimana untuk test perubahan ini.

## Screenshots (jika applicable)
Tambahkan screenshots untuk UI changes.

## Checklist
- [ ] Kode saya mengikuti project style guidelines
- [ ] Saya telah melakukan self-review terhadap kode saya
- [ ] Saya telah menambahkan comments untuk kode yang kompleks
- [ ] Saya telah update documentation yang relevan
- [ ] Perubahan saya tidak menghasilkan warning baru
- [ ] Saya telah test perubahan saya secara lokal
```

## Coding Style

### JavaScript/Vue

- Gunakan **2 spaces** untuk indentation
- Gunakan **single quotes** untuk string
- Gunakan **ES6 syntax** (arrow functions, const/let, template literals)
- Hindari global variables
- Gunakan meaningful variable names

### Contoh

```javascript
// Good
const calculateAge = (birthDate) => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
};

// Bad
var calculateAge = function(b) {
  var t = new Date();
  var a = t.getFullYear() - b.getFullYear();
  return a;
};
```

### Vue Components

```vue
<template>
  <div class="component-container">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: String,
  description: String,
});

const count = ref(0);

const increment = () => {
  count.value++;
};
</script>

<style scoped>
.component-container {
  padding: 1rem;
}
</style>
```

## Commit Message Guidelines

- Gunakan **present tense** ("Add" bukan "Added")
- Gunakan **imperative mood** ("Move cursor to..." bukan "Moves cursor to...")
- Prefix dengan tipe perubahan:
  - `Add:` untuk fitur baru
  - `Fix:` untuk bug fixes
  - `Update:` untuk update dokumentasi atau style
  - `Refactor:` untuk code refactoring
  - `Remove:` untuk menghapus fitur/file

### Contoh

```
Add: patient search functionality
Fix: incorrect date calculation in age field
Update: README with installation instructions
Refactor: extract form validation logic
Remove: deprecated API endpoint
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm atau yarn

### Setup Local Environment

```bash
# Clone repository
git clone https://github.com/Handi2290/RME-Klinik.git
cd RME-Klinik

# Install dependencies
npm install
cd server
npm install

# Setup .env file
cp .env.example .env

# Run database migrations
npx prisma migrate dev
```

### Running Tests

```bash
# Frontend
npm run test

# Backend
cd server
npm run test
```

## Project Structure

```
RME-Klinik/
├── src/                    # Frontend
├── server/                 # Backend
├── Documentation.md        # Detailed documentation
├── README.md              # Project README
└── CONTRIBUTING.md        # This file
```

## Additional Notes

### Performance Considerations

- Minimize database queries (use eager loading)
- Cache frequently accessed data
- Lazy load components when possible
- Optimize images and assets

### Security Considerations

- Always validate input on server side
- Use prepared statements untuk database queries
- Keep dependencies updated
- Never commit sensitive data (API keys, passwords)

### Database Schema Changes

Jika Anda membuat perubahan database schema:

1. Buat migration baru:
   ```bash
   cd server
   npx prisma migrate dev --name descriptive_name
   ```

2. Commit file migration
3. Update `Documentation.md` dengan schema changes

## Questions?

Jangan ragu untuk membuka issue dengan tag `question` atau hubungi maintainer.

## License

Dengan berkontribusi pada project ini, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License yang sama.

---

**Terima kasih atas kontribusi Anda! 🎉**
