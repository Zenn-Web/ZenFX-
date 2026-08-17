# ZenFX · Personal Forex Trading Suite

ZenFX adalah suite riset fundamental dan terminal analisis pasar Forex serta Emas (XAUUSD) pribadi yang dibangun dengan arsitektur modern Next.js 14, TypeScript, Supabase PostgreSQL, dan kecerdasan buatan (AI) Groq LLaMA 3.3.

Platform ini dirancang khusus untuk membantu trader menganalisis korelasi antar pasar, sentimen berita makro ekonomi global, kalender ekonomi, dan pergerakan teknikal grafik dalam satu tampilan terpadu tanpa distraksi.

---

## 🌟 Fitur Utama

### 1. Slide 0 · Personal Forex Terminal (Cover & Autentikasi)
* Gerbang masuk aman berbasis Supabase PostgreSQL dengan dukungan Google OAuth dan email.
* Perlindungan privasi penuh di mana dashboard hanya dapat diakses setelah login.
* Transisi halus dari opening splash screen berdurasi 0.9 detik menuju form terminal.
* Sistem mengingat status login dan tab aktif terakhir sehingga pengguna tidak perlu login berulang kali.

### 2. Slide 1 · Market Overview & Live Terminal
* Integrasi live chart TradingView interaktif dengan pilihan timeframe 1H, 4H, 1D, dan 1W.
* Quick selector untuk 4 instrumen utama: XAUUSD (Gold), DXY (US Dollar Index), US10Y (Bond Yield), dan EURUSD.
* Indikator jam sesi trading global (Sydney, Tokyo, London, New York) dengan waktu UTC dan status pasar aktif.
* Key Macro Indicators Snapshot berisi suku bunga Fed Funds Rate, US CPI, Core PCE, dan Non-Farm Payroll.
* Macro Bias & Sentiment Matrix dengan indikator Risk-On flow serta rangkuman arah penggerak pasar harian.
* Desain Bento Grid presisi yang mengisi layar penuh tanpa perlu scroll vertikal.

### 3. Slide 2 · Economic News Research & AI Digest
* Feed berita forex dan komoditas real-time dari Finnhub API.
* Kalender ekonomi mingguan lengkap dengan data Forecast, Previous, dan Actual.
* AI News Digest cerdas bertenaga Groq LLaMA 3.3 dengan temperatur 0.4 untuk menyusun rangkuman dampak fundamental pasar secara akurat.

### 4. Slide 3 · News Element & Macro Intelligence
* Analisis indikator ekonomi mendalam dengan integrasi data FRED (Federal Reserve Economic Data).
* Breaking Banner otomatis untuk data ekonomi yang deviasinya melompat signifikan dari perkiraan konsensus.
* Fitur Pin indikator favorit dan filter pencarian cepat.

---

## 🛠️ Teknologi & Arsitektur

* **Framework**: Next.js 14 (App Router)
* **Bahasa**: TypeScript 5
* **Styling**: Tailwind CSS dengan estetika Dark Glassmorphism dan aksen Amber Gold
* **Database & Auth**: Supabase PostgreSQL (Row Level Security & OAuth 2.0)
* **AI Engine**: Groq API (LLaMA 3.3 70B Versatile)
* **Data Provider**: Finnhub API, TradingView Widget, FRED API
* **State & Data Fetching**: SWR (Stale-While-Revalidate) dan browser storage synchronization
* **Icons**: Lucide React

---

## ⌨️ Navigasi Shortcut Keyboard

Navigasi antar slide dapat diakses cepat menggunakan keyboard:

* Tekan tombol **0** : Kembali ke Cover / Login Terminal
* Tekan tombol **1** : Buka Market Overview & Live Chart
* Tekan tombol **2** : Buka Economic News Research
* Tekan tombol **3** : Buka News Element & Macro Intelligence
* Tekan tombol **Panah Kanan (→)** : Pindah ke slide berikutnya
* Tekan tombol **Panah Kiri (←)** : Pindah ke slide sebelumnya

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/Zenn-Web/ZenFX-.git
cd ZenFX
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env.local` di direktori utama, lalu isi kredensial berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hjpcmlhmoxhymstdtnve.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
FINNHUB_API_KEY=your_finnhub_api_key
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 5. Build Produksi
```bash
npm run build
npm run start
```

---

## 🌐 Panduan Deployment ke Vercel

1. Buka dashboard Vercel di https://vercel.com
2. Klik tombol **Add New** lalu pilih **Project**
3. Import repositori GitHub `ZenFX-`
4. Di bagian **Environment Variables**, masukkan 4 variabel berikut:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `GROQ_API_KEY`
   * `FINNHUB_API_KEY`
5. Klik **Deploy** dan tunggu proses kompilasi selesai dalam 1 menit.

---

## 📄 Lisensi & Hak Cipta

Proyek ini dibangun sebagai Personal Forex Trading Suite oleh Zen The Trader. Seluruh hak cipta dilindungi undang-undang.
