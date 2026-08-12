# Kontribusi ke SahamLens

Terima kasih sudah tertarik berkontribusi ke SahamLens. Panduan ini menjelaskan cara menyiapkan project, mengembangkan fitur, menjalankan checks, dan membuat pull request.

## Prasyarat

- [Bun](https://bun.sh/) versi terbaru
- [Git](https://git-scm.com/) versi 2.0 atau lebih baru
- Akun GitHub untuk fork dan pull request

## Setup

```bash
git clone https://github.com/IDNCraft/SahamLens.git
cd SahamLens
bun install
bun run build
```

## Development Workflow

1. Fork repository lalu clone fork kamu
2. Buat branch baru mengikuti aturan penamaan di bawah
3. Buat perubahan yang fokus dan mudah ditinjau
4. Jalankan development server dengan `bun run dev`
5. Jalankan checks sebelum commit
6. Push branch lalu buat pull request ke `main`

## Branch Naming

Gunakan format `dev#<deskripsi>`:

- Gunakan huruf kecil
- Gunakan tanda hubung untuk pemisah kata
- Maksimal 3-5 kata
- Gunakan deskripsi yang spesifik

| Contoh                   | Status                       |
| ------------------------ | ---------------------------- |
| `dev#improve-parser`     | Baik                         |
| `dev#add-history-filter` | Baik                         |
| `feature/parser`         | Hindari, format tidak sesuai |
| `fix`                    | Hindari, terlalu umum        |

## Commit Messages

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <deskripsi>

[body opsional]
```

| Type        | Penggunaan                            |
| ----------- | ------------------------------------- |
| `feat:`     | Fitur baru                            |
| `fix:`      | Perbaikan bug                         |
| `docs:`     | Dokumentasi                           |
| `refactor:` | Refactor tanpa perubahan behavior     |
| `test:`     | Test                                  |
| `chore:`    | Tooling, dependency, atau konfigurasi |
| `perf:`     | Perbaikan performa                    |
| `style:`    | Formatting atau style kode            |

## Code Standards

### TypeScript dan React

- Gunakan strict type safety; hindari `any`
- Gunakan nama variable dan function yang jelas
- Ikuti pola komponen dan util yang sudah ada
- Pertahankan pemrosesan data tetap berjalan di browser
- Jangan menambahkan akses ke akun atau data pribadi Stockbit

### UI dan Accessibility

- Gunakan komponen dan token visual yang sudah ada
- Pastikan control bisa dipakai dengan keyboard
- Sertakan `aria-label` untuk icon-only button atau link
- Pastikan teks dan control tetap terbaca di mobile
- Hormati `prefers-reduced-motion` untuk animasi

### Parser dan Analysis Rules

- Sertakan contoh snapshot jika mengubah parser
- Tambahkan penanganan data yang hilang atau format tidak dikenal
- Jelaskan perubahan skor jika mengubah aturan analisis
- Hindari mengubah data input asli secara diam-diam

### Formatting

Jalankan formatter sebelum membuat pull request:

```bash
bun run format
```

## Checks

```bash
bun run lint
bun run build
bun run format:check
```

Jika mengubah parser atau aturan analisis, lakukan verifikasi manual melalui development server:

```bash
bun run dev
```

## Pull Request Guidelines

1. Satu pull request berisi satu fitur atau perbaikan utama
2. Jelaskan masalah dan solusi secara singkat
3. Sertakan screenshot jika perubahan memengaruhi UI
4. Sertakan contoh input jika perubahan memengaruhi parser
5. Jelaskan dampak terhadap skor jika mengubah analysis rules
6. Pastikan `bun run lint` dan `bun run build` berhasil
7. Update dokumentasi jika behavior user-facing berubah

## Struktur Project

```text
src/
├── components/   # Komponen UI berdasarkan domain
├── utils/        # Parser, analysis, history, dan helper
├── App.tsx       # Root component dan state workflow utama
├── App.css       # Style template yang tersisa
└── index.css     # Token visual dan style aplikasi
public/           # Asset statis
```

| Area       | File utama                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Input      | `src/components/input/InputPanel.tsx`                                   |
| Stock data | `src/components/stock/StockDataViews.tsx`                               |
| Analysis   | `src/components/analysis/AnalysisPanel.tsx` dan `src/utils/analysis.ts` |
| History    | `src/components/history/HistoryViews.tsx` dan `src/utils/history.ts`    |
| Parser     | `src/utils/parser.ts`                                                   |
| Types      | `src/utils/types.ts`                                                    |

## Membuka Issue

Gunakan issue untuk melaporkan bug, mengusulkan fitur, atau membahas perubahan behavior. Sertakan:

- Langkah untuk mereproduksi
- Input yang digunakan jika relevan
- Behavior yang diharapkan dan yang terjadi
- Browser dan versi OS
- Screenshot atau console error jika tersedia

## Lisensi

SahamLens dirilis di bawah [MIT License](LICENSE). Jangan menambahkan dependency atau asset berlisensi tanpa memastikan hak penggunaannya.
