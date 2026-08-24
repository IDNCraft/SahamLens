<h1 align="center">SahamLens</h1>

<p align="center">
 <strong>Ubah snapshot saham menjadi data yang siap dibaca.</strong><br />
 Aplikasi web lokal untuk membaca metrik, meninjau skor berbasis aturan, dan memantau perubahan emiten dari waktu ke waktu.
</p>

<p align="center">
 <a href="#mulai-cepat">Mulai Cepat</a> ·
 <a href="#fitur">Fitur</a> ·
 <a href="docs/privacy-and-snapshot-behavior.md">Privasi &amp; snapshot</a> ·
 <a href="#kontribusi">Kontribusi</a>
</p>

<p align="center">
 <a href="https://react.dev/"><img src="https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react&logoColor=white" alt="Built with React" /></a>
 <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/Built%20with-TypeScript-3178C6?logo=typescript&logoColor=white" alt="Built with TypeScript" /></a>
 <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite&logoColor=white" alt="Built with Vite" /></a>
 <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Runtime-Bun-black?logo=bun&logoColor=white" alt="Runtime Bun" /></a>
</p>

<p align="center">
 <img src="src/assets/hero.png" alt="SahamLens" width="180" />
</p>

SahamLens membaca teks snapshot saham yang kamu tempel dari Stockbit, lalu mengubahnya menjadi ringkasan data yang mudah dipindai. Pemrosesan snapshot berlangsung langsung di browser. Tidak ada koneksi langsung ke akun Stockbit, dan riwayat analisis disimpan secara lokal di perangkat. Batas privasi, retensi, perilaku storage, dan format input dijelaskan di [Privasi, retensi, dan perilaku snapshot](docs/privacy-and-snapshot-behavior.md).

## Fitur

- **Parser snapshot saham** - Mengambil identitas emiten, harga, metrik, bagian, dan tabel dari teks mentah.
- **Data terstruktur** - Menyajikan hasil dalam kartu metrik dan tabel yang mudah dipindai.
- **Skor berbasis aturan** - Menguji valuasi, profitabilitas, pertumbuhan, solvabilitas, arus kas, dan kualitas fundamental.
- **Skor transparan** - Menampilkan metrik yang diuji, bobot, rumus, nilai, status, dan alasan setiap aturan.
- **Riwayat lokal** - Menyimpan hingga 100 snapshot di browser untuk membandingkan skor, harga, pendapatan, laba, serta arus kas dari waktu ke waktu. Snapshot yang disimpan juga mempertahankan teks mentah non-kosong agar dapat dibuka kembali.
- **Input dari clipboard** - Memasukkan teks snapshot dari clipboard sebelum diproses.

## Mulai Cepat

### Prasyarat

- [Bun](https://bun.sh/) versi terbaru

### Instalasi

```bash
bun install
```

### Jalankan development server

```bash
bun run dev
```

Buka URL lokal yang ditampilkan Vite di terminal.

## Cara Pakai

### Ambil snapshot dari Stockbit

1. Login ke akun Stockbit, lalu cari saham yang ingin dianalisis fundamentalnya.
2. Buka halaman saham, lalu masuk ke tab **Key Stats** dan tunggu data fundamental tampil. Format snapshot Stockbit saat ini menjadi format input yang paling sesuai.
3. Di tab **Key Stats**, gunakan opsi **Copy all text** atau tekan `Ctrl+A`, lalu `Ctrl+C` untuk menyalin seluruh teks halaman. Tidak perlu memilih metrik satu per satu; parser SahamLens yang memilah data secara otomatis.
4. Di macOS, gunakan `Cmd+A`, lalu `Cmd+C` untuk menyalin seluruh teks halaman. SahamLens tidak membuka halaman atau mengakses akun Stockbit secara otomatis.

### Analisis di SahamLens

1. Tempel teks ke panel **Data mentah** atau gunakan tombol **Tempel dari clipboard**.
2. Klik **Rapikan data** untuk memproses input.
3. Periksa hasil pada tab **Data terstruktur**.
4. Buka tab **Analisis saham** untuk meninjau skor, metrik, dan alasan setiap aturan.
5. Simpan snapshot jika skor memenuhi ambang yang ditetapkan, lalu pantau perubahannya di **Riwayat analisis**.

Untuk memahami apa yang tersimpan dan cara menangani input yang terbaca sebagian, lihat [Privasi, retensi, dan perilaku snapshot](docs/privacy-and-snapshot-behavior.md). Kontributor dapat memakai [contoh snapshot sintetis](docs/synthetic-snapshot.md); contoh itu seluruhnya fiktif dan tidak boleh diganti dengan data akun nyata.

## Arsitektur

| Layer           | Teknologi / Peran                                               |
| --------------- | --------------------------------------------------------------- |
| UI              | React + TypeScript                                              |
| Build tool      | Vite                                                            |
| Parser          | `src/utils/parser.ts` mengubah teks mentah menjadi `StockData`  |
| Mesin penilaian | `src/utils/analysis.ts` mengevaluasi aturan dan menghitung skor |
| Riwayat         | `src/utils/history.ts` menyimpan snapshot di `localStorage`     |
| Ikon            | Lucide React                                                    |

## Development

```bash
# Jalankan development server
bun run dev

# Jalankan lint
bun run lint

# Buat production build
bun run build

# Periksa format tanpa mengubah file
bun run format:check

# Periksa tipe TypeScript
bun run typecheck

# Periksa whitespace/error pada diff
git diff --check

# Preview production build
bun run preview
```

## Kontribusi

Kontribusi terbuka untuk parser, label metrik, aturan analisis, aksesibilitas, dan pengalaman membaca data.

Sebelum membuat pull request:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
git diff --check
```

Jaga perubahan tetap fokus, sertakan [contoh snapshot sintetis](docs/synthetic-snapshot.md) jika mengubah parser, dan jelaskan dampak perubahan aturan terhadap skor.

## Disclaimer

SahamLens adalah alat bantu membaca data, bukan nasihat investasi. Validasi sumber data, asumsi, dan hasil analisis secara mandiri sebelum mengambil keputusan.

## Lisensi

SahamLens dirilis di bawah [MIT License](LICENSE).
