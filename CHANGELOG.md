# Fitur Baru & Pembaruan Dashboard (Changelog)

Berikut adalah daftar fitur baru, integrasi, dan peningkatan yang telah diimplementasikan pada dashboard **Channel Analytics** dari versi awal hingga pembaruan terbaru:

---

## 1. 🌐 Integrasi Multi-Channel (Sumber Data Baru)
Kini dashboard mendukung konsolidasi data dari 4 channel utama secara *real-time*:
*   **Shopee**: Metriks Overview (GMV, Orders, Visitors, Product Clicks), performa produk, dan metrik iklan CPC Shopee.
*   **TikTok Shop (TTS)**: Metriks Overview, performa produk afiliasi, performa livestreaming (Seller & Affiliate), video pendek/konten (Seller & Affiliate), serta performa iklan GMV Max (Live & Product Ads).
*   **Website**: Integrasi penjualan langsung/net sales website (Overview Harian & Performa Produk).
*   **Meta Ads**: Integrasi data iklan Meta (CPAS, Regular, Traffic, dan Website Ads) untuk melacak Spend, Purchase Value, Purchases, Impressions, Clicks, dan ROAS.

---

## 2. 🛡️ Portal Admin Canggih & Manajemen Data
Sebuah portal admin khusus telah dibangun untuk pengelolaan data yang aman dan fleksibel:
*   **Sistem Autentikasi (Admin Auth)**: Halaman login aman khusus admin untuk mengakses fitur sensitif.
*   **Manual Document Upload & Sync**: Admin bisa mengunggah langsung file laporan bulanan (`.xlsx` / `.csv`) dari Shopee, TikTok, Website, dan Meta Ads. Sistem akan membaca file dan melakukan sinkronisasi otomatis menggunakan script python ETL (`consolidate.py`).
*   **JSON Database Editor**: Tab khusus untuk melakukan edit atau manipulasi langsung struktur data JSON metrik bulanan secara aman dari UI.
*   **Sistem Log Upload**: Melacak riwayat file dokumen yang berhasil diunggah.

---

## 3. 📊 Keuangan (Laba Rugi & Komisi)
Fitur analisis keuangan baru untuk membantu pengambilan keputusan bisnis:
*   **Menu Laba Rugi (P&L)**: Menganalisis pendapatan kotor, pengeluaran iklan, potongan komisi platform, dan keuntungan bersih (Net Profit).
*   **Menu Komisi**: Menu khusus untuk melacak persentase dan total pengeluaran komisi per platform penjualan.
*   **Standardized Finance Sidebar**: Menu sidebar bertema finansial yang rapi dan dapat disembunyikan (collapsible).

---

## 4. 🎨 Peningkatan Tampilan & Pengalaman Pengguna (UI/UX)
Tampilan dashboard dirancang dengan estetika premium yang responsif:
*   **Light & Dark Mode**: Toggle mode terang dan gelap yang konsisten di seluruh halaman.
*   **Month Quick-Presets**: Tombol cepat untuk memfilter data berdasarkan bulan tertentu (Januari, Februari, Maret, April 2026).
*   **Responsive Sidebar Navigation**: Desain menu samping yang adaptif di desktop maupun perangkat mobile.
*   **Dynamic Trend Charts**: Grafik visual tren harian untuk GMV, Orders, dan Visitors per platform.
*   **AI Insight Panel**: Panel rekomendasi pintar berbasis AI yang memberikan ringkasan analisis performa bulanan dan tips optimasi channel.
*   **ROAS & ROI Gauges**: Visualisasi pencapaian ROAS Iklan (Shopee, TikTok, Meta) dengan indikator performa warna harmonis.

---

## 5. ⚙️ Infrastruktur & Backend Database
*   **Supabase Database Integration**: Penyimpanan data yang andal menggunakan Supabase untuk persistence jangka panjang.
*   **Dynamic Metrics API**: Endpoint API Next.js `/api/metrics` dan `/api/admin/metrics` untuk sinkronisasi data client-server.
*   **Seeding & Migration Script**: Script pembersih dan pengisi database awal otomatis (`seed.ts`) untuk mempermudah setup awal server.
