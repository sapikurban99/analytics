# Panduan Pengguna — Tome Ame Analytics

> Platform monitoring performa omnichannel: TikTok Shop, Shopee, Website, dan Meta Ads — semua dalam satu dashboard.

---

## Daftar Isi

1. [Tampilan Utama & Navigasi](#1-tampilan-utama--navigasi)
2. [Filter Tanggal](#2-filter-tanggal)
3. [Fitur Dark Mode / Light Mode](#3-fitur-dark-mode--light-mode)
4. [OVERVIEW — Performance Sales](#4-overview--performance-sales)
5. [OVERVIEW — Performance Product](#5-overview--performance-product)
6. [TikTok Shop](#6-tiktok-shop)
7. [Shopee](#7-shopee)
8. [Website](#8-website)
9. [Meta Ads](#9-meta-ads)
10. [Admin Panel (Kelola Data)](#10-admin-panel-kelola-data)
11. [Glossary Istilah](#11-glossary-istilah)

---

## 1. Tampilan Utama & Navigasi

Waktu pertama buka platform ini, kamu bakal langsung masuk ke halaman dashboard utama dengan sidebar di sisi kiri.

### Sidebar Navigasi

Sidebar dibagi jadi dua grup besar:

**OVERVIEW** — ringkasan performa gabungan semua channel:
- `Performance Sales` — scorecard revenue, orders, visitor lintas channel
- `Performance Product` — tabel performa produk dari semua marketplace

**CHANNEL** — breakdown per platform:
- **TikTok Shop** → Overview · Product Analyz · Channel Analyz · Affiliate Analyz
- **Shopee** → Overview · Product Analyz · Channel Analyz · Affiliate Analyz
- **Website** → Overview · Product Analyz
- **Meta** → CPAS · Website · Traffic

Tiap grup bisa di-collapse/expand dengan klik judulnya (ada ikon panah).

Di bagian paling bawah sidebar ada tombol **Kelola Data (Admin)** — ini khusus untuk tim internal yang punya akses upload data.

### Mobile (Layar Kecil)

Di perangkat mobile, sidebar disembunyikan otomatis. Ketuk ikon menu (☰) di pojok kiri atas untuk membukanya. Tap di area gelap luar sidebar untuk menutupnya kembali.

---

## 2. Filter Tanggal

Di kanan atas halaman ada **Date Range Picker** — ini fungsinya untuk memilih rentang waktu data yang mau ditampilkan.

**Cara pakai:**
1. Klik field tanggal mulai (Start Date)
2. Pilih tanggal awal dari data yang tersedia
3. Klik field tanggal selesai (End Date)
4. Pilih tanggal akhir
5. Data di semua metrik akan langsung terupdate otomatis

**Tombol Reset** — kalau mau balik ke rentang data paling awal dan paling akhir yang tersedia, klik tombol reset di sebelah kanan date picker.

> **Catatan:** Data yang tersedia tergantung dari apa yang sudah diupload ke sistem. Kalau bulan tertentu belum ada, tanggalnya tidak akan bisa dipilih.

---

## 3. Fitur Dark Mode / Light Mode

Ada ikon matahari/bulan di sebelah kanan date picker. Klik untuk toggle antara tema gelap (dark mode) dan terang (light mode). Pilihan tema ini tersimpan di browser, jadi tetap aktif waktu kamu buka ulang.

---

## 4. OVERVIEW — Performance Sales

Halaman ini adalah **ringkasan performa penjualan gabungan** dari semua channel yang aktif (TikTok Shop + Shopee + Website). Cocok buat lihat big picture sebelum masuk ke breakdown per platform.

### Scorecard Performance Sales

Tata letak scorecard menggunakan format **Grid 3x2** (3 kolom dan 2 baris pada tablet/desktop) untuk memberikan tampilan visual yang seimbang dan mudah dipindai.

| Metrik | Penjelasan |
|--------|-----------|
| **Total Revenue** | Akumulasi GMV dari semua channel dalam rentang tanggal yang dipilih. Ada indikator pertumbuhan (▲/▼) dibanding periode sebelumnya |
| **Total Orders** | Jumlah transaksi selesai dari semua channel |
| **Total Visitor** | Jumlah pengunjung unik gabungan semua marketplace |
| **ROAS** | Return On Ad Spend — Revenue ÷ Total Ads Spend. Angka ini menunjukkan berapa rupiah balik dari setiap 1 rupiah yang dikeluarkan untuk iklan |
| **Cr%** | Conversion Rate lintas channel. Rumus: Orders ÷ Visitors × 100% |
| **AOV** | Average Order Value — rata-rata nilai per transaksi. Rumus: Revenue ÷ Orders |

### Scorecard Performance Ads

Fokus ke efisiensi iklan:

| Metrik | Penjelasan |
|--------|-----------|
| **Total Revenue** | Mirror dari scorecard atas |
| **Total Ads Spend** | Akumulasi biaya iklan gabungan (Shopee Ads + TikTok Ads + Meta Ads) |
| **Total Orders** | Mirror dari scorecard atas |
| **ROAS** | Revenue ÷ Ads Spend |

### Revenue per Channel (Donut Chart)

Visualisasi proporsi revenue dari masing-masing platform:
- 🔴 **Shopee**
- ⚫ **TikTok**
- 🟢 **Website**

Persentase dihitung dari total GMV gabungan. Berguna buat lihat channel mana yang dominan.

### Ads per Channel (Donut Chart)

Proporsi alokasi belanja iklan:
- 🔴 **Shopee Ads**
- ⚫ **TikTok Ads**
- 🔵 **Meta Ads**

### Grafik Tren Daily

Grafik garis yang menampilkan pergerakan harian Revenue, Orders, dan Visitor selama rentang tanggal yang dipilih. Hover ke titik mana pun untuk lihat angka spesifik hari tersebut.

---

## 5. OVERVIEW — Performance Product

Halaman ini menampilkan **performa produk secara cross-channel** — semua produk yang pernah terjual di TikTok Shop, Shopee, maupun Website, digabung dalam satu tabel.

### Scorecard

- **Total Products** — jumlah SKU unik yang aktif terjual
- **Top Revenue** — revenue tertinggi dari satu produk
- **Total Qty Sold** — total unit terjual semua produk

### Tabel Product Performance

Tabel ini bisa di-sort per kolom dan ada fitur pencarian produk.

| Kolom | Penjelasan |
|-------|-----------|
| **Product Name** | Nama produk (klik header untuk sort A-Z atau Z-A) |
| **Total GMV** | Revenue gabungan semua channel untuk produk ini |
| **Total Qty** | Total unit terjual lintas channel |
| **Shopee GMV** | Revenue dari Shopee + persentase kontribusinya |
| **TikTok GMV** | Revenue dari TikTok Shop + persentase kontribusinya |
| **Website GMV** | Revenue dari website + persentase kontribusinya |

**Tips:** Klik header kolom untuk mengurutkan data. Klik sekali = ascending, klik lagi = descending.

---

## 6. TikTok Shop

Ada 4 sub-halaman untuk TikTok Shop:

### #1 Overview

Ringkasan keseluruhan performa TikTok Shop.

**Financial Metrics:**
- Revenue, Spend Ads, ROAS

**Operational Metrics:**
- Orders, Items Sold, Visitors, Conversion Rate, AOV

**Grafik Tren Daily** — sama seperti overview sales tapi spesifik TikTok.

**Revenue Composition** — breakdown revenue TikTok berdasarkan sumber:
- 🟣 **Video** — dari konten video pendek
- 🔴 **Live** — dari sesi live streaming
- 🟡 **Product Card** — dari halaman toko / showcase pasif

Berguna buat tahu mana yang lebih efektif: video, live, atau product card.

---

### #2 Product Analyz

Performa produk khusus TikTok Shop.

**Scorecard:** Total Products · Top Revenue · Total Items Sold

**Tabel produk** dengan kolom:
- Product Name
- Revenue (GMV dari TikTok)
- Items Sold

Ada **search bar** — ketik nama produk untuk filter langsung.

---

### #3 Channel Analyz

Analisis mendalam per channel konten di TikTok Shop. Ada filter di bagian atas:
- **All** — semua tipe creator
- **Seller** — konten dari akun toko sendiri
- **Affiliate** — konten dari kreator afiliasi

**Tabel Video Performance:**

| Kolom | Penjelasan |
|-------|-----------|
| Creator Name | Handle kreator (@username) |
| Video ID / Info | Judul atau ID video |
| GMV (Rp) | Revenue dari video ini |
| SKU Order | Jumlah unit terjual |
| VV (Views) | Total tayangan video |
| Likes | Total like |
| CTOR% | Click-to-Order Rate |

**Tabel Live Performance:**

| Kolom | Penjelasan |
|-------|-----------|
| Creator Name | Nama host live |
| Creator ID | ID akun |
| Duration LIVE | Durasi sesi live |
| GMV (Rp) | Revenue selama live |
| LIVE Items Sold | Unit terjual |
| Views | Penonton masuk |
| Prod Clicks | Klik ke produk |
| CTR% | Click-Through Rate |

**Tabel Product Card** — revenue dari toko/showcase tanpa konten aktif.

---

### #4 Affiliate Analyz

Analisis jaringan kreator afiliasi TikTok.

**Tabel Creator Analyz:**

| Kolom | Penjelasan |
|-------|-----------|
| Creator Name | Handle kreator |
| GMV | Revenue dari kreator ini |
| Items Sold | Unit terjual |
| AOV | Average Order Value per kreator |
| Avg/Sold | Rata-rata unit per konten |
| Videos | Jumlah video yang dibuat |
| LIVE | Jumlah sesi live |
| Est. Commission | Estimasi komisi (rate 8%) |

**Tabel Product Analyz (Jalur Afiliasi)** — produk mana yang paling banyak terjual lewat konten afiliasi, lengkap dengan estimasi komisi per produk.

**Commission Summary:**
- Commission Plan Type: Open
- Commission Rate: 8%
- Total Paid Out: Total estimasi komisi yang sudah dibayar
- Affiliate ROI Multiplier: GMV Afiliasi ÷ Total Komisi

---

## 7. Shopee

### #1 Overview

**Financial KPI:** Revenue · Spend Ads · ROAS

**Operational KPI:** Orders · Items Sold · Visitors · Conversion Rate · AOV

**Grafik Tren Daily Shopee** — pergerakan harian khusus channel Shopee.

---

### #2 Product Analyz

Performa produk khusus Shopee.

Scorecard + tabel produk dengan Revenue dan Items Sold dari Shopee. Ada search bar untuk cari produk.

---

### #3 Channel Analyz

Menampilkan total omzet Shopee lengkap dengan Orders, Visitors, dan AOV.

Scorecard **Overview Channel** menyajikan breakdown performa tiap channel (Product Card, Live, Video, Affiliate) dalam format **Grid 3 kolom** (max 3x2) yang rapi dan konsisten dengan tampilan Performance Sales.

> **Catatan:** Breakdown per sumber revenue (Product Card, Seller Live, Video, Affiliate) membutuhkan data channel-level dari Shopee Seller Center yang belum diintegrasikan.

---

### #4 Affiliate Analyz

> **Catatan:** Data afiliasi Shopee (KOL Shopee Share) belum tersedia. Perlu upload laporan dari Shopee Seller Center untuk melihat performa jaringan KOL.

---

## 8. Website

### #1 Overview

**Sales Overview:** Revenue · Orders · Spent Ads · ROAS

**Metriks Overview:** Conversion Rate · AOV · Visitors

**Grafik Tren Daily** — pergerakan harian khusus website.

---

### #2 Product Analyz

Menampilkan produk yang terjual melalui website (bukan marketplace). Tabel dengan kolom Product Name, GMV, dan Item Sold — bisa di-sort dan search.

---

## 9. Meta Ads

### #1 Meta CPAS

CPAS (Collaborative Ads) — iklan Meta yang terintegrasi langsung ke Shopee atau marketplace lain.

Metrik yang ditampilkan:
- **Amount Spent** — total belanja iklan
- **Purchase** — revenue yang dihasilkan
- **Purchases Items** — jumlah transaksi
- **ROAS** — efisiensi iklan

> Jika belum ada data, halaman akan menampilkan notifikasi untuk upload file dari Meta Ads Manager.

---

### #2 Meta Website

Sama dengan CPAS tapi untuk kampanye yang mengarah ke website sendiri (bukan marketplace).

---

### #3 Meta Traffic

Fokus ke metrik distribusi dan jangkauan iklan:

| Metrik | Penjelasan |
|--------|-----------|
| **Amount Spent** | Total belanja iklan |
| **Impression** | Total tayangan iklan |
| **Link Clicks** | Total klik ke tautan |
| **CPM** | Cost Per Mille — biaya per 1.000 tayangan |
| **CPR** | Cost Per Click — biaya per klik |
| **Reach** | Jumlah orang unik yang melihat iklan |

---

## 10. Admin Panel (Kelola Data)

> Akses: Klik tombol **Kelola Data (Admin)** di bagian bawah sidebar.

Panel ini digunakan untuk mengelola data yang masuk ke platform. **Hanya untuk tim internal.**

### Login

Masukkan username dan password yang diberikan oleh admin sistem. Sesi login akan tersimpan selama tab browser masih terbuka.

---

### Data Explorer

Tab pertama setelah login. Digunakan untuk **menelusuri data mentah** yang sudah ada di database, per bulan.

**Cara pakai:**
1. Pilih bulan dari dropdown
2. Pilih channel (All / Shopee / TikTok / Meta / Website) di sidebar kiri untuk memfilter section yang ditampilkan
3. Data akan tampil dalam format tabel yang terstruktur

Berguna untuk verifikasi apakah data yang sudah diupload sudah masuk dengan benar.

---

### Upload Dokumen

Fitur untuk memasukkan file laporan dari masing-masing platform ke sistem.

**File yang didukung:**

| Platform | Kategori | Format |
|----------|----------|--------|
| **Shopee** | Shopee Ads Campaign | `.csv` |
| **Shopee** | Shopee Affiliate | `.xlsx` |
| **Shopee** | Overview Metriks | `.xlsx` |
| **Shopee** | Product Performance | `.xlsx` |
| **TikTok** | Overview Metriks | `.xlsx` |
| **TikTok** | LIVE Attributed Seller | `.xlsx` |
| **TikTok** | LIVE Attributed Affiliate | `.xlsx` |
| **TikTok** | Short Video Seller | `.xlsx` |
| **TikTok** | Short Video Affiliate | `.xlsx` |
| **TikTok** | GMV Max LIVE Ads | `.xlsx` |
| **TikTok** | GMV Max Product Ads | `.xlsx` |
| **TikTok** | Product Affiliate | `.xlsx` |
| **TikTok** | Product List | `.xlsx` |
| **TikTok** | Product Card Seller | `.xlsx` |
| **Meta** | CPAS | `.xlsx` / `.csv` |
| **Meta** | Regular | `.xlsx` / `.csv` |
| **Website** | Overview UTM | `.csv` / `.xlsx` |

**Cara upload:**
1. Pilih tab **Upload Dokumen**
2. Drag & drop file ke area upload, atau klik untuk pilih file
3. Bisa upload beberapa file sekaligus (batch upload)
4. Aktifkan **Auto-Detect** untuk biarkan sistem mendeteksi platform, kategori, dan bulan secara otomatis dari nama file
5. Atau matikan Auto-Detect dan isi manual: Platform, Kategori, Bulan, dan Tahun
6. Klik **Upload** — progress bar akan menampilkan status tiap file secara berurutan

**Auto-Detect:** Sistem akan mencoba menebak kategori file berdasarkan nama file. Disarankan nama file mengikuti konvensi dari masing-masing platform (Shopee Seller Center, TikTok Seller Center, Meta Ads Manager).

---

### Riwayat Upload

Menampilkan log semua file yang pernah diupload ke sistem, lengkap dengan:
- Timestamp
- Platform & kategori
- Bulan/tahun data
- Nama file & ukuran
- Status (Berhasil / Gagal)

Berguna untuk audit trail dan debugging kalau ada data yang tidak muncul di dashboard.

---

### Edit Data

Tab untuk **mengedit data yang sudah ada** di database secara manual.

**Cara pakai:**
1. Pilih bulan dari dropdown
2. Pilih channel di filter sidebar untuk mempersempit pilihan section
3. Pilih section/bagian data yang mau diedit (contoh: `tiktok_overview`, `ads`, `daily_trends`, dll.)
4. Edit data:
   - Untuk section Overview (Shopee/TikTok/Combined): edit via form input
   - Untuk section lain (Ads, Products, Videos, dll.): edit via raw JSON editor
5. Klik **Simpan** untuk menyimpan perubahan

> **Perhatian:** Edit data langsung ke JSON memerlukan pemahaman struktur data yang benar. Kesalahan format bisa menyebabkan data tidak terbaca di dashboard.

---

### Manajemen Database (Rename & Delete)

Di tab Edit ada juga panel manajemen bulan:
- **Rename** — ubah nama label bulan (contoh: dari "2025-01" jadi "Januari 2025")
- **Delete** — hapus semua data untuk bulan tertentu. **Aksi ini tidak bisa dibatalkan.**

---

## 11. Glossary Istilah

| Istilah | Penjelasan |
|---------|-----------|
| **GMV** | Gross Merchandise Value — total nilai transaksi bruto sebelum dikurangi biaya apapun |
| **ROAS** | Return On Ad Spend. Formula: Revenue ÷ Ads Spend. ROAS 3x artinya setiap Rp1 iklan menghasilkan Rp3 revenue |
| **AOV** | Average Order Value — rata-rata nilai per transaksi. Formula: Revenue ÷ Orders |
| **CVR / Cr%** | Conversion Rate — persentase pengunjung yang jadi pembeli. Formula: Orders ÷ Visitors × 100% |
| **CTR** | Click-Through Rate — persentase yang klik dari yang melihat |
| **CTOR** | Click-To-Order Rate — persentase yang order dari yang klik |
| **CPM** | Cost Per Mille — biaya per 1.000 tayangan iklan |
| **CPR / CPC** | Cost Per Click — biaya per satu klik |
| **CPAS** | Collaborative Ads — format iklan Meta yang terhubung langsung ke katalog produk di marketplace |
| **VV** | Video Views — total tayangan video |
| **Items Sold** | Unit produk yang berhasil terjual (bisa beda dari Orders jika 1 order ada beberapa item) |
| **KOL** | Key Opinion Leader — kreator/influencer yang diajak kerjasama untuk promosi produk |
| **Affiliate** | Sistem kerjasama di mana kreator mendapat komisi dari setiap penjualan yang mereka hasilkan |
| **Commission Rate** | Persentase komisi yang dibayarkan ke kreator afiliasi (saat ini: 8%) |
| **Product Card** | Traffic/penjualan yang berasal dari halaman toko/showcase tanpa konten aktif |

---

*Dokumentasi ini dibuat untuk internal tim Tome Ame. Untuk pertanyaan atau kendala teknis, hubungi tim pengembang.*
