#!/usr/bin/env python3
"""Process a single uploaded document file and extract structured metrics.
Usage: python3 process_file.py <file_path>
Output: JSON with platform, category, month_key, month_name, data_type, data
"""
import os
import re
import sys
import json
import pandas as pd
import numpy as np


# ── Helper Functions ──

def clean_number(v):
    if pd.isna(v) or v is None:
        return 0
    s = str(v).strip()
    if s == '-' or s == '':
        return 0
    s = s.replace('Rp', '').replace('IDR', '')
    dots = s.count('.')
    commas = s.count(',')
    if dots > 1 or (dots == 1 and commas == 1 and s.find('.') < s.find(',')):
        s = s.replace('.', '').replace(',', '.')
    elif commas > 1 or (commas == 1 and dots == 1 and s.find(',') < s.find('.')):
        s = s.replace(',', '')
    elif commas == 1 and dots == 0:
        s = s.replace(',', '.')
    is_pct = False
    if '%' in s:
        s = s.replace('%', '')
        is_pct = True
    try:
        val = float(s)
        if is_pct:
            return round(val / 100.0, 6)
        if val.is_integer():
            return int(val)
        return round(val, 2)
    except ValueError:
        return 0


def parse_duration_to_minutes(d):
    if pd.isna(d) or d is None:
        return 0
    s = str(d).strip().lower()
    hours = 0
    minutes = 0
    h_match = re.search(r'(\d+)\s*h', s)
    m_match = re.search(r'(\d+)\s*min', s)
    if h_match:
        hours = int(h_match.group(1))
    if m_match:
        minutes = int(m_match.group(1))
    if not h_match and not m_match:
        try:
            return int(s)
        except:
            return 0
    return hours * 60 + minutes


MONTH_NAMES_ID = ["januari", "februari", "maret", "april", "mei", "juni",
                   "juli", "agustus", "september", "oktober", "november", "desember"]

MONTHS_MAP = {m: f"{i+1:02d}" for i, m in enumerate(MONTH_NAMES_ID)}

# ── Detection ──

def detect_month_from_filename(filename):
    """Detect month_key ('YYYY-MM') and month_name from filename."""
    lower = filename.lower()
    lower_clean = lower.replace("februari2026", "februari 2026")

    # Indonesian month names + year
    for m in MONTH_NAMES_ID:
        match = re.search(rf'{m}\s*(202\d)', lower_clean)
        if match:
            return {"month_key": f"{match.group(1)}-{MONTHS_MAP[m]}", "month_name": m}

    # No-space variant
    for m in MONTH_NAMES_ID:
        match = re.search(rf'{m}(202\d)', lower)
        if match:
            return {"month_key": f"{match.group(1)}-{MONTHS_MAP[m]}", "month_name": m}

    # Date range pattern: (2026-01-01 - 2026-01-31)
    match = re.search(r'\((\d{4})-(\d{2})\d*-\d+\s*-\s*\d{4}-\d{2}\d*-\d+\)', lower)
    if match:
        year = match.group(1)
        month_num = match.group(2)
        month_names_en = {"01": "januari", "02": "februari", "03": "maret", "04": "april",
                          "05": "mei", "06": "juni", "07": "juli", "08": "agustus",
                          "09": "september", "10": "oktober", "11": "november", "12": "desember"}
        return {"month_key": f"{year}-{month_num}", "month_name": month_names_en.get(month_num, "unknown")}

    return None


PLATFORM_CATEGORIES = [
    # (platform, category, filename_keyword, data_type)
    ("shopee", "shp_overview", "shp overview metriks", "overview"),
    ("shopee", "shp_product", "shp product performance", "products"),
    ("shopee", "shp_ads", "shp ads", "ads_shopee"),
    ("shopee", "shp_affiliate", "shp performance affiliate", "creators"),
    ("tiktok", "tts_overview", "tts overview", "overview"),
    ("tiktok", "tts_live_seller", "tts live seller", "lives"),
    ("tiktok", "tts_live_affiliate", "tts live affiliate", "lives"),
    ("tiktok", "tts_video_seller", "tts video seller", "videos"),
    ("tiktok", "tts_video_affiliate", "tts video affiliate", "videos"),
    ("tiktok", "tts_gmv_max_live", "tts gmv max live", "ads_tiktok_live"),
    ("tiktok", "tts_gmv_max_product", "tts gmv max product", "ads_tiktok_product"),
    ("tiktok", "tts_product_affiliate", "tts product affiliate", "products"),
    ("tiktok", "tts_product_list", "tts product list", "products"),
    ("tiktok", "tts_product_card", "tts product card", "products"),
    ("tiktok", "tts_creator_affiliate", "tts creator affiliate", "creators"),
    ("meta", "meta_cpas", "cpas", "ads_meta"),
    ("meta", "meta_website", "meta website", "ads_meta"),
    ("meta", "meta_traffic", "meta traffic", "ads_meta"),
    ("meta", "meta_regular", "meta regular", "ads_meta"),
    ("website", "web_overview", "website overview", "overview"),
    ("website", "web_product", "website product", "products"),
]


def detect_document(filename):
    """Detect platform, category, data_type from filename."""
    lower = filename.lower()
    # Normalize: treat underscores as spaces for detection
    lower_normalized = lower.replace("_", " ")
    for platform, category, keyword, data_type in PLATFORM_CATEGORIES:
        if keyword in lower or keyword in lower_normalized:
            return {"platform": platform, "category": category, "data_type": data_type}
    return None


# ── Parsers ──

def parse_shopee_overview(filepath):
    df = pd.read_excel(filepath, sheet_name="Confirmed Order", header=None)

    row0_first = str(df.iloc[0, 0]).strip().lower() if not pd.isna(df.iloc[0, 0]) else ""

    if "date" in row0_first or "tanggal" in row0_first:
        summary_headers = df.iloc[0].tolist()
        summary_row = 1
        daily_headers = df.iloc[3].tolist()
        daily_start = 4
    else:
        summary_headers = df.iloc[2].tolist()
        summary_row = 0
        daily_headers = summary_headers
        daily_start = 3

    summary_values = {}
    for col_idx, h in enumerate(summary_headers):
        if pd.isna(h):
            continue
        summary_values[h] = clean_number(df.iloc[summary_row, col_idx])

    overview = {
        "gmv": summary_values.get("Sales (IDR)", 0),
        "orders": summary_values.get("Orders", 0),
        "visitors": summary_values.get("Visitors", 0),
        "clicks": summary_values.get("Product Clicks", 0),
        "conversion_rate": summary_values.get("Order Conversion Rate", 0),
        "repeat_purchase_rate": summary_values.get("Repeat Purchase Rate", 0),
    }

    daily_records = []
    for idx in range(daily_start, len(df)):
        row = df.iloc[idx]
        if pd.isna(row[0]) or str(row[0]).strip() == '' or 'Date' in str(row[0]):
            continue
        date_str = str(row[0]).strip()
        parts = date_str.split('-')
        if len(parts) == 3:
            date_norm = f"{parts[2]}-{parts[1]}-{parts[0]}"
        else:
            date_norm = date_str

        daily_vals = {}
        for col_idx, h in enumerate(daily_headers):
            if pd.isna(h):
                continue
            daily_vals[h] = clean_number(row[col_idx])

        daily_records.append({
            "date": date_norm,
            "shopee_gmv": daily_vals.get("Sales (IDR)", 0),
            "shopee_orders": daily_vals.get("Orders", 0),
            "shopee_visitors": daily_vals.get("Visitors", 0),
            "shopee_clicks": daily_vals.get("Product Clicks", 0),
        })

    return {"overview": overview, "daily": daily_records}


def parse_tiktok_overview(filepath):
    df = pd.read_excel(filepath, header=None)
    labels = df.iloc[2].tolist()
    vals = df.iloc[3].tolist()
    growth_vals = df.iloc[4].tolist()

    summary_values = {}
    growth_values = {}
    for col_idx, lbl in enumerate(labels):
        if pd.isna(lbl):
            continue
        summary_values[lbl] = clean_number(vals[col_idx])
        growth_values[lbl] = clean_number(growth_vals[col_idx])

    overview = {
        "gmv": summary_values.get("GMV", 0),
        "orders": summary_values.get("Orders", 0),
        "visitors": summary_values.get("Visitors", 0),
        "clicks": summary_values.get("Product Clicks", 0),
        "conversion_rate": summary_values.get("Conversion rate", 0),
        "aov": summary_values.get("AOV", 0),
        "growth": {
            "gmv": growth_values.get("GMV", 0),
            "orders": growth_values.get("Orders", 0),
            "visitors": growth_values.get("Visitors", 0),
            "conversion_rate": growth_values.get("Conversion rate", 0),
        }
    }

    daily_headers = df.iloc[8].tolist()
    daily_records = []
    for idx in range(9, len(df)):
        row = df.iloc[idx]
        if pd.isna(row[0]) or str(row[0]).strip() == '' or 'Date' in str(row[0]):
            continue
        date_str = str(row[0]).strip()
        parts = date_str.split('/')
        if len(parts) == 3:
            date_norm = f"{parts[2]}-{parts[1]}-{parts[0]}"
        else:
            date_norm = date_str

        daily_vals = {}
        for col_idx, h in enumerate(daily_headers):
            if pd.isna(h):
                continue
            daily_vals[h] = clean_number(row[col_idx])

        daily_records.append({
            "date": date_norm,
            "tiktok_gmv": daily_vals.get("GMV", 0),
            "tiktok_orders": daily_vals.get("Orders", 0),
            "tiktok_visitors": daily_vals.get("Visitors", 0),
            "tiktok_clicks": daily_vals.get("Product clicks", 0),
        })

    return {"overview": overview, "daily": daily_records}


def parse_shopee_products(filepath):
    df = pd.read_excel(filepath)
    products = []
    if "Product" in df.columns:
        for _, row in df.iterrows():
            p_name = str(row["Product"]).strip()
            if p_name == '-' or pd.isna(row["Product"]):
                continue
            gmv = clean_number(row.get("Sales (Confirmed Order) (IDR)", 0))
            items_sold = clean_number(row.get("Units (Confirmed Order)", 0))
            orders = clean_number(row.get("Confirmed Order", 0))
            conv_rate = clean_number(row.get("Conversion Rate (Confirmed Order)", 0))
            status = str(row.get("Current Item Status", "Active")).strip()
            status_lbl = "Active" if status in ["Normal", "Active"] else "Inactive"
            products.append({
                "name": p_name,
                "platform": "Shopee",
                "status": status_lbl,
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": orders,
                "conversion_rate": conv_rate,
                "ctr": clean_number(row.get("CTR", 0)),
                "views": clean_number(row.get("Product Impression", 0)),
                "clicks": clean_number(row.get("Product Clicks", 0)),
            })
    return {"products": products}


def parse_tiktok_products(filepath):
    df = pd.read_excel(filepath)
    products = []
    if "Product name" in df.columns:
        for _, row in df.iterrows():
            p_name = str(row["Product name"]).strip()
            if p_name == '-' or pd.isna(row["Product name"]):
                continue
            gmv = clean_number(row.get("Creator-attributed GMV", 0))
            items_sold = clean_number(row.get("Creator-attributed items sold", 0))
            orders = clean_number(row.get("Attributed orders", 0))
            products.append({
                "name": p_name,
                "platform": "TikTok",
                "status": "Active",
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": orders,
                "conversion_rate": 0,
                "ctr": 0,
                "views": 0,
                "clicks": 0,
            })
    return {"products": products}


def parse_tiktok_product_list(filepath):
    df = pd.read_excel(filepath)
    products = []
    if "Product name" in df.columns:
        for _, row in df.iterrows():
            p_name = str(row["Product name"]).strip()
            if p_name == '-' or pd.isna(row["Product name"]):
                continue
            gmv = clean_number(row.get("GMV", 0))
            items_sold = clean_number(row.get("Items sold", 0))
            products.append({
                "name": p_name,
                "platform": "TikTok",
                "status": "Active",
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": items_sold,
                "conversion_rate": 0,
                "ctr": 0,
                "views": 0,
                "clicks": 0,
            })
    return {"products": products}


def parse_tiktok_product_card(filepath):
    df = pd.read_excel(filepath)
    products = []
    if "Product" in df.columns:
        for _, row in df.iterrows():
            p_name = str(row["Product"]).strip()
            if p_name == '-' or pd.isna(row["Product"]):
                continue
            gmv = clean_number(row.get("GMV", 0))
            items_sold = clean_number(row.get("Items sold", 0))
            views = clean_number(row.get("Views", 0))
            clicks = clean_number(row.get("Clicks", 0))
            ctr = clean_number(row.get("CTR", 0))
            products.append({
                "name": p_name,
                "platform": "TikTok",
                "status": "Active",
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": items_sold,
                "conversion_rate": 0,
                "ctr": ctr,
                "views": views,
                "clicks": clicks,
            })
    return {"products": products}


def parse_tiktok_lives(filepath, live_type):
    df = pd.read_excel(filepath, header=2)
    lives = []
    if "Nickname" in df.columns or "Creator" in df.columns:
        for _, row in df.iterrows():
            nickname = str(row.get("Nickname", row.get("Creator", "-"))).strip()
            gmv = clean_number(row.get("LIVE-attributed GMV (Rp)", row.get("LIVE attributed GMV (Rp)", 0)))
            items_sold = clean_number(row.get("LIVE-attributed items sold", 0))
            duration_str = str(row.get("Duration", "0")).strip()
            duration_min = parse_duration_to_minutes(duration_str)
            views = clean_number(row.get("Views", 0))
            clicks = clean_number(row.get("Product Clicks", 0))
            ctr = clean_number(row.get("CTR", 0))
            if nickname == '-' or pd.isna(row.get("Nickname", row.get("Creator", np.nan))):
                continue
            if gmv == 0 and items_sold == 0 and views < 10:
                continue
            lives.append({
                "creator": nickname,
                "creator_name": str(row.get("Creator", nickname)).strip(),
                "type": live_type,
                "duration": duration_str,
                "duration_minutes": duration_min,
                "gmv": gmv,
                "items_sold": items_sold,
                "views": views,
                "clicks": clicks,
                "ctr": ctr,
            })
    return {"lives": lives}


def parse_tiktok_videos(filepath, video_type):
    df = pd.read_excel(filepath, header=2)
    videos = []
    if "Creator name" in df.columns or "Creator" in df.columns:
        for _, row in df.iterrows():
            creator = str(row.get("Creator name", row.get("Creator", "-"))).strip()
            info = str(row.get("Video Info", row.get("Video Title / Info", "-"))).strip()
            vv = clean_number(row.get("VV", row.get("Views (VV)", 0)))
            gmv = clean_number(row.get("Video-attributed GMV (Rp)", row.get("Video GMV (Rp)", 0)))
            items_sold = clean_number(row.get("Video-attributed items sold", 0))
            ctr = clean_number(row.get("CTOR (SKU order)", row.get("Click-through rate (Video)", 0)))
            likes = clean_number(row.get("Likes", 0))
            comments = clean_number(row.get("Comments", 0))
            if creator == '-' or pd.isna(row.get("Creator name", row.get("Creator", np.nan))):
                continue
            if gmv == 0 and vv < 10:
                continue
            videos.append({
                "creator": creator,
                "title": info,
                "type": video_type,
                "views": vv,
                "gmv": gmv,
                "items_sold": items_sold,
                "ctr": ctr,
                "likes": likes,
                "comments": comments,
            })
    return {"videos": videos}


def parse_shopee_ads(filepath):
    df = pd.read_csv(filepath, skiprows=7)
    ads = []
    if "Ad Name" in df.columns:
        for _, row in df.iterrows():
            ad_name = str(row["Ad Name"]).strip()
            if ad_name == '-' or pd.isna(row["Ad Name"]):
                continue
            imp = clean_number(row.get("Impression", 0))
            clicks = clean_number(row.get("Clicks", 0))
            cost = clean_number(row.get("Expense", 0))
            gmv = clean_number(row.get("GMV", 0))
            orders = clean_number(row.get("Conversions", 0))
            roas = clean_number(row.get("ROAS", 0))
            ctr = clean_number(row.get("CTR", 0))
            ads.append({
                "ad_name": ad_name,
                "impressions": imp,
                "clicks": clicks,
                "cost": cost,
                "gmv": gmv,
                "orders": orders,
                "roas": roas,
                "ctr": ctr,
            })
    return {"ads_shopee": ads}


def parse_tiktok_gmv_max_live_ads(filepath):
    df = pd.read_excel(filepath)
    ads = []
    if "Campaign name" in df.columns:
        for _, row in df.iterrows():
            name = str(row.get("LIVE name", row.get("Campaign name", "-"))).strip()
            cost = clean_number(row.get("Cost", 0))
            gmv = clean_number(row.get("Gross revenue", 0))
            orders = clean_number(row.get("SKU orders", 0))
            views = clean_number(row.get("LIVE views", 0))
            roi = clean_number(row.get("ROI (Current shop)", 0))
            if name == '-' or pd.isna(row.get("LIVE name", row.get("Campaign name", np.nan))):
                continue
            if cost == 0 and gmv == 0:
                continue
            ads.append({
                "campaign_name": name,
                "cost": cost,
                "gmv": gmv,
                "orders": orders,
                "views": views,
                "roi": roi,
            })
    return {"ads_tiktok_live": ads}


def parse_tiktok_gmv_max_product_ads(filepath):
    df = pd.read_excel(filepath)
    ads = []
    if "Campaign name" in df.columns:
        grouped = df.groupby("Campaign name").agg({
            "Cost": "sum",
            "Gross revenue": "sum",
            "SKU orders": "sum",
            "Product ad impressions": "sum",
            "Product ad clicks": "sum",
        }).reset_index()
        for _, row in grouped.iterrows():
            name = str(row["Campaign name"]).strip()
            cost = clean_number(row["Cost"])
            gmv = clean_number(row["Gross revenue"])
            orders = clean_number(row["SKU orders"])
            imp = clean_number(row["Product ad impressions"])
            clicks = clean_number(row["Product ad clicks"])
            if name == '-' or pd.isna(row["Campaign name"]):
                continue
            if cost == 0 and gmv == 0:
                continue
            ads.append({
                "campaign_name": name,
                "cost": cost,
                "gmv": gmv,
                "orders": orders,
                "impressions": imp,
                "clicks": clicks,
                "roi": round(gmv / cost, 2) if cost > 0 else 0,
            })
    return {"ads_tiktok_product": ads}


def parse_website_overview(filepath):
    df = pd.read_csv(filepath)
    gmv_sum = 0
    orders_sum = 0
    daily_records = []
    if "Tanggal" in df.columns:
        for _, row in df.iterrows():
            tanggal = str(row["Tanggal"]).strip()
            if pd.isna(row["Tanggal"]) or tanggal == '-':
                continue
            gmv = clean_number(row.get("Penjualan Bersih", row.get("Nilai Order", 0)))
            orders = clean_number(row.get("Jumlah Order", 0))
            gmv_sum += gmv
            orders_sum += orders
            try:
                date_obj = pd.to_datetime(tanggal, format='%d %b %Y')
                date_norm = date_obj.strftime('%Y-%m-%d')
            except:
                date_norm = tanggal
            daily_records.append({
                "date": date_norm,
                "website_gmv": gmv,
                "website_orders": orders,
            })

    overview = {
        "gmv": gmv_sum,
        "orders": orders_sum,
        "visitors": 0,
        "conversion_rate": 0,
    }
    return {"overview": overview, "daily": daily_records}


def parse_website_products(filepath):
    df = pd.read_excel(filepath)
    products = []
    if "Nama Produk" in df.columns:
        for _, row in df.iterrows():
            p_name = str(row["Nama Produk"]).strip()
            if p_name == '-' or pd.isna(row["Nama Produk"]) or p_name == 'nan':
                continue
            gmv = clean_number(row.get("Penjualan Bersih", 0))
            units = clean_number(row.get("Jumlah Pembayaran", 0))
            sku = str(row.get("SKU", "-")).strip()
            products.append({
                "name": p_name,
                "platform": "Website",
                "status": "Active",
                "gmv": gmv,
                "items_sold": units,
                "orders": units,
                "conversion_rate": 0,
                "ctr": 0,
                "views": 0,
                "clicks": 0,
                "sku": sku,
            })
    return {"products": products}


def parse_meta_ads(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    df = pd.read_excel(filepath) if ext == '.xlsx' else pd.read_csv(filepath)
    ads = []
    if "Campaign name" in df.columns:
        for _, row in df.iterrows():
            name = str(row["Campaign name"]).strip()
            if name == '-' or pd.isna(row["Campaign name"]):
                continue
            cost = clean_number(row.get("Amount spent (IDR)", 0))
            gmv = clean_number(row.get("Purchases conversion value for shared items only", 0))
            orders = clean_number(row.get("Purchases with shared items", 0))
            impressions = clean_number(row.get("Impressions", 0))
            clicks = clean_number(row.get("Link clicks", 0))
            if cost == 0 and gmv == 0 and impressions < 10:
                continue
            ads.append({
                "campaign_name": name,
                "cost": cost,
                "gmv": gmv,
                "orders": orders,
                "impressions": impressions,
                "clicks": clicks,
                "roi": round(gmv / cost, 2) if cost > 0 else 0,
            })
    return {"ads_meta": ads}


def parse_tiktok_creator_affiliate(filepath):
    df = pd.read_excel(filepath)
    creators = []
    if "Creator name" in df.columns:
        for _, row in df.iterrows():
            name = str(row.get("Creator name", "")).strip()
            if name == '-' or pd.isna(row.get("Creator name")):
                continue
            gmv = clean_number(row.get("Creator-attributed GMV", 0))
            items_sold = clean_number(row.get("Creator-attributed items sold", 0))
            orders = clean_number(row.get("Attributed orders", 0))
            videos = clean_number(row.get("Videos", 0))
            lives = clean_number(row.get("LIVE streams", 0))
            aov = clean_number(row.get("AOV", 0))
            refunds = clean_number(row.get("Refunds", 0))
            creators.append({
                "creator": name,
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": orders,
                "videos": videos,
                "lives": lives,
                "aov": aov,
                "refunds": refunds,
            })
    return {"creators": creators}


def parse_shopee_affiliate(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    df = pd.read_csv(filepath) if ext == '.csv' else pd.read_excel(filepath)
    creators = []
    if "Nama Affiliate" in df.columns:
        for _, row in df.iterrows():
            name = str(row.get("Nama Affiliate", row.get("Username Affiliate", ""))).strip()
            if name == '-' or pd.isna(row.get("Nama Affiliate")):
                continue
            gmv = clean_number(row.get("Omzet Penjualan(Rp)", 0))
            items_sold = clean_number(row.get("Produk Terjual", 0))
            orders = clean_number(row.get("Pesanan", 0))
            clicks = clean_number(row.get("Clicks", 0))
            commission = clean_number(row.get("Estimasi Komisi(Rp)", 0))
            roi = clean_number(row.get("ROI", 0))
            creators.append({
                "creator": name,
                "gmv": gmv,
                "items_sold": items_sold,
                "orders": orders,
                "clicks": clicks,
                "commission": commission,
                "roi": roi,
            })
    return {"creators": creators}


# ── Parser Dispatch Table ──

PARSER_MAP = {
    "shp_overview": parse_shopee_overview,
    "tts_overview": parse_tiktok_overview,
    "shp_product": parse_shopee_products,
    "tts_product_affiliate": parse_tiktok_products,
    "tts_product_list": parse_tiktok_product_list,
    "tts_product_card": parse_tiktok_product_card,
    "tts_live_seller": lambda fp: parse_tiktok_lives(fp, "Seller"),
    "tts_live_affiliate": lambda fp: parse_tiktok_lives(fp, "Affiliate"),
    "tts_video_seller": lambda fp: parse_tiktok_videos(fp, "Seller"),
    "tts_video_affiliate": lambda fp: parse_tiktok_videos(fp, "Affiliate"),
    "shp_ads": parse_shopee_ads,
    "shp_affiliate": parse_shopee_affiliate,
    "tts_gmv_max_live": parse_tiktok_gmv_max_live_ads,
    "tts_gmv_max_product": parse_tiktok_gmv_max_product_ads,
    "tts_creator_affiliate": parse_tiktok_creator_affiliate,
    "web_overview": parse_website_overview,
    "web_product": parse_website_products,
    "meta_cpas": parse_meta_ads,
    "meta_website": parse_meta_ads,
    "meta_traffic": parse_meta_ads,
    "meta_regular": parse_meta_ads,
}

PLATFORM_DISPLAY = {
    "shopee": "Shopee",
    "tiktok": "Tiktok",
    "meta": "Meta",
    "website": "Website",
}

PLATFORM_METRIC_MAP = {
    "website": {
        "website_gmv": "gmv",
        "website_orders": "orders",
    },
    "shopee": {
        "shopee_gmv": "gmv",
        "shopee_orders": "orders",
        "shopee_visitors": "visitors",
        "shopee_clicks": "clicks",
    },
    "tiktok": {
        "tiktok_gmv": "gmv",
        "tiktok_orders": "orders",
        "tiktok_visitors": "visitors",
        "tiktok_clicks": "clicks",
    },
}


def split_by_month(result, filepath, doc_info):
    """Check if parsed data spans multiple months, split into per-month results."""
    data_type = doc_info["data_type"]
    platform_disp = result["platform"]
    platform_key = platform_disp.lower()
    data = result["data"]
    results = [result]

    if data_type == "overview" and "daily" in data:
        daily_list = data.get("daily", [])
        if not daily_list:
            return [result]

        groups = {}
        for d in daily_list:
            m_key = d["date"][:7]
            if m_key not in groups:
                groups[m_key] = []
            groups[m_key].append(d)

        if len(groups) <= 1:
            return [result]

        metric_map = PLATFORM_METRIC_MAP.get(platform_key, {})
        results = []
        for m_key in sorted(groups.keys()):
            daily = groups[m_key]
            month_num = int(m_key.split("-")[1])
            month_name = MONTH_NAMES_ID[month_num - 1].capitalize()

            overview = {}
            for d in daily:
                for k, v in d.items():
                    if k in metric_map and isinstance(v, (int, float)):
                        mapped = metric_map[k]
                        overview[mapped] = overview.get(mapped, 0) + v

            results.append({
                "status": "success",
                "platform": platform_disp,
                "category": result["category"],
                "data_type": data_type,
                "month_key": m_key,
                "month_name": month_name,
                "filename": result["filename"],
                "size_bytes": result["size_bytes"],
                "data": {"overview": overview, "daily": daily},
            })
        return results

    if data_type == "ads_meta":
        try:
            ext = os.path.splitext(filepath)[1].lower()
            df = pd.read_excel(filepath) if ext in ('.xlsx', '.xls') else pd.read_csv(filepath)

            if "Month" not in df.columns:
                return [result]

            month_map = {}
            for _, row in df.iterrows():
                m_val = str(row["Month"]).strip()
                match = re.search(r'(\d{4})-(\d{2})', m_val)
                if match:
                    m_key = f"{match.group(1)}-{match.group(2)}"
                    if m_key not in month_map:
                        month_map[m_key] = []
                    month_map[m_key].append(row)

            if len(month_map) <= 1:
                return [result]

            results = []
            for m_key in sorted(month_map.keys()):
                rows = month_map[m_key]
                ads = []
                for row in rows:
                    name = str(row.get("Campaign name", ""))
                    if name == '-' or pd.isna(row.get("Campaign name")):
                        continue
                    cost = clean_number(row.get("Amount spent (IDR)", 0))
                    gmv = clean_number(row.get("Purchases conversion value for shared items only", 0))
                    orders = clean_number(row.get("Purchases with shared items", 0))
                    impressions = clean_number(row.get("Impressions", 0))
                    clicks = clean_number(row.get("Link clicks", 0))
                    if cost == 0 and gmv == 0 and impressions < 10:
                        continue
                    ads.append({
                        "campaign_name": str(name).strip(),
                        "cost": cost,
                        "gmv": gmv,
                        "orders": orders,
                        "impressions": impressions,
                        "clicks": clicks,
                        "roi": round(gmv / cost, 2) if cost > 0 else 0,
                    })

                month_num = int(m_key.split("-")[1])
                month_name = MONTH_NAMES_ID[month_num - 1].capitalize()
                results.append({
                    "status": "success",
                    "platform": platform_disp,
                    "category": result["category"],
                    "data_type": data_type,
                    "month_key": m_key,
                    "month_name": month_name,
                    "filename": result["filename"],
                    "size_bytes": result["size_bytes"],
                    "data": {"ads_meta": ads},
                })
            return results
        except Exception:
            return [result]

    return results


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 process_file.py <file_path>"}))
        sys.exit(1)

    filepath = sys.argv[1]

    if not os.path.exists(filepath):
        print(json.dumps({"error": f"File not found: {filepath}"}))
        sys.exit(1)

    filename = os.path.basename(filepath)
    size_bytes = os.path.getsize(filepath)

    month_info = detect_month_from_filename(filename)
    if month_info is None:
        print(json.dumps({"error": "Cannot detect month from filename", "filename": filename}))
        sys.exit(1)

    doc_info = detect_document(filename)
    if doc_info is None:
        print(json.dumps({"error": "Cannot detect document type from filename", "filename": filename}))
        sys.exit(1)

    parser = PARSER_MAP.get(doc_info["category"])
    if parser is None:
        print(json.dumps({"error": f"No parser for category: {doc_info['category']}", "filename": filename}))
        sys.exit(1)

    try:
        parsed_data = parser(filepath)
    except Exception as e:
        print(json.dumps({"error": f"Parse error: {str(e)}", "filename": filename}))
        sys.exit(1)

    single_result = {
        "status": "success",
        "platform": PLATFORM_DISPLAY.get(doc_info["platform"], doc_info["platform"]),
        "category": doc_info["category"],
        "data_type": doc_info["data_type"],
        "month_key": month_info["month_key"],
        "month_name": month_info["month_name"].capitalize(),
        "filename": filename,
        "size_bytes": size_bytes,
        "data": parsed_data,
    }

    results = split_by_month(single_result, filepath, doc_info)

    print(json.dumps(results, ensure_ascii=False))


if __name__ == "__main__":
    main()
