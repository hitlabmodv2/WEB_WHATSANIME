# WhatAnime Finder - Pencari Anime dari Screenshot

## Tentang Aplikasi

WhatAnime Finder adalah aplikasi web yang membantu pengguna menemukan anime dari screenshot atau gambar. Aplikasi ini menggunakan API Trace.moe untuk melakukan pencarian gambar terbalik (reverse image search) pada screenshot anime. Pengguna dapat mengunggah gambar secara langsung atau memasukkan URL gambar untuk menemukan scene anime yang cocok dengan informasi detail termasuk judul, episode, timestamp, dan tingkat kecocokan.

## Pembaruan Terbaru (Oktober 2025)

### Fitur Pencarian dengan URL Gambar ✨
- **Tab switching** antara upload gambar dan URL gambar
- **Input URL gambar** langsung seperti trace.moe
- Validasi URL otomatis untuk memastikan gambar valid
- Preview gambar dari URL sebelum pencarian

### Penyederhanaan Scraper 🎯
- **Hanya menggunakan Trace.moe** sebagai scraper utama
- Menghapus scraper v2 (SauceNAO) untuk fokus pada akurasi anime
- Interface lebih sederhana dan mudah digunakan

### Tampilan Mobile Responsive 📱
- Header layout yang optimal untuk perangkat mobile
- Tab buttons yang responsif dan mudah diakses
- Input URL yang menyesuaikan dengan ukuran layar
- Semua komponen sudah dioptimasi untuk tampilan mobile

### Fitur Modal Developer
- Avatar anime 2D khusus untuk developer
- Bagian skills dengan progress bar visual (Node.js 90%, JavaScript 85%, Express.js 88%, HTML/CSS 92%)
- Sistem badge achievement (Code Master, Bug Hunter, Coffee Lover, Night Owl)
- Counter streak coding dengan ikon api animasi (365 hari)
- Sistem rotasi frase motivasi (interval 60 detik)

### Info Server
- Monitoring suhu server
- Counter total request
- Informasi server detail (Platform, Runtime, Status)
- Indikator penggunaan RAM dengan tampilan kapasitas total

## Preferensi Pengguna

Gaya komunikasi yang disukai: Bahasa sederhana dan mudah dipahami dalam bahasa Indonesia.

## Arsitektur Sistem

### Arsitektur Frontend

**Single Page Application (SPA)**
- Implementasi JavaScript murni tanpa framework
- Fungsi preview dan handling gambar di sisi klien
- Interface dengan tab untuk dua metode input (upload file vs URL)
- Preview gambar real-time sebelum pencarian

**Pola Desain**: Frontend menggunakan arsitektur event-driven dimana interaksi pengguna (pemilihan file, input URL, perpindahan tab) memicu fungsi handler yang mengupdate state UI.

**Alasan**: JavaScript vanilla dipilih untuk kesederhanaan dan menghindari overhead framework untuk aplikasi ringan. Ini mengurangi ukuran bundle dan meningkatkan performa loading awal.

### Arsitektur Backend

**Server Express.js**
- Server file statis yang melayani asset frontend dari direktori `public`
- Konfigurasi routing sederhana dengan satu root route handler
- Middleware JSON untuk ekspansi endpoint API di masa depan

**Pola Desain**: Server mengikuti pola Express.js minimal yang fokus pada serving file statis. Arsitektur memungkinkan penambahan API endpoint dengan mudah di masa depan.

**Konfigurasi Server**:
- Listen pada port 5000 secara default
- Bind ke 0.0.0.0 untuk aksesibilitas eksternal
- Menggunakan middleware express.static untuk delivery file statis yang efisien

### Penyimpanan Data

**Tanpa Implementasi Database**
- Aplikasi beroperasi secara stateless
- Tidak ada persistensi data pengguna
- Pemrosesan gambar terjadi di sisi klien sebelum dikirim ke API

**Alasan**: Fungsi inti aplikasi (identifikasi anime) sepenuhnya bergantung pada API eksternal Trace.moe. Tidak ada kebutuhan autentikasi pengguna atau penyimpanan data, membuat database tidak diperlukan dan mengurangi kompleksitas infrastruktur.

### Autentikasi & Otorisasi

**Tanpa Sistem Autentikasi**
- Aplikasi akses publik
- Tidak ada akun pengguna atau manajemen session
- Penanganan request stateless

**Alasan**: Aplikasi menyediakan layanan utilitas publik tanpa fitur personal, menghilangkan kebutuhan autentikasi.

## Dependensi Eksternal

### API Pihak Ketiga

**Trace.moe API**
- Layanan utama untuk identifikasi scene anime
- Menerima upload gambar atau URL untuk reverse image search
- Mengembalikan metadata anime termasuk judul, episode, timestamp, dan skor kecocokan
- Tidak memerlukan API key untuk penggunaan dasar

**Metode Integrasi**: Panggilan API langsung dari browser di sisi klien

**AniList GraphQL API**
- Digunakan untuk mendapatkan informasi detail anime tambahan
- Menyediakan data seperti studio, genre, rating, dan link eksternal
- Tidak memerlukan autentikasi untuk query publik

### Package NPM

**Dependensi Produksi**:
- `express` (v5.1.0): Framework web server
- `serve` (v14.2.1): Server file statis alternatif (tersedia tapi tidak digunakan)

**Tool Development**:
- `@zeit/schemas`: Schema konfigurasi
- `ajv`: Validasi schema JSON (transitive dependency)

### Kebutuhan Runtime

**Node.js**: Versi 18.0.0 atau lebih tinggi diperlukan untuk fitur JavaScript modern dan kompatibilitas Express 5.x

### Konfigurasi Deployment

**Konfigurasi Port**: Menggunakan environment variable `$PORT` dalam script start untuk fleksibilitas platform (Replit, Heroku, dll.)

**Serving Asset Statis**: Semua file frontend (HTML, CSS, JavaScript) dilayani dari direktori `public`

## Struktur Proyek

### File Kunci
- `public/index.html` - HTML aplikasi utama dengan modal untuk info developer dan info server
- `public/style.css` - Styling lengkap termasuk desain responsif untuk perangkat mobile
- `public/script.js` - Logika aplikasi inti, integrasi API, dan interaksi UI
- `public/coding-words.js` - Data rotasi frase untuk pesan motivasi di modal developer
- `public/dev-avatar.png` - Avatar anime 2D khusus untuk profil developer
- `public/backgrounds/` - Gambar background dinamis untuk waktu yang berbeda dalam sehari
- `server.js` - Konfigurasi server Express untuk serving file statis

### Keputusan Desain

**Optimasi Performa**
- Mengganti animasi typing karakter per karakter yang berat dengan rotasi frase ringan 60 detik
- Layout mobile yang dioptimasi untuk mengurangi rendering yang tidak perlu
- Footprint JavaScript minimal tanpa dependensi framework eksternal

**Pengalaman Pengguna**
- Badge achievement memberikan elemen gamifikasi
- Visualisasi skills membantu pengguna memahami keahlian developer
- Transparansi info server membangun kepercayaan dengan tampilan metrik yang jelas
- Desain responsif mobile-first memastikan aksesibilitas di semua perangkat

**Fitur Input Ganda**
- Tab switching yang smooth antara upload dan URL
- Validasi input yang komprehensif untuk kedua metode
- Handling error yang user-friendly
- Preview konsisten untuk kedua metode input

## Cara Penggunaan

### Upload Gambar
1. Klik tab "Upload Gambar" (default)
2. Klik area upload atau drag & drop gambar
3. Preview gambar akan muncul
4. Klik tombol "🔍 Cari Anime"
5. Hasil pencarian akan ditampilkan dengan detail lengkap

### URL Gambar
1. Klik tab "URL Gambar"
2. Masukkan URL gambar yang valid (https://...)
3. Klik "Muat Gambar" atau tekan Enter
4. Preview gambar akan muncul
5. Klik tombol "🔍 Cari Anime"
6. Hasil pencarian akan ditampilkan dengan detail lengkap

## Fitur Tambahan

### Background Dinamis
Aplikasi menampilkan background yang berubah sesuai waktu (zona waktu Jakarta/WIB):
- **Pagi** (05:00 - 11:59): Background morning.png
- **Siang** (12:00 - 17:59): Background afternoon.png
- **Sore** (18:00 - 20:59): Background evening.png
- **Malam** (21:00 - 04:59): Background night.png

### Informasi Hasil
Setiap hasil pencarian menampilkan:
- Video preview atau thumbnail scene
- Nama file/judul anime
- Timestamp dan durasi
- Persentase kecocokan dengan label akurasi
- Informasi detail anime (dapat dibuka/tutup)
- Studio produksi, genre, rating, dll
- Judul alternatif anime
- Link eksternal untuk info lebih lanjut

### Modal Info
- **Developer Info**: Profil developer dengan skills, achievements, dan streak
- **Server Info**: Monitoring resource server (RAM, CPU, Storage, Uptime, dll)

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **API**: Trace.moe API, AniList GraphQL API
- **Deployment**: Replit
- **Runtime**: Node.js v20

## Catatan Penting

⚠️ **Scraper yang Digunakan**: Aplikasi hanya menggunakan Trace.moe sebagai scraper utama untuk hasil yang lebih akurat dan fokus pada anime.

✅ **Mobile Responsive**: Semua fitur sudah dioptimasi untuk tampilan mobile dengan breakpoint di 768px, 640px, dan 480px.

🎨 **UI/UX**: Interface dirancang dengan dark theme yang nyaman di mata dengan elemen glassmorphism modern.

🚀 **Performa**: Aplikasi ringan tanpa framework frontend, loading cepat dengan minimal dependencies.
