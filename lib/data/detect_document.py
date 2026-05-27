#!/usr/bin/env python3
"""detect_document.py — Auto-detect platform & category from uploaded Excel/CSV columns.

Usage:
  python3 detect_document.py <file_path>
  
Outputs JSON:
  {"platform": "Shopee|TikTok|Meta|Website", "category": "...", "confidence": float, "month": "...", "dir": "ParentDirectory"}
"""

import sys
import os
import json
import re
import pandas as pd

MONTHS_MAP = {
    "januari": ("01", "Januari"),
    "februari": ("02", "Februari"),
    "maret": ("03", "Maret"),
    "april": ("04", "April"),
    "mei": ("05", "Mei"),
    "juni": ("06", "Juni"),
    "juli": ("07", "Juli"),
    "agustus": ("08", "Agustus"),
    "september": ("09", "September"),
    "oktober": ("10", "Oktober"),
    "november": ("11", "November"),
    "desember": ("12", "Desember"),
}

def normalize_cols(cols):
    """Lowercase + strip column names for fuzzy matching."""
    return [str(c).strip().lower() for c in cols]

def score_match(file_cols, template_cols):
    """Return fraction of template columns found in file."""
    if not file_cols or not template_cols:
        return 0.0
    file_set = set(file_cols)
    matches = sum(1 for tc in template_cols if tc in file_set)
    return matches / len(template_cols)

def detect_from_columns(cols, filename=""):
    """Match columns against known document templates. Returns (platform, category, confidence)."""
    nc = normalize_cols(cols)
    filename_lower = filename.lower()
    
    candidates = []
    
    # ── Shopee Ads (.csv, header at row 8) ──
    shp_ads_tpl = ["ad name", "impression", "clicks", "ctr", "conversions", "gmv", "expense", "roas", "acos"]
    s = score_match(nc, shp_ads_tpl)
    if s >= 0.7:
        candidates.append(("Shopee", "Shp Ads", s))
    
    # ── Shopee Overview Metriks ──
    shp_overview_tpl = ["sales (idr)", "orders", "visitors", "product clicks", "order conversion rate", "repeat purchase rate"]
    s = score_match(nc, shp_overview_tpl)
    if s >= 0.5:
        candidates.append(("Shopee", "Shp Overview Metriks", s))
    
    # ── Shopee Product Performance ──
    shp_product_tpl = ["item id", "product", "sku", "sales (confirmed order) (idr)", "product impression", "product clicks", "ctr", "order conversion rate"]
    s = score_match(nc, shp_product_tpl)
    if s >= 0.5:
        candidates.append(("Shopee", "Shp Product Performance", s))
    
    # ── TikTok Overview ──
    tts_overview_tpl = ["gmv", "orders", "visitors", "product clicks", "conversion rate", "aov"]
    s = score_match(nc, tts_overview_tpl)
    if s >= 0.5:
        candidates.append(("TikTok", "Tts Overview Metriks", s))
    
    # ── TikTok Live Seller ──
    tts_live_seller_tpl = ["nickname", "creator", "live-attributed gmv (rp)", "duration", "views", "product clicks", "ctr"]
    alt_tts_live_seller_tpl = ["creator", "live attributed gmv (rp)", "duration", "views"]
    s = max(score_match(nc, tts_live_seller_tpl), score_match(nc, alt_tts_live_seller_tpl))
    if s >= 0.4:
        is_affiliate = "affiliate" in filename_lower
        is_seller = "seller" in filename_lower
        if is_affiliate and not is_seller:
            candidates.append(("TikTok", "Tts Live Affiliate", s - 0.05))
        elif is_seller and not is_affiliate:
            candidates.append(("TikTok", "Tts Live Seller", s))
        else:
            candidates.append(("TikTok", "Tts Live Seller", s))
    
    # ── TikTok Live Affiliate ──
    tts_live_aff_tpl = ["nickname", "creator", "live-attributed gmv (rp)", "duration", "views", "product clicks"]
    alt_tts_live_aff_tpl = ["creator", "live attributed gmv (rp)", "duration", "views"]
    s = max(score_match(nc, tts_live_aff_tpl), score_match(nc, alt_tts_live_aff_tpl))
    if s >= 0.4:
        is_affiliate = "affiliate" in filename_lower
        is_seller = "seller" in filename_lower
        if is_affiliate and not is_seller:
            candidates.append(("TikTok", "Tts Live Affiliate", s))
        elif is_seller and not is_affiliate:
            candidates.append(("TikTok", "Tts Live Seller", s))
        else:
            candidates.append(("TikTok", "Tts Live Affiliate", s))
    
    # ── TikTok Video Seller ──
    tts_vid_seller_tpl = ["creator name", "vv", "video-attributed gmv (rp)", "likes", "comments"]
    alt_tts_vid_seller_tpl = ["creator", "video-attributed gmv (rp)", "views (vv)", "likes"]
    s = max(score_match(nc, tts_vid_seller_tpl), score_match(nc, alt_tts_vid_seller_tpl))
    if s >= 0.4:
        is_affiliate = "affiliate" in filename_lower
        is_seller = "seller" in filename_lower
        if is_affiliate and not is_seller:
            candidates.append(("TikTok", "Tts Video Affiliate", s - 0.05))
        elif is_seller and not is_affiliate:
            candidates.append(("TikTok", "Tts Video Seller", s))
        else:
            candidates.append(("TikTok", "Tts Video Seller", s))
    
    # ── TikTok Video Affiliate ──
    tts_vid_aff_tpl = ["creator name", "vv", "video-attributed gmv (rp)", "likes", "comments"]
    alt_tts_vid_aff_tpl = ["creator", "video-attributed gmv (rp)", "views (vv)", "likes"]
    s = max(score_match(nc, tts_vid_aff_tpl), score_match(nc, alt_tts_vid_aff_tpl))
    if s >= 0.4:
        is_affiliate = "affiliate" in filename_lower
        is_seller = "seller" in filename_lower
        if is_affiliate and not is_seller:
            candidates.append(("TikTok", "Tts Video Affiliate", s))
        elif is_seller and not is_affiliate:
            candidates.append(("TikTok", "Tts Video Seller", s))
        else:
            candidates.append(("TikTok", "Tts Video Affiliate", s))
    
    # ── TikTok GMV Max Ads ──
    tts_gmv_tpl = ["campaign name", "cost", "gross revenue", "sku orders"]
    tts_gmv_live_tpl = ["campaign name", "live name", "cost", "gross revenue", "sku orders", "live views"]
    s = max(score_match(nc, tts_gmv_tpl), score_match(nc, tts_gmv_live_tpl))
    if s >= 0.4:
        # Determine live vs product
        if "live name" in nc or "live views" in nc:
            candidates.append(("TikTok", "Tts Gmv Max Live Ads", s))
        else:
            candidates.append(("TikTok", "Tts Gmv Max Product Ads", s))
    
    # ── TikTok Product Affiliate ──
    tts_prod_aff_tpl = ["product name", "creator-attributed gmv", "creator-attributed items sold", "attributed orders"]
    s = score_match(nc, tts_prod_aff_tpl)
    if s >= 0.5:
        candidates.append(("TikTok", "Tts Product Affiliate", s))
    
    # ── TikTok Product List / Product Card ──
    if len(nc) <= 3:
        single_col_set = set(nc)
        if single_col_set.issubset({"id", "product id", "product name"}):
            if "product name" in single_col_set:
                candidates.append(("TikTok", "Tts Product Affiliate", 0.6))
            else:
                candidates.append(("TikTok", "Tts Product List", 0.5))
    
    # ── Meta Ads ──
    meta_tpl = ["campaign name", "amount spent (idr)", "impressions", "link clicks", "reach"]
    s = score_match(nc, meta_tpl)
    if s >= 0.4:
        has_purchase_cols = any("purchases conversion value" in c for c in nc)
        has_roas_cols = any("purchase roas" in c for c in nc)
        has_month_col = any(c == "month" for c in nc)
        
        # CPAS has extra "Month" column + purchase data
        if has_month_col and (has_purchase_cols or has_roas_cols):
            candidates.append(("Meta", "CPAS", s))
        elif has_purchase_cols or has_roas_cols:
            candidates.append(("Meta", "Meta Website", s))
        elif has_month_col:
            candidates.append(("Meta", "Meta Traffic", s))
        else:
            candidates.append(("Meta", "Meta Regular", s))
    
    # ── Website Overview ──
    web_overview_tpl = ["tanggal", "jumlah order", "penjualan bersih", "laba kotor"]
    s = score_match(nc, web_overview_tpl)
    if s >= 0.5:
        candidates.append(("Website", "Overview Website", s))
    
    # ── Website Product Performance ──
    web_product_tpl = ["#", "sku", "nama produk", "jumlah pembayaran", "penjualan bersih"]
    s = score_match(nc, web_product_tpl)
    if s >= 0.5:
        candidates.append(("Website", "Website Product Performance", s))
    
    if not candidates:
        return (None, None, 0.0)
    
    candidates.sort(key=lambda x: x[2], reverse=True)
    best = candidates[0]
    return best

def detect_from_filename(filepath):
    """Extract month/year from filename using known patterns."""
    filename = os.path.basename(filepath).lower()
    filename_clean = filename.replace("februari2026", "februari 2026")
    
    match = re.search(
        r'(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*2026',
        filename_clean
    )
    if match:
        return match.group(1)
    
    # Date range pattern: (2026-01-01 - 2026-01-31)
    range_match = re.search(r'\((\d{4})-(\d{2})\d*-\d+\s*-\s*\d{4}-\d{2}\d*-\d+\)', filename)
    if range_match:
        month_num = range_match.group(2)
        month_names_en = {"01": "januari", "02": "februari", "03": "maret", "04": "april",
                          "05": "mei", "06": "juni", "07": "juli", "08": "agustus",
                          "09": "september", "10": "oktober", "11": "november", "12": "desember"}
        return month_names_en.get(month_num)
    
    return None

def read_columns(filepath):
    """Read column headers from file, handling CSV with skiprows and XLSX."""
    ext = os.path.splitext(filepath)[1].lower()
    
    BUSINESS_TOKENS = {"gmv", "orders", "sales", "product", "sku", "campaign", "impression",
                       "visitors", "conversion", "cost", "revenue", "views", "clicks",
                       "duration", "creator", "nickname", "penjualan", "tanggal", "laba"}
    
    if ext == ".csv":
        try:
            df = pd.read_csv(filepath, nrows=5, encoding="utf-8")
            if len(df.columns) > 1:
                return list(df.columns), "csv_normal"
        except Exception:
            pass
        
        try:
            df = pd.read_csv(filepath, nrows=5, skiprows=7, encoding="utf-8")
            if len(df.columns) > 1:
                cols = list(df.columns)
                if any(tok in str(c).lower() for c in cols for tok in ["name", "impression", "click", "gmv", "cost"]):
                    return cols, "csv_skip7"
        except Exception:
            pass
        
        try:
            df = pd.read_csv(filepath, nrows=5, encoding="latin-1")
            return list(df.columns), "csv_latin"
        except Exception:
            return [], "fail"
    
    elif ext in (".xlsx", ".xls"):
        try:
            df_full = pd.read_excel(filepath, header=None, nrows=15, engine="openpyxl")
            
            best_row_idx = -1
            best_score = 0
            best_cols = []
            
            for row_idx in range(min(15, len(df_full))):
                row_vals = [str(v).strip() for v in df_full.iloc[row_idx] if not pd.isna(v)]
                if len(row_vals) < 2:
                    continue
                joined = " ".join(row_vals).lower()
                match_count = sum(1 for tok in BUSINESS_TOKENS if tok in joined)
                if match_count > best_score:
                    best_score = match_count
                    best_row_idx = row_idx
                    best_cols = row_vals
            
            if best_score >= 2 and best_row_idx >= 0:
                return best_cols, f"xlsx_hdr_row{best_row_idx}"
            
            if best_score == 1 and best_row_idx >= 0 and len(best_cols) >= 3:
                return best_cols, f"xlsx_hdr_row{best_row_idx}_weak"
            
            return [], "xlsx_no_match"
        except Exception:
            return [], "fail"
    
    return [], "unsupported"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 detect_document.py <file_path>"}))
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    if not os.path.exists(filepath):
        print(json.dumps({"error": f"File not found: {filepath}"}))
        sys.exit(1)
    
    cols, read_method = read_columns(filepath)
    
    month_name = detect_from_filename(filepath)
    
    platform, category, confidence = detect_from_columns(cols, os.path.basename(filepath))
    
    # Platform → directory mapping
    dir_map = {
        "Shopee": {
            "Shp Ads": ("Shp Ads", "shp ads", ".csv"),
            "Shp Overview Metriks": ("Shp Overview Metriks ", "shp overview metriks", ".xlsx"),
            "Shp Product Performance": ("Shp Product Performance", "shp product performance", ".xlsx"),
        },
        "TikTok": {
            "Tts Overview Metriks": ("Tts Overview Metriks", "tts overview", ".xlsx"),
            "Tts Live Seller": ("Tts Live Seller", "tts live seller", ".xlsx"),
            "Tts Live Affiliate": ("Tts Live Affiliate", "tts live affiliate", ".xlsx"),
            "Tts Video Seller": ("Tts Video Seller", "tts video seller", ".xlsx"),
            "Tts Video Affiliate": ("Tts Video Affiliate", "tts video affiliate", ".xlsx"),
            "Tts Gmv Max Live Ads": ("Tts Gmv Max Ads", "tts gmv max live ", ".xlsx"),
            "Tts Gmv Max Product Ads": ("Tts Gmv Max Ads", "tts gmv max product ", ".xlsx"),
            "Tts Product Affiliate": ("Tts Product Affiliate", "tts product affiliate ", ".xlsx"),
            "Tts Product List": ("Tts Product List", "tts product list", ".xlsx"),
            "Tts Product card Seller": ("Tts Product card Seller", "tts product card", ".xlsx"),
        },
        "Meta": {
            "CPAS": ("CPAS", "cpas", ".xlsx"),
            "Meta Website": ("Meta Website", "meta website", ".xlsx"),
            "Meta Traffic": ("Meta Traffic", "meta traffic", ".xlsx"),
            "Meta Regular": ("Meta Regular", "meta regular", ".xlsx"),
        },
        "Website": {
            "Overview Website": ("Website Overview Metriks ", "website overview", ".csv"),
            "Website Product Performance": ("Website Product Performance", "website product performance", ".xlsx"),
        },
    }
    
    result = {
        "platform": platform,
        "category": category,
        "confidence": round(confidence, 2),
        "month": month_name,
        "columns_found": len(cols) if cols else 0,
        "read_method": read_method,
    }
    
    if platform and category and platform in dir_map and category in dir_map[platform]:
        cat_dir, prefix, ext = dir_map[platform][category]
        result["category_dir"] = cat_dir
        result["filename_prefix"] = prefix
        result["expected_ext"] = ext
        result["dir"] = platform  # parent channel dir
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
