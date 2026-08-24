# Privasi, retensi, dan perilaku snapshot

Dokumen ini mengikuti implementasi SahamLens saat ini. Snapshot diproses di browser dan tidak dikirim ke akun Stockbit atau backend SahamLens. Riwayat bukan sinkronisasi cloud.

Sumber verifikasi utama: `src/App.tsx`, `src/utils/history.ts`, `src/utils/parser.ts`, dan `src/utils/stockbitText.ts`.

## Batas privasi

- Teks yang ditempel masuk ke state `rawText` di browser. `parseStockText(rawText)` membaca teks itu di sisi client saat pengguna memilih **Rapikan data**.
- SahamLens tidak membuka halaman, membaca sesi, atau mengakses akun Stockbit. Pengguna menyalin teks **Key Stats** sendiri lalu menempelkannya ke aplikasi.
- Tombol **Tempel dari clipboard** membaca clipboard hanya setelah diklik. Jika izin clipboard gagal, aplikasi meminta pengguna menempelkan teks ke textarea secara manual. Tombol copy JSON juga berjalan melalui clipboard browser setelah diklik.
- Aplikasi mengambil jumlah star repository dari endpoint publik GitHub `api.github.com`. Request itu tidak menyertakan `rawText`, hasil parse, atau riwayat; ini adalah batas network aplikasi yang terpisah dari pemrosesan snapshot.
- Riwayat disimpan di `localStorage` origin aplikasi dengan key `sahamlens:parsing-history:v1`. Data itu dapat dibaca oleh browser profile, extension, atau software lain yang memiliki akses ke profile tersebut; “lokal” bukan jaminan kerahasiaan absolut.
- Link ke Stockbit atau GitHub dapat membawa pengguna keluar dari aplikasi. Isi snapshot tetap berada di browser kecuali pengguna sendiri menyalin atau membagikannya.

## Retensi `rawText` dan riwayat

- Saat pengguna mengetik atau menempel, `rawText` hanya berada di state halaman. Ia tidak disimpan otomatis dan biasanya hilang saat halaman dimuat ulang.
- **Simpan ke riwayat** hanya aktif jika score minimal `65/100`. Saat penyimpanan berhasil, setiap record menyimpan identitas ringkas, tanggal, metrik analisis, verdict, dan `rawText` asli jika tidak kosong. Whitespace pada teks non-kosong dipertahankan.
- Record yang memiliki `rawText` dapat dibuka kembali dari tombol **Buka output saham**; aplikasi mengisi textarea lalu menjalankan parser lagi. URL riwayat hanya membawa key saham dan tanggal, bukan isi `rawText`.
- Kapasitas maksimum adalah **100 record**. Record baru untuk saham/tanggal berbeda ditolak saat kapasitas penuh; aplikasi tidak menghapus record lama secara otomatis dan tidak melakukan FIFO eviction. Hapus record terlebih dahulu untuk membebaskan slot.
- Record saham/tanggal yang sama tidak dibuat dua kali dari UI. Mengedit tanggal menulis perubahan ke record yang sama dan memperbarui key internalnya.
- Tidak ada tombol hapus semua. Ikon tempat sampah menghapus **satu record** berdasarkan id dan menulis ulang seluruh array riwayat ke `localStorage`.

## Storage failure dan recovery

Perilaku saat ini sengaja fail-safe terhadap exception browser:

- Jika `localStorage` tidak tersedia atau `setItem` gagal karena quota/privacy mode, penyimpanan tidak dianggap berhasil. UI menampilkan pesan bahwa riwayat mungkin penuh atau tidak tersedia.
- Jika penghapusan atau edit gagal ditulis, baris dapat hilang atau berubah di tampilan sesi saat ini, tetapi perubahan itu tidak persisten. Muat ulang untuk memeriksa keadaan yang benar-benar tersimpan.
- Jika pembacaan storage gagal atau JSON riwayat bukan array yang valid, loader mengembalikan riwayat kosong. Entry yang tidak valid diabaikan saat membaca; storage tidak otomatis diperbaiki atau ditulis ulang. Tidak ada pemulihan otomatis di UI.

Langkah pemulihan:

1. Sebelum reload ketika penyimpanan bermasalah, salin teks di textarea ke tempat lokal yang aman. Jangan menaruhnya di issue, log, atau screenshot.
2. Jika clipboard gagal, gunakan paste manual. Jika save gagal, pastikan browser mengizinkan site data/local storage, tidak sedang berada di private mode yang membatasi storage, lalu reload dan coba lagi.
3. Setelah save, delete, atau edit, buka ulang halaman dan tab **Riwayat analisis** untuk memverifikasi hasil persisten. Pesan sukses sesi saja bukan bukti storage tetap tersedia.
4. Jika riwayat hilang setelah error pembacaan, jangan menganggapnya tersinkron di tempat lain. Backup atau pemeriksaan storage harus dilakukan lokal; jangan menyalin isi `localStorage` ke laporan publik. Menghapus key `sahamlens:parsing-history:v1` hanya boleh dilakukan setelah tidak ada data yang perlu dipulihkan karena tindakan itu menghapus riwayat lokal.

## Format input yang didukung

Format utama yang didukung adalah **teks biasa hasil Copy all text dari tab Key Stats Stockbit**. Parser mengenali heading dan label metrik Stockbit saat ini, termasuk:

`Current Valuation`, `Per Share`, `Solvency`, `Management Effectiveness`, `Profitability`, `Growth`, `Dividend`, `Market Rank`, `Income Statement`, `Balance Sheet`, `Cash Flow Statement`, dan `Price Performance`.

Parser juga menormalkan line ending, menghapus baris kosong, memangkas whitespace per baris, dan menangani sebagian teks padat atau artefak markdown sederhana dari hasil salin. HTML mentah, CSV, JSON, screenshot, dan format dari situs lain bukan kontrak input yang dijamin. Contoh aman ada di [synthetic-snapshot.md](synthetic-snapshot.md).

## Peringatan partial parse

Implementasi saat ini **belum menghasilkan warning partial parse otomatis**: `ParseResult.warnings` selalu berupa array kosong dan UI tidak menampilkan banner peringatan khusus. UI hanya menampilkan jumlah `baris terbaca`, jumlah bagian/metrik/tabel, serta empty state jika tidak ada data yang dikenali. Jadi output dengan sebagian field kosong belum tentu ditandai sebagai warning.

Perlakukan jumlah baris terbaca yang rendah, bagian yang hilang, atau metrik `-` sebagai sinyal bahwa input mungkin terbaca sebagian. Jangan menganggap output parsial sebagai snapshot lengkap. Salin ulang seluruh Key Stats, pastikan teks masuk ke textarea, klik **Rapikan data**, lalu periksa tab **Data terstruktur**, JSON, dan bagian analisis. Jika perlu fixture aman, mulai dari [contoh snapshot sintetis](synthetic-snapshot.md), bukan data akun nyata.

## Checks Bun untuk contributor

Gunakan Bun sesuai scripts repository:

```bash
bun install
bun run format:check
bun run lint
bun run typecheck
bun run build
git diff --check
```

`bun run check:fast` menjalankan format check dan lint. `bun run check:full` menjalankan typecheck dan build. Repository saat ini belum memiliki test file Bun, sehingga `bun test` tidak memiliki test untuk dijalankan. Repository juga belum menyediakan validator link Markdown khusus; link relatif pada dokumen ini harus tetap mengarah ke file yang ada.
