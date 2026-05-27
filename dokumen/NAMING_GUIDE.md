# Panduan Penamaan File (Auto-Detect)

Agar file laporan (.xlsx / .csv) dapat dideteksi secara otomatis oleh script `consolidate.py`, nama file **wajib** mengandung dua unsur berikut:

1. **Pola Bulan & Tahun**
2. **Kata Kunci Tipe Data**

---

## 1. Pola Bulan & Tahun (Pilih Salah Satu)

*   **Format Bulan Indonesia**: `[nama_bulan] 2026` (Huruf kecil semua, dipisahkan spasi).
    *   *Pilihan bulan*: `januari`, `februari`, `maret`, `april`, `mei`, `juni`, `juli`, `agustus`, `september`, `oktober`, `november`, `desember`
    *   *Contoh*: `januari 2026`
*   **Format Rentang Tanggal**: `(2026-MM-DD - 2026-MM-DD)`
    *   *Contoh*: `(2026-01-01 - 2026-01-31)`

---

## 2. Kata Kunci Tipe Data & Struktur Nama

Gunakan kata kunci di bawah ini sesuai dengan tipe laporan. Karakter pemisah disarankan menggunakan underscore (`_`).

### Shopee
*   **Shopee Overview Metriks**
    *   *Kata Kunci*: `shp overview metriks` atau `shopee overview`
    *   *Contoh*: `shp overview metriks_januari 2026.xlsx`
*   **Shopee Product Performance**
    *   *Kata Kunci*: `shp product performance`
    *   *Contoh*: `shp product performance_januari 2026.xlsx`
*   **Shopee Ads (CPC)**
    *   *Kata Kunci*: `shp ads`
    *   *Contoh*: `shp ads_januari 2026.csv`

### TikTok (TTS)
*   **TikTok Overview**
    *   *Kata Kunci*: `tts overview`
    *   *Contoh*: `tts overview_januari 2026.xlsx`
*   **TikTok Product Affiliate**
    *   *Kata Kunci*: `tts product affiliate`
    *   *Contoh*: `tts product affiliate_januari 2026.xlsx`
*   **TikTok Live Seller**
    *   *Kata Kunci*: `tts live seller`
    *   *Contoh*: `tts live seller_januari 2026.xlsx`
*   **TikTok Live Affiliate**
    *   *Kata Kunci*: `tts live affiliate`
    *   *Contoh*: `tts live affiliate_januari 2026.xlsx`
*   **TikTok Video Seller**
    *   *Kata Kunci*: `tts video seller`
    *   *Contoh*: `tts video seller_januari 2026.xlsx`
*   **TikTok Video Affiliate**
    *   *Kata Kunci*: `tts video affiliate`
    *   *Contoh*: `tts video affiliate_januari 2026.xlsx`
*   **TikTok GMV Max Live Ads**
    *   *Kata Kunci*: `tts gmv max live`
    *   *Contoh*: `tts gmv max live_januari 2026.xlsx`
*   **TikTok GMV Max Product Ads**
    *   *Kata Kunci*: `tts gmv max product`
    *   *Contoh*: `tts gmv max product_januari 2026.xlsx`

### Website
*   **Website Overview**
    *   *Kata Kunci*: `website overview` atau `website_overview`
    *   *Contoh*: `website overview_januari 2026.csv`
*   **Website Product Performance**
    *   *Kata Kunci*: `website product` atau `website_product`
    *   *Contoh*: `website product_januari 2026.xlsx`

### Meta Ads
*   **Meta Ads (CPAS / Regular / Traffic / Website)**
    *   *Kata Kunci*: `meta cpas`, `meta regular`, `meta traffic`, atau `meta website`
    *   *Contoh*: `meta cpas_januari 2026.xlsx`
