import os
import re
import json
import glob
import pandas as pd
import numpy as np

def clean_number(v):
    if pd.isna(v) or v is None:
        return 0
    s = str(v).strip()
    if s == '-' or s == '':
        return 0
    # remove currency symbol, dots (thousands), commas (percentage/decimals)
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

# Target structure
data = {
    "months": {},
}

months_map = {
    "januari": "01",
    "februari": "02",
    "maret": "03",
    "april": "04",
    "mei": "05",
    "juni": "06",
    "juli": "07",
    "agustus": "08",
    "september": "09",
    "oktober": "10",
    "november": "11",
    "desember": "12"
}

# Recursively gather all xlsx and csv files in ./dokumen
all_files = glob.glob("./dokumen/**/*.xlsx", recursive=True) + glob.glob("./dokumen/**/*.csv", recursive=True)

# First pass: Initialize months based on filename matches
for file in all_files:
    filename = os.path.basename(file).lower()
    filename_clean = filename.replace("februari2026", "februari 2026")
    match = re.search(r'(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*2026', filename_clean)
    
    # Also detect from date range pattern: (2026-01-01 - 2026-01-31)
    date_range_match = re.search(r'\((\d{4})-(\d{2})\d*-\d+\s*-\s*\d{4}-\d{2}\d*-\d+\)', filename)
    
    if match:
        month_name = match.group(1)
        month_key = f"2026-{months_map[month_name]}"
    elif date_range_match:
        year = date_range_match.group(1)
        month_num = date_range_match.group(2)
        month_key = f"{year}-{month_num}"
        month_names_en = {"01": "januari", "02": "februari", "03": "maret", "04": "april", "05": "mei", "06": "juni",
                          "07": "juli", "08": "agustus", "09": "september", "10": "oktober", "11": "november", "12": "desember"}
        month_name = month_names_en.get(month_num, "unknown")
    else:
        continue
        
    if month_key not in data["months"]:
        data["months"][month_key] = {
            "month_name": month_name.capitalize(),
            "shopee_overview": {},
            "tiktok_overview": {},
            "website_overview_utm": {},
            "combined_overview": {},
            "meta_ads_performance": [],
            "daily_trends": [],
            "products": [],
            "lives": [],
            "videos": [],
            "shopee_affiliate": [],
            "shopee_channel": {},
            "tiktok_affiliate_creators": [],
            "ads": {
                "shopee": [],
                "tiktok": {
                    "live": [],
                    "product": [],
                    "summary": {}
                },
                "summary": {},
                "shopee_summary": {},
                "meta": {
                    "cpas": { "cost": 0, "purchase": 0, "items": 0, "roas": 0 },
                    "website": { "cost": 0, "purchase": 0, "items": 0, "roas": 0 },
                    "traffic": { "cost": 0, "reach": 0, "impressions": 0, "link_clicks": 0, "cpm": 0, "cpr": 0 }
                }
            }
        }

print(f"Initialized months: {list(data['months'].keys())}")

# Second pass: Process each file
for file in all_files:
    filename = os.path.basename(file).lower()
    filename_clean = filename.replace("februari2026", "februari 2026")
    
    # Extract month from Indonesian month names
    match = re.search(r'(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*2026', filename_clean)
    
    # Extract month from date range pattern
    date_range_match = re.search(r'\((\d{4})-(\d{2})\d*-\d+\s*-\s*\d{4}-\d{2}\d*-\d+\)', filename)
    
    if match:
        month_name = match.group(1)
        month_key = f"2026-{months_map[month_name]}"
    elif date_range_match:
        year = date_range_match.group(1)
        month_num = date_range_match.group(2)
        month_key = f"{year}-{month_num}"
        month_names_en = {"01": "januari", "02": "februari", "03": "maret", "04": "april", "05": "mei", "06": "juni",
                          "07": "juli", "08": "agustus", "09": "september", "10": "oktober", "11": "november", "12": "desember"}
        month_name = month_names_en.get(month_num, "unknown")
    else:
        continue
    
    print(f"Processing: {filename} for month {month_key}")
    
    if "source_files" not in data["months"][month_key]:
        data["months"][month_key]["source_files"] = []
    if os.path.basename(file) not in data["months"][month_key]["source_files"]:
        data["months"][month_key]["source_files"].append(os.path.basename(file))
    
    # 1. Shopee Overview
    if "shp overview metriks" in filename or "shopee overview" in filename:
        try:
            df = pd.read_excel(file, sheet_name="Confirmed Order", header=None)
            
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
                
            data["months"][month_key]["shopee_overview"] = {
                "gmv": summary_values.get("Sales (IDR)", 0),
                "orders": summary_values.get("Orders", 0),
                "visitors": summary_values.get("Visitors", 0),
                "clicks": summary_values.get("Product Clicks", 0),
                "conversion_rate": summary_values.get("Order Conversion Rate", 0),
                "repeat_purchase_rate": summary_values.get("Repeat Purchase Rate", 0)
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
                    "shopee_clicks": daily_vals.get("Product Clicks", 0)
                })
            data["months"][month_key]["_shp_daily"] = daily_records
            
            # Extract channel breakdown from Traffic Sources (confirmed order) sheet
            try:
                ts_df = pd.read_excel(file, sheet_name="Traffic Sources (confirmed ...", header=None)
                ts_row = ts_df.iloc[1]
                data["months"][month_key]["shopee_channel"] = {
                    "product_card": clean_number(ts_row[3]),
                    "seller_live": clean_number(ts_row[4]),
                    "seller_video": clean_number(ts_row[5]),
                    "affiliate": clean_number(ts_row[6]),
                    "shopee_ads": clean_number(ts_row[7])
                }
            except Exception as e:
                print(f"Error Shopee channel breakdown {filename}: {e}")
        except Exception as e:
            print(f"Error Shopee Overview {filename}: {e}")
            
    # 2. TikTok Overview
    elif "tts overview" in filename:
        try:
            df = pd.read_excel(file, header=None)
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
                
            data["months"][month_key]["tiktok_overview"] = {
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
                    "conversion_rate": growth_values.get("Conversion rate", 0)
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
                    "tiktok_clicks": daily_vals.get("Product clicks", 0)
                })
            data["months"][month_key]["_tts_daily"] = daily_records
        except Exception as e:
            print(f"Error TikTok Overview {filename}: {e}")
            
    # 3. Shopee Product Performance
    elif "shp product performance" in filename:
        try:
            df = pd.read_excel(file)
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
                    
                    data["months"][month_key]["products"].append({
                        "name": p_name,
                        "platform": "Shopee",
                        "status": status_lbl,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": orders,
                        "conversion_rate": conv_rate,
                        "ctr": clean_number(row.get("CTR", 0)),
                        "views": clean_number(row.get("Product Impression", 0)),
                        "clicks": clean_number(row.get("Product Clicks", 0))
                    })
        except Exception as e:
            print(f"Error Shopee Products {filename}: {e}")
            
    # 4. TikTok Product Affiliate
    elif "tts product affiliate" in filename:
        try:
            df = pd.read_excel(file)
            if "Product name" in df.columns:
                for _, row in df.iterrows():
                    p_name = str(row["Product name"]).strip()
                    if p_name == '-' or pd.isna(row["Product name"]):
                        continue
                    gmv = clean_number(row.get("Creator-attributed GMV", 0))
                    items_sold = clean_number(row.get("Creator-attributed items sold", 0))
                    orders = clean_number(row.get("Attributed orders", 0))
                    
                    data["months"][month_key]["products"].append({
                        "name": p_name,
                        "platform": "TikTok",
                        "status": "Active",
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": orders,
                        "conversion_rate": 0,
                        "ctr": 0,
                        "views": 0,
                        "clicks": 0
                    })
        except Exception as e:
            print(f"Error TikTok Products {filename}: {e}")
            
    # 4b. TikTok Product List
    elif "tts product list" in filename:
        try:
            df = pd.read_excel(file)
            if "Product name" in df.columns:
                for _, row in df.iterrows():
                    p_name = str(row["Product name"]).strip()
                    if p_name == '-' or pd.isna(row["Product name"]):
                        continue
                    gmv = clean_number(row.get("GMV", 0))
                    items_sold = clean_number(row.get("Items sold", 0))
                    
                    data["months"][month_key]["products"].append({
                        "name": p_name,
                        "platform": "TikTok",
                        "status": "Active",
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": items_sold,
                        "conversion_rate": 0,
                        "ctr": 0,
                        "views": 0,
                        "clicks": 0
                    })
        except Exception as e:
            print(f"Error TikTok Product List {filename}: {e}")
            
    # 4c. TikTok Product Card
    elif "tts product card" in filename:
        try:
            df = pd.read_excel(file)
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
                    
                    data["months"][month_key]["products"].append({
                        "name": p_name,
                        "platform": "TikTok",
                        "status": "Active",
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": items_sold,
                        "conversion_rate": 0,
                        "ctr": ctr,
                        "views": views,
                        "clicks": clicks
                    })
        except Exception as e:
            print(f"Error TikTok Product Card {filename}: {e}")
            
    # 5. TikTok Live Seller
    elif "tts live seller" in filename:
        try:
            df = pd.read_excel(file, header=2)
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
                        
                    data["months"][month_key]["lives"].append({
                        "creator": nickname,
                        "creator_name": str(row.get("Creator", nickname)).strip(),
                        "type": "Seller",
                        "duration": duration_str,
                        "duration_minutes": duration_min,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "views": views,
                        "clicks": clicks,
                        "ctr": ctr
                    })
        except Exception as e:
            print(f"Error TikTok Live Seller {filename}: {e}")
            
    # 6. TikTok Live Affiliate
    elif "tts live affiliate" in filename:
        try:
            df = pd.read_excel(file, header=2)
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
                        
                    data["months"][month_key]["lives"].append({
                        "creator": nickname,
                        "creator_name": str(row.get("Creator", nickname)).strip(),
                        "type": "Affiliate",
                        "duration": duration_str,
                        "duration_minutes": duration_min,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "views": views,
                        "clicks": clicks,
                        "ctr": ctr
                    })
        except Exception as e:
            print(f"Error TikTok Live Affiliate {filename}: {e}")
            
    # 7. TikTok Video Seller
    elif "tts video seller" in filename:
        try:
            df = pd.read_excel(file, header=2)
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
                        
                    data["months"][month_key]["videos"].append({
                        "creator": creator,
                        "title": info,
                        "type": "Seller",
                        "views": vv,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "ctr": ctr,
                        "likes": likes,
                        "comments": comments
                    })
        except Exception as e:
            print(f"Error TikTok Video Seller {filename}: {e}")
            
    # 8. TikTok Video Affiliate
    elif "tts video affiliate" in filename:
        try:
            df = pd.read_excel(file, header=2)
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
                        
                    data["months"][month_key]["videos"].append({
                        "creator": creator,
                        "title": info,
                        "type": "Affiliate",
                        "views": vv,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "ctr": ctr,
                        "likes": likes,
                        "comments": comments
                    })
        except Exception as e:
            print(f"Error TikTok Video Affiliate {filename}: {e}")
            
    # 9. Shopee CPC Ads
    elif "shp ads" in filename:
        try:
            df = pd.read_csv(file, skiprows=7)
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
                    
                    data["months"][month_key]["ads"]["shopee"].append({
                        "ad_name": ad_name,
                        "impressions": imp,
                        "clicks": clicks,
                        "cost": cost,
                        "gmv": gmv,
                        "orders": orders,
                        "roas": roas,
                        "ctr": ctr
                    })
        except Exception as e:
            print(f"Error Shopee Ads {filename}: {e}")
            
    # 10. TikTok GMV Max Live Ads
    elif "tts gmv max live" in filename:
        try:
            df = pd.read_excel(file)
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
                        
                    data["months"][month_key]["ads"]["tiktok"]["live"].append({
                        "campaign_name": name,
                        "cost": cost,
                        "gmv": gmv,
                        "orders": orders,
                        "views": views,
                        "roi": roi
                    })
        except Exception as e:
            print(f"Error TikTok GMV Max Live Ads {filename}: {e}")
            
    # 11. TikTok GMV Max Product Ads
    elif "tts gmv max product" in filename:
        try:
            df = pd.read_excel(file)
            if "Campaign name" in df.columns:
                grouped = df.groupby("Campaign name").agg({
                    "Cost": "sum",
                    "Gross revenue": "sum",
                    "SKU orders": "sum",
                    "Product ad impressions": "sum",
                    "Product ad clicks": "sum"
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
                        
                    data["months"][month_key]["ads"]["tiktok"]["product"].append({
                        "campaign_name": name,
                        "cost": cost,
                        "gmv": gmv,
                        "orders": orders,
                        "impressions": imp,
                        "clicks": clicks,
                        "roi": round(gmv / cost, 2) if cost > 0 else 0
                    })
        except Exception as e:
            print(f"Error TikTok GMV Max Product Ads {filename}: {e}")

    # 12. Website Overview
    elif "website overview" in filename or "website_overview" in filename:
        try:
            df = pd.read_csv(file)
            if "Tanggal" in df.columns:
                gmv_sum = 0
                orders_sum = 0
                daily_records = []
                for _, row in df.iterrows():
                    tanggal = str(row["Tanggal"]).strip()
                    if pd.isna(row["Tanggal"]) or tanggal == '-':
                        continue
                    gmv = clean_number(row.get("Penjualan Bersih", row.get("Nilai Order", 0)))
                    orders = clean_number(row.get("Jumlah Order", 0))
                    gmv_sum += gmv
                    orders_sum += orders
                    
                    # Convert '01 Jan 2026' to '2026-01-01'
                    try:
                        date_obj = pd.to_datetime(tanggal, format='%d %b %Y')
                        date_norm = date_obj.strftime('%Y-%m-%d')
                    except:
                        date_norm = tanggal
                        
                    daily_records.append({
                        "date": date_norm,
                        "website_gmv": gmv,
                        "website_orders": orders
                    })
                
                data["months"][month_key]["website_overview_utm"] = {
                    "gmv": gmv_sum,
                    "orders": orders_sum,
                    "visitors": 0,
                    "conversion_rate": 0
                }
                data["months"][month_key]["_web_daily"] = daily_records
        except Exception as e:
            print(f"Error Website Overview {filename}: {e}")

    # 12b. Website Product Performance
    elif "website product" in filename or "website_product" in filename:
        try:
            df = pd.read_excel(file)
            if "Nama Produk" in df.columns:
                for _, row in df.iterrows():
                    p_name = str(row["Nama Produk"]).strip()
                    if p_name == '-' or pd.isna(row["Nama Produk"]) or p_name == 'nan':
                        continue
                    gmv = clean_number(row.get("Penjualan Bersih", 0))
                    units = clean_number(row.get("Jumlah Pembayaran", 0))
                    sku = str(row.get("SKU", "-")).strip()
                    
                    data["months"][month_key]["products"].append({
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
                        "sku": sku
                    })
        except Exception as e:
            print(f"Error Website Products {filename}: {e}")

    # 13. Meta Ads — split by CPAS, Website, Traffic
    elif "meta cpas" in filename:
        try:
            df = pd.read_excel(file) if filename.endswith('.xlsx') else pd.read_csv(file)
            if "Campaign name" in df.columns:
                total_cost = 0
                total_purchase = 0
                total_items = 0
                for _, row in df.iterrows():
                    cost = clean_number(row.get("Amount spent (IDR)", 0))
                    purchase_gmv = clean_number(row.get("Purchases conversion value for shared items only", 0))
                    items = clean_number(row.get("Purchases with shared items", 0))
                    total_cost += cost
                    total_purchase += purchase_gmv
                    total_items += items

                    if cost == 0 and purchase_gmv == 0:
                        continue

                    data["months"][month_key]["meta_ads_performance"].append({
                        "campaign_name": str(row["Campaign name"]).strip(),
                        "cost": cost,
                        "gmv": purchase_gmv,
                        "orders": items,
                        "impressions": clean_number(row.get("Impressions", 0)),
                        "clicks": clean_number(row.get("Link clicks", 0)),
                        "roi": round(purchase_gmv / cost, 2) if cost > 0 else 0,
                        "meta_type": "cpas"
                    })

                data["months"][month_key]["ads"]["meta"]["cpas"] = {
                    "cost": total_cost,
                    "purchase": total_purchase,
                    "items": total_items,
                    "roas": round(total_purchase / total_cost, 2) if total_cost > 0 else 0
                }
        except Exception as e:
            print(f"Error Meta CPAS {filename}: {e}")

    elif "meta website" in filename:
        try:
            df = pd.read_excel(file) if filename.endswith('.xlsx') else pd.read_csv(file)
            if "Campaign name" in df.columns:
                total_cost = 0
                total_purchase = 0
                total_items = 0
                for _, row in df.iterrows():
                    cost = clean_number(row.get("Amount spent (IDR)", 0))
                    purchase_gmv = clean_number(row.get("Purchases conversion value for shared items only", 0))
                    items = clean_number(row.get("Purchases with shared items", 0))
                    total_cost += cost
                    total_purchase += purchase_gmv
                    total_items += items

                    if cost == 0 and purchase_gmv == 0:
                        continue

                    data["months"][month_key]["meta_ads_performance"].append({
                        "campaign_name": str(row["Campaign name"]).strip(),
                        "cost": cost,
                        "gmv": purchase_gmv,
                        "orders": items,
                        "impressions": clean_number(row.get("Impressions", 0)),
                        "clicks": clean_number(row.get("Link clicks", 0)),
                        "roi": round(purchase_gmv / cost, 2) if cost > 0 else 0,
                        "meta_type": "website"
                    })

                data["months"][month_key]["ads"]["meta"]["website"] = {
                    "cost": total_cost,
                    "purchase": total_purchase,
                    "items": total_items,
                    "roas": round(total_purchase / total_cost, 2) if total_cost > 0 else 0
                }
        except Exception as e:
            print(f"Error Meta Website {filename}: {e}")

    elif "meta traffic" in filename:
        try:
            df = pd.read_excel(file) if filename.endswith('.xlsx') else pd.read_csv(file)
            if "Campaign name" in df.columns:
                total_cost = 0
                total_reach = 0
                total_impressions = 0
                total_link_clicks = 0
                for _, row in df.iterrows():
                    cost = clean_number(row.get("Amount spent (IDR)", 0))
                    reach = clean_number(row.get("Reach", 0))
                    impressions = clean_number(row.get("Impressions", 0))
                    link_clicks = clean_number(row.get("Link clicks", 0))

                    total_cost += cost
                    total_reach += reach
                    total_impressions += impressions
                    total_link_clicks += link_clicks

                    if cost == 0 and impressions < 10:
                        continue

                    data["months"][month_key]["meta_ads_performance"].append({
                        "campaign_name": str(row["Campaign name"]).strip(),
                        "cost": cost,
                        "gmv": 0,
                        "orders": 0,
                        "impressions": impressions,
                        "clicks": link_clicks,
                        "roi": 0,
                        "meta_type": "traffic",
                        "reach": reach
                    })

                cpm = (total_cost / total_impressions * 1000) if total_impressions > 0 else 0
                cpr = total_cost / total_link_clicks if total_link_clicks > 0 else 0
                data["months"][month_key]["ads"]["meta"]["traffic"] = {
                    "cost": total_cost,
                    "reach": total_reach,
                    "impressions": total_impressions,
                    "link_clicks": total_link_clicks,
                    "cpm": round(cpm, 2),
                    "cpr": round(cpr, 2)
                }
        except Exception as e:
            print(f"Error Meta Traffic {filename}: {e}")

    # 14. Shopee Affiliate
    elif "shp performance affiliate" in filename or "shp affiliate" in filename:
        try:
            ext = os.path.splitext(file)[1].lower()
            df = pd.read_csv(file) if ext == '.csv' else pd.read_excel(file)
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
                    data["months"][month_key]["shopee_affiliate"].append({
                        "creator": name,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": orders,
                        "clicks": clicks,
                        "commission": commission,
                        "roi": roi
                    })
        except Exception as e:
            print(f"Error Shopee Affiliate {filename}: {e}")

    # 15. TikTok Creator Affiliate
    elif "tts creator affiliate" in filename:
        try:
            df = pd.read_excel(file) if filename.endswith('.xlsx') else pd.read_csv(file)
            if "Creator name" in df.columns and "Creator-attributed GMV" in df.columns:
                for _, row in df.iterrows():
                    name = str(row.get("Creator name", "")).strip()
                    if name == '-' or pd.isna(row.get("Creator name")):
                        continue
                    gmv = clean_number(row.get("Creator-attributed GMV", 0))
                    items_sold = clean_number(row.get("Creator-attributed items sold", 0))
                    orders = clean_number(row.get("Attributed orders", 0))
                    commission = clean_number(row.get("Est. commission", 0))
                    refunds = clean_number(row.get("Refunds", 0))

                    data["months"][month_key]["tiktok_affiliate_creators"].append({
                        "creator": name,
                        "gmv": gmv,
                        "items_sold": items_sold,
                        "orders": orders,
                        "commission": commission,
                        "refunds": refunds,
                        "videos": clean_number(row.get("Videos", 0)),
                        "live_streams": clean_number(row.get("LIVE streams", 0)),
                        "aov": clean_number(row.get("AOV", 0))
                    })
        except Exception as e:
            print(f"Error TikTok Creator Affiliate {filename}: {e}")

# --- THIRD PASS: POST PROCESS AND COMBINE ---
print("Post-processing and consolidating all metrics...")
for month_key, month_data in data["months"].items():
    shp_daily = month_data.get("_shp_daily", [])
    tts_daily = month_data.get("_tts_daily", [])
    web_daily = month_data.get("_web_daily", [])
    
    daily_map = {}
    for r in shp_daily:
        daily_map[r["date"]] = {
            "date": r["date"],
            "shopee_gmv": r["shopee_gmv"],
            "shopee_orders": r["shopee_orders"],
            "shopee_visitors": r["shopee_visitors"],
            "shopee_clicks": r["shopee_clicks"],
            "tiktok_gmv": 0,
            "tiktok_orders": 0,
            "tiktok_visitors": 0,
            "tiktok_clicks": 0,
            "website_gmv": 0,
            "website_orders": 0,
            "meta_gmv": 0,
            "meta_orders": 0,
            "combined_gmv": r["shopee_gmv"],
            "combined_orders": r["shopee_orders"],
            "combined_visitors": r["shopee_visitors"]
        }
        
    for r in tts_daily:
        d = r["date"]
        if d in daily_map:
            daily_map[d]["tiktok_gmv"] = r["tiktok_gmv"]
            daily_map[d]["tiktok_orders"] = r["tiktok_orders"]
            daily_map[d]["tiktok_visitors"] = r["tiktok_visitors"]
            daily_map[d]["tiktok_clicks"] = r["tiktok_clicks"]
            daily_map[d]["combined_gmv"] += r["tiktok_gmv"]
            daily_map[d]["combined_orders"] += r["tiktok_orders"]
            daily_map[d]["combined_visitors"] += r["tiktok_visitors"]
        else:
            daily_map[d] = {
                "date": d,
                "shopee_gmv": 0,
                "shopee_orders": 0,
                "shopee_visitors": 0,
                "shopee_clicks": 0,
                "tiktok_gmv": r["tiktok_gmv"],
                "tiktok_orders": r["tiktok_orders"],
                "tiktok_visitors": r["tiktok_visitors"],
                "tiktok_clicks": r["tiktok_clicks"],
                "website_gmv": 0,
                "website_orders": 0,
                "meta_gmv": 0,
                "meta_orders": 0,
                "combined_gmv": r["tiktok_gmv"],
                "combined_orders": r["tiktok_orders"],
                "combined_visitors": r["tiktok_visitors"]
            }
            
    for r in web_daily:
        d = r["date"]
        if d in daily_map:
            daily_map[d]["website_gmv"] = r["website_gmv"]
            daily_map[d]["website_orders"] = r["website_orders"]
            daily_map[d]["combined_gmv"] += r["website_gmv"]
            daily_map[d]["combined_orders"] += r["website_orders"]
        else:
            daily_map[d] = {
                "date": d,
                "shopee_gmv": 0,
                "shopee_orders": 0,
                "shopee_visitors": 0,
                "shopee_clicks": 0,
                "tiktok_gmv": 0,
                "tiktok_orders": 0,
                "tiktok_visitors": 0,
                "tiktok_clicks": 0,
                "website_gmv": r["website_gmv"],
                "website_orders": r["website_orders"],
                "meta_gmv": 0,
                "meta_orders": 0,
                "combined_gmv": r["website_gmv"],
                "combined_orders": r["website_orders"],
                "combined_visitors": 0
            }
            
    month_data["daily_trends"] = [v for k, v in sorted(daily_map.items())]
    
    # Overview totals
    # NOTE: Meta GMV excluded from combined — meta is attribution (double-counts Shopee/Website)
    shp_o = month_data.get("shopee_overview", {})
    tts_o = month_data.get("tiktok_overview", {})
    web_o = month_data.get("website_overview_utm", {})
    
    combined_gmv = shp_o.get("gmv", 0) + tts_o.get("gmv", 0) + web_o.get("gmv", 0)
    combined_orders = shp_o.get("orders", 0) + tts_o.get("orders", 0) + web_o.get("orders", 0)
    combined_visitors = shp_o.get("visitors", 0) + tts_o.get("visitors", 0) + web_o.get("visitors", 0)
    
    month_data["combined_overview"] = {
        "gmv": combined_gmv,
        "orders": combined_orders,
        "visitors": combined_visitors,
        "conversion_rate": round(combined_orders / combined_visitors, 6) if combined_visitors > 0 else 0
    }
    
    # Remove temp daily keys
    if "_shp_daily" in month_data:
        del month_data["_shp_daily"]
    if "_tts_daily" in month_data:
        del month_data["_tts_daily"]
    if "_web_daily" in month_data:
        del month_data["_web_daily"]

# Compute Growth Rates month-over-month
keys = sorted(data["months"].keys())
for i, month_key in enumerate(keys):
    month_data = data["months"][month_key]
    if i == 0:
        month_data["combined_overview"]["growth"] = {
            "gmv": 0, "orders": 0, "visitors": 0, "conversion_rate": 0
        }
        if month_data.get("shopee_overview"):
            month_data["shopee_overview"]["growth"] = { "gmv": 0, "orders": 0, "visitors": 0, "conversion_rate": 0 }
        if month_data.get("tiktok_overview"):
            month_data["tiktok_overview"]["growth"] = { "gmv": 0, "orders": 0, "visitors": 0, "conversion_rate": 0 }
    else:
        prev_month_data = data["months"][keys[i-1]]
        
        # Shopee growth
        shp_curr = month_data.get("shopee_overview", {})
        shp_prev = prev_month_data.get("shopee_overview", {})
        if shp_curr and shp_prev:
            shp_curr["growth"] = {
                "gmv": round((shp_curr["gmv"] - shp_prev["gmv"]) / shp_prev["gmv"], 6) if shp_prev.get("gmv", 0) > 0 else 0,
                "orders": round((shp_curr["orders"] - shp_prev["orders"]) / shp_prev["orders"], 6) if shp_prev.get("orders", 0) > 0 else 0,
                "visitors": round((shp_curr["visitors"] - shp_prev["visitors"]) / shp_prev["visitors"], 6) if shp_prev.get("visitors", 0) > 0 else 0,
                "conversion_rate": round((shp_curr["conversion_rate"] - shp_prev["conversion_rate"]) / shp_prev["conversion_rate"], 6) if shp_prev.get("conversion_rate", 0) > 0 else 0,
            }
            
        # TikTok growth
        tts_curr = month_data.get("tiktok_overview", {})
        tts_prev = prev_month_data.get("tiktok_overview", {})
        if tts_curr and tts_prev:
            tts_curr["growth"] = {
                "gmv": round((tts_curr["gmv"] - tts_prev["gmv"]) / tts_prev["gmv"], 6) if tts_prev.get("gmv", 0) > 0 else 0,
                "orders": round((tts_curr["orders"] - tts_prev["orders"]) / tts_prev["orders"], 6) if tts_prev.get("orders", 0) > 0 else 0,
                "visitors": round((tts_curr["visitors"] - tts_prev["visitors"]) / tts_prev["visitors"], 6) if tts_prev.get("visitors", 0) > 0 else 0,
                "conversion_rate": round((tts_curr["conversion_rate"] - tts_prev["conversion_rate"]) / tts_prev["conversion_rate"], 6) if tts_prev.get("conversion_rate", 0) > 0 else 0,
            }
        elif tts_curr:
            tts_curr["growth"] = { "gmv": 0, "orders": 0, "visitors": 0, "conversion_rate": 0 }
            
        # Combined growth
        comb_curr = month_data["combined_overview"]
        comb_prev = prev_month_data["combined_overview"]
        comb_curr["growth"] = {
            "gmv": round((comb_curr["gmv"] - comb_prev["gmv"]) / comb_prev["gmv"], 6) if comb_prev.get("gmv", 0) > 0 else 0,
            "orders": round((comb_curr["orders"] - comb_prev["orders"]) / comb_prev["orders"], 6) if comb_prev.get("orders", 0) > 0 else 0,
            "visitors": round((comb_curr["visitors"] - comb_prev["visitors"]) / comb_prev["visitors"], 6) if comb_prev.get("visitors", 0) > 0 else 0,
            "conversion_rate": round((comb_curr["conversion_rate"] - comb_prev["conversion_rate"]) / comb_prev["conversion_rate"], 6) if comb_prev.get("conversion_rate", 0) > 0 else 0,
        }

# Group products consolidations
for month_key, month_data in data["months"].items():
    merged_products = {}
    for p in month_data["products"]:
        name = p["name"]
        if name not in merged_products:
            merged_products[name] = {
                "name": name,
                "status": p["status"],
                "shopee_gmv": 0,
                "shopee_items_sold": 0,
                "tiktok_gmv": 0,
                "tiktok_items_sold": 0,
                "website_gmv": 0,
                "website_items_sold": 0,
                "combined_gmv": 0,
                "combined_items_sold": 0
            }
        m_p = merged_products[name]
        if p["platform"] == "Shopee":
            m_p["shopee_gmv"] += p["gmv"]
            m_p["shopee_items_sold"] += p["items_sold"]
            m_p["status"] = p["status"]
        elif p["platform"] == "TikTok":
            m_p["tiktok_gmv"] += p["gmv"]
            m_p["tiktok_items_sold"] += p["items_sold"]
        elif p["platform"] == "Website":
            m_p["website_gmv"] += p["gmv"]
            m_p["website_items_sold"] += p["items_sold"]
            
        m_p["combined_gmv"] = m_p["shopee_gmv"] + m_p["tiktok_gmv"] + m_p["website_gmv"]
        m_p["combined_items_sold"] = m_p["shopee_items_sold"] + m_p["tiktok_items_sold"] + m_p["website_items_sold"]
        
    month_data["products_consolidated"] = sorted(merged_products.values(), key=lambda x: x["combined_gmv"], reverse=True)

# Sort lives/videos
for month_key, month_data in data["months"].items():
    month_data["lives"] = sorted(month_data["lives"], key=lambda x: x["gmv"], reverse=True)
    month_data["videos"] = sorted(month_data["videos"], key=lambda x: x["gmv"], reverse=True)
    
    # Ads performance summary
    ads = month_data["ads"]
    shp_cost = sum(x["cost"] for x in ads["shopee"])
    shp_gmv = sum(x["gmv"] for x in ads["shopee"])
    shp_orders = sum(x["orders"] for x in ads["shopee"])
    ads["shopee_summary"] = {
        "cost": shp_cost,
        "gmv": shp_gmv,
        "orders": shp_orders,
        "roas": round(shp_gmv / shp_cost, 2) if shp_cost > 0 else 0
    }
    
    tts_cost = sum(x["cost"] for x in ads["tiktok"]["live"]) + sum(x["cost"] for x in ads["tiktok"]["product"])
    tts_gmv = sum(x["gmv"] for x in ads["tiktok"]["live"]) + sum(x["gmv"] for x in ads["tiktok"]["product"])
    tts_orders = sum(x["orders"] for x in ads["tiktok"]["live"]) + sum(x["orders"] for x in ads["tiktok"]["product"])
    ads["tiktok"]["summary"] = {
        "cost": tts_cost,
        "gmv": tts_gmv,
        "orders": tts_orders,
        "roi": round(tts_gmv / tts_cost, 2) if tts_cost > 0 else 0
    }
    
    # Include meta cost in combined ads summary (meta spend is real ad cost)
    meta_ads_list = month_data.get("meta_ads_performance", [])
    meta_cost = sum(x["cost"] for x in meta_ads_list)
    meta_gmv_ads = sum(x["gmv"] for x in meta_ads_list)
    meta_orders_ads = sum(x["orders"] for x in meta_ads_list)
    ads["meta_summary"] = {
        "cost": meta_cost,
        "gmv": meta_gmv_ads,
        "orders": meta_orders_ads,
        "roas": round(meta_gmv_ads / meta_cost, 2) if meta_cost > 0 else 0
    }
    
    comb_cost = shp_cost + tts_cost + meta_cost
    comb_gmv = shp_gmv + tts_gmv
    comb_orders = shp_orders + tts_orders
    ads["summary"] = {
        "cost": comb_cost,
        "gmv": comb_gmv,
        "orders": comb_orders,
        "roi": round(comb_gmv / comb_cost, 2) if comb_cost > 0 else 0
    }

# Save output
os.makedirs("./lib/data", exist_ok=True)
with open("./lib/data/consolidated_metrics.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("ETL Data Consolidation complete! Output saved to lib/data/consolidated_metrics.json")
