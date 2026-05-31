# Tome Ame Analytics

Dashboard monitoring performa omnichannel untuk brand **Tome Ame** — mengkonsolidasi data penjualan dan iklan dari TikTok Shop, Shopee, Website, dan Meta Ads dalam satu platform.

---

## Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Data Pipeline | Python 3 (ETL via `consolidate.py`) |
| Deployment | Vercel |

---

## Struktur Channel

```
OVERVIEW
├── Performance Sales    — scorecard revenue + ads lintas channel (Grid 3x2)
└── Performance Product  — tabel GMV per produk cross-channel

TIKTOK SHOP
├── Overview             — GMV, Spend Ads, ROAS, Revenue Composition
├── Product Analyz       — performa produk TikTok
├── Channel Analyz       — Video / Live Seller & Affiliate
└── Affiliate Analyz     — creator list + estimasi komisi

SHOPEE
├── Overview             — GMV, Spend Ads, ROAS, Operational KPI
├── Product Analyz       — performa produk Shopee
├── Channel Analyz       — breakdown organic vs ads + tabel Shopee Ads (Grid 3-Kolom)
└── Affiliate Analyz     — KOL Shopee Share

WEBSITE
├── Overview             — Revenue, Orders, ROAS, Metriks
└── Product Analyz       — produk yang terjual via website

META ADS
├── CPAS                 — Collaborative Ads (attributing ke Shopee)
├── Website              — iklan mengarah ke website
└── Traffic              — metrik jangkauan & CPM/CPC
```

---

## Data Pipeline

Data bersumber dari file laporan resmi (Shopee Seller Center, TikTok Seller Center, Meta Ads Manager) yang diproses via ETL Python.

```
dokumen/
├── Shopee/
│   ├── Shp Overview Metriks/     → shp_overview (Confirmed Order tab)
│   ├── Shp Product Performance/  → shopee products
│   ├── Shp Ads/                  → shopee CPC ads
│   └── Shp Affiliate/            → KOL Shopee Share
├── Tiktok/
│   ├── Tts Overview Metriks/     → tiktok_overview
│   ├── Tts Live Seller/Affiliate → live sessions
│   ├── Tts Video Seller/Affiliate→ video performance
│   ├── Tts Gmv Max Ads/          → GMV Max campaigns
│   ├── Tts Product List/Card/    → product performance
│   └── Tts Creator Affiliate/    → creator analytics
├── Website/
│   ├── Website Overview Metriks/ → daily sales (CSV)
│   └── Website Product Performance/
└── Meta/
    ├── Meta CPAS/
    ├── Meta Website/
    └── Meta Traffic/
```

### Menjalankan ETL

```bash
# Dari root project
python3 lib/data/consolidate.py
```

Output: `lib/data/consolidated_metrics.json` — digunakan langsung oleh app via `/api/metrics`.

**Catatan penting:**
- Meta GMV **tidak** dihitung dalam combined revenue (Meta attributing ke Shopee/Website → double count)
- Meta cost **tetap** dimasukkan ke total Ads Spend
- `products_consolidated` menyertakan `website_gmv` dan `website_items_sold`

---

## Setup & Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Isi SUPABASE_URL dan SUPABASE_ANON_KEY

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Keterangan |
|----------|-----------|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_ANON_KEY` | Anon key Supabase |
| `ADMIN_USERNAME` | Username untuk portal admin |
| `ADMIN_PASSWORD` | Password untuk portal admin |

---

## Admin Panel

Akses via tombol **Kelola Data (Admin)** di sidebar.

Fitur:
- **Data Explorer** — browse data mentah per bulan/channel
- **Upload Dokumen** — batch upload file laporan (Auto-Detect nama file)
- **Riwayat Upload** — audit trail semua file yang diupload
- **Edit Data** — edit JSON data langsung via form atau raw JSON editor

Format file yang didukung: lihat `dokumen/PANDUAN_PENGGUNA.md`

---

## Naming Convention File

File laporan harus mengikuti konvensi nama agar Auto-Detect berfungsi:

```
shp overview metriks_(YYYY-MM-DD - YYYY-MM-DD).xlsx
shp product performance_(YYYY-MM-DD - YYYY-MM-DD).xlsx
shp ads_(YYYY-MM-DD - YYYY-MM-DD).csv
tts overview_(YYYY-MM-DD - YYYY-MM-DD).xlsx
tts live seller_(YYYY-MM-DD - YYYY-MM-DD).xlsx
meta cpas_(YYYY-MM-DD - YYYY-MM-DD).xlsx
website overview_(YYYY-MM-DD - YYYY-MM-DD).csv
...
```

Lihat `dokumen/NAMING_GUIDE.md` untuk panduan lengkap.

---

## Changelog

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk riwayat pembaruan fitur.
