# 🌦️ Weather Dashboard - Tugas Akhir Judul 6 PPW

**Aplikasi cuaca real-time yang menampilkan informasi cuaca terkini dan prakiraan 5 hari ke depan menggunakan WeatherAPI.com.**

## 📋 Daftar Isi
- [Tentang Aplikasi](#tentang-aplikasi)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Lengkap (Clone → Deploy)](#setup-lengkap)
- [Cara Menggunakan](#cara-menggunakan)
- [Dokumentasi Fitur](#dokumentasi-fitur)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

---

## 🎯 Tentang Aplikasi

Weather Dashboard adalah aplikasi web modern yang memungkinkan user untuk:
- ✅ Mencari informasi cuaca kota di seluruh dunia
- ✅ Melihat cuaca real-time dengan detail (suhu, kelembaban, angin, visibility)
- ✅ Melihat prakiraan cuaca 5 hari ke depan
- ✅ Menyimpan kota favorit
- ✅ Menggunakan lokasi GPS otomatis
- ✅ Dark mode dan toggle Celsius/Fahrenheit
- ✅ Search dengan autocomplete suggestion

**Dibuat untuk:** Tugas Akhir Praktikum Pemrograman Web  
**Oleh:** Arfan Pramudya  
**Tahun:** 2025

---

## ✨ Features

### 1. **Pencarian Kota Cerdas**
- 🔍 Autocomplete dengan saran lokasi real-time
- ⌨️ Keyboard navigation (Arrow keys, Enter, Escape)
- 📍 Menampilkan koordinat GPS setiap lokasi
- 🎯 Debounce search untuk efisiensi API

### 2. **Display Cuaca Lengkap**
- 🌡️ Suhu real-time (°C atau °F)
- 💧 Kelembaban udara
- 💨 Kecepatan angin
- 👁️ Visibility (jarak pandang)
- 🌤️ Kondisi cuaca dengan icon
- 📅 Tanggal dan waktu last update

### 3. **Prakiraan 5 Hari**
- 📊 Forecast grid dengan suhu min/max
- 💧 Perkiraan kelembaban
- 🎨 Icon cuaca untuk setiap hari

### 4. **Lokasi Favorit**
- ⭐ Simpan kota favorit
- 💾 Persist di localStorage
- 🗑️ Hapus dari favorit dengan satu klik
- ⚡ Quick access ke kota favorit

### 5. **Geolocation**
- 📍 Auto-detect lokasi user dengan GPS
- 🗺️ Langsung tampilkan cuaca lokasi user
- 🔒 Aman dan dengan izin user

### 6. **Dark Mode**
- 🌙 Toggle tema terang/gelap
- 💾 Ingat preferensi user
- 🎨 Design responsif untuk semua tema

### 7. **Unit Toggle**
- 🌡️ Ganti antara Celsius dan Fahrenheit
- ⏱️ Ganti kecepatan angin (m/s ↔ mph)
- 📏 Ganti jarak (km ↔ miles)

### 8. **Auto Refresh**
- 🔄 Update cuaca otomatis setiap 5 menit
- 🔘 Manual refresh button

### 9. **Security & Validation**
- 🔐 XSS Protection (HTML escaping)
- ✅ Input validation & sanitization
- 🛡️ API response validation
- 🔒 API Key di environment variables

### 10. **Error Handling**
- ❌ User-friendly error messages
- 💡 Troubleshooting tips
- 🐛 Console logging untuk debugging

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Styling** | Tailwind CSS (Utility-first CSS framework) |
| **Icons** | Material Symbols (Google Icons) |
| **Fonts** | Inter, Google Fonts |
| **Build Tool** | Vite |
| **API** | WeatherAPI.com |
| **Storage** | Browser localStorage |
| **Environment** | Node.js, npm |

---

## 📦 Prerequisites

Pastikan sudah install:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **npm** (v8+) - Biasanya ter-include dengan Node.js
- **Git** (optional) - Untuk clone repository

Verifikasi:
```powershell
node --version    # v16.x.x atau lebih
npm --version     # v8.x.x atau lebih
```

---

## 🚀 Setup Lengkap (Clone → Deploy)

### Step 1: Clone Repository

```powershell
git clone https://github.com/arfanPramudya/Praktikum-Pemrograman-Web.git
cd Praktikum-Pemrograman-Web
cd "Tugas Akhir Judul 6 PPW"
```

### Step 2: Install Dependencies

```powershell
npm install
```

Ini akan install:
- Vite (build tool)
- Dan dependencies lainnya

**Output yang diharapkan:**
```
added 156 packages in 15s
```

### Step 3: Setup Environment Variables

#### Opsi A: Cepat (Copy dari template)
```powershell
Copy-Item .env.example .env.local
```

#### Opsi B: Manual (Buat file baru)
Buat file baru bernama `.env.local` dengan isi:
```env
VITE_API_KEY=your_api_key_here
VITE_BASE_URL=https://api.weatherapi.com/v1
```

### Step 4: Dapatkan API Key dari WeatherAPI.com

1. **Buka** https://www.weatherapi.com/signup.aspx
2. **Daftar akun** (gratis)
3. **Login** ke https://www.weatherapi.com/my/
4. **Copy API Key** dari dashboard
5. **Paste ke `.env.local`:**
   ```env
   VITE_API_KEY=abc123def456ghi789jkl012
   ```

### Step 5: Jalankan Development Server

```powershell
npm run dev
```

**Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 6: Buka di Browser

Klik link atau buka manual: **http://localhost:5173/**

✅ **Aplikasi siap digunakan!**

---

## 💻 Cara Menggunakan

### 1. **Cari Kota**
```
1. Ketik nama kota di search box (mis: "Jakarta")
2. Lihat saran lokasi muncul otomatis
3. Pilih dengan click atau arrow keys + Enter
4. Cuaca kota akan tampil
```

### 2. **Gunakan Geolocation**
```
1. Klik tombol "📍 Lokasi Saya"
2. Browser akan minta izin akses GPS
3. Klik "Allow" atau "Ijinkan"
4. Cuaca lokasi Anda akan tampil otomatis
```

### 3. **Simpan ke Favorit**
```
1. Lihat cuaca kota
2. Klik ⭐ di sudut kanan atas
3. Kota disimpan ke "Kota Favorit"
4. Klik nama kota di favorit untuk buka cepat
```

### 4. **Toggle Unit**
```
- Klik "°C" di header untuk toggle ke °F
- Suhu, angin, dan jarak akan berubah otomatis
```

### 5. **Dark Mode**
```
- Klik 🌙 di header untuk toggle dark mode
- Preferensi akan tersimpan
```

### 6. **Manual Refresh**
```
- Klik 🔄 di sudut kanan cuaca sekarang
- Data akan update langsung
```


---

## 📁 Struktur Project

```
Tugas Akhir Judul 6 PPW/
├── 📄 README.md                    # File ini
├── 📄 .env.local                   # ⚠️ API Key (di .gitignore)
├── 📄 .gitignore                   # Exclude .env dari git
├── 📄 package.json                 # Dependencies & scripts
├── 📄 package-lock.json            # Lock file
├── 📄 vite.config.js               # Vite configuration
├── 📄 index.html                   # HTML utama
├── 📄 script.js                    # Vanilla JavaScript (820 lines)
├── 📄 styles.css                   # Custom CSS + animations
│
├── 📁 node_modules/                # Dependencies (auto-created)
└── 📁 dist/                         # Build output (saat npm run build)
```

---

## 🛠️ npm Commands

```powershell
# Development - Jalankan dev server
npm run dev

# Production Build - Build untuk production
npm run build

# Preview Build - Lihat hasil build
npm run preview

# Start - Alias untuk dev
npm start
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'vite'"
**Solution:**
```powershell
npm install
```

### Problem: "API Key not configured"
**Solution:**
1. Buat file `.env.local` 
2. Isi `VITE_API_KEY=your_key_here`
3. Restart server: Ctrl+C → `npm run dev`

### Problem: "CORS error" atau "Failed to fetch API"
**Solution:**
1. Check internet connection
2. Verify API Key valid di https://www.weatherapi.com/my/
3. Check WeatherAPI.com status (mungkin down)

### Problem: "Kota tidak ditemukan"
**Solution:**
1. Cek spelling nama kota
2. Coba nama inggris (mis: "Bandung" bukan "Bandoeng")
3. Coba nama English: "Jakarta" bukan "Djakarta"

### Problem: Suggestions tidak muncul
**Solution:**
1. Ketik minimal 2 karakter
2. Tunggu 300ms setelah berhenti ketik
3. Check console (F12) untuk errors

### Problem: Dark mode tidak menyimpan
**Solution:**
1. Browser localStorage harus enable
2. Jangan use private/incognito mode
3. Clear cache browser: Ctrl+Shift+Delete

---

## 🔒 Security

### API Key Safety
- ✅ API Key disimpan di `.env.local` (tidak di-commit ke git)
- ✅ File `.env.local` ada di `.gitignore`
- ✅ Vite hanya embed API Key saat build
- ✅ Tidak ada API Key di source code

### XSS Protection
- ✅ HTML escaping untuk semua user input
- ✅ No inline event handlers
- ✅ Safe DOM manipulation

### Input Validation
- ✅ City name validation (2-100 characters)
- ✅ Character whitelist (a-zA-Z0-9 -,())
- ✅ API response structure validation
- ✅ Type checking throughout code

### Best Practices Implemented
- ✅ Content Security Policy ready
- ✅ Input sanitization
- ✅ Error handling
- ✅ No eval() atau dangerous functions

---

## 📊 API Usage

Aplikasi menggunakan **WeatherAPI.com Free Plan**:
- ✅ **1,000,000 calls/bulan** (unlimited development)
- ✅ **Endpoints:** Current, Forecast, Search, Alerts
- ✅ **Data:** Real-time weather, 5-day forecast, air quality

**Limit saat development:**
- Current weather: ~5 API calls per kota
- 5-day forecast: Included dalam current
- Search: ~1 call per search (debounced)
- Geolocation: 1 call per use

**Estimate:** ~50-100 API calls per hari development = Aman

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
# 1. Push ke GitHub
git push origin main

# 2. Import ke Vercel
# https://vercel.com/import

# 3. Add environment variable di Vercel:
# VITE_API_KEY = your_api_key
```

### Netlify
```bash
# 1. Build production
npm run build

# 2. Deploy dist/ folder ke Netlify
# https://app.netlify.com/drop
```

### GitHub Pages
```bash
# 1. Build
npm run build

# 2. Push dist/ folder ke GitHub Pages
```

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile browsers | ✅ Responsive |

---

## 📝 License

MIT License - Bebas digunakan untuk keperluan apapun

---

## 👤 Author

**Arfan Pramudya**
- GitHub: [@arfanPramudya](https://github.com/arfanPramudya)
- Email: arfan@example.com

---

## 🤝 Contributing

Contributions welcome! Feel free untuk:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

---

## 📞 Support & Contact

Jika ada pertanyaan atau masalah:
1. **Check documentation** di folder root
2. **Read troubleshooting** di bawah
3. **Check WeatherAPI.com docs** di https://www.weatherapi.com/docs/
4. **Open issue** di GitHub

---

## 🎉 Quick Start Summary

```powershell
# 1. Clone
git clone https://github.com/arfanPramudya/Praktikum-Pemrograman-Web.git
cd Praktikum-Pemrograman-Web/"Tugas Akhir Judul 6 PPW"

# 2. Install
npm install

# 3. Setup .env
Copy-Item .env.example .env.local
# Edit .env.local dan isi API Key

# 4. Run
npm run dev

# 5. Open
# http://localhost:5173/
```

**Done!** ✅ Aplikasi siap digunakan!

---

**Last Updated:** November 29, 2025  
**Version:** 1.0.0

