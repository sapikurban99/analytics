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
    match = re.search(r'(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*2026', filename.replace('februari2026', 'februari 2026'))
    if match:
        month_name = match.group(1)
        month_key = f"2026-{months_map[month_name]}"
        if month_key not in data["months"]:
            data["months"][month_key] = {
                "month_name": month_name.capitalize(),
                "shopee_overview": {},
                "tiktok_overview": {},
                "combined_overview": {},
                "daily_trends": [],
                "products": [],
                "lives": [],
                "videos": [],
                "ads": {
                    "shopee": [],
                    "tiktok": {
                        "live": [],
                        "product": [],
                        "summary": {}
                    },
                    "summary": {}
                }
            }

print(f"Initialized months: {list(data['months'].keys())}")

# Second pass: Process each file
for file in all_files:
    filename = os.path.basename(file).lower()
    # Extract month
    match = re.search(r'(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s*2026', filename.replace('februari2026', 'februari 2026'))
    if not match:
        continue
    month_name = match.group(1)
    month_key = f"2026-{months_map[month_name]}"
    
    print(f"Processing: {filename} for month {month_key}")
    
    # 1. Shopee Overview
    if "shp overview metriks" in filename or "shopee overview" in filename:
        try:
            df = pd.read_excel(file, header=None)
            headers = df.iloc[2].tolist()
            
            summary_values = {}
            for col_idx, h in enumerate(headers):
                if pd.isna(h):
                    continue
                summary_values[h] = clean_number(df.iloc[0, col_idx])
                
            data["months"][month_key]["shopee_overview"] = {
                "gmv": summary_values.get("Sales (IDR)", 0),
                "orders": summary_values.get("Orders", 0),
                "visitors": summary_values.get("Visitors", 0),
                "clicks": summary_values.get("Product Clicks", 0),
                "conversion_rate": summary_values.get("Order Conversion Rate", 0),
                "repeat_purchase_rate": summary_values.get("Repeat Purchase Rate", 0)
            }
            
            daily_records = []
            for idx in range(3, len(df)):
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
                for col_idx, h in enumerate(headers):
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

# --- THIRD PASS: POST PROCESS AND COMBINE ---
print("Post-processing and consolidating all metrics...")
for month_key, month_data in data["months"].items():
    shp_daily = month_data.get("_shp_daily", [])
    tts_daily = month_data.get("_tts_daily", [])
    
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
            daily_map[d]["combined_gmv"] = daily_map[d]["shopee_gmv"] + r["tiktok_gmv"]
            daily_map[d]["combined_orders"] = daily_map[d]["shopee_orders"] + r["tiktok_orders"]
            daily_map[d]["combined_visitors"] = daily_map[d]["shopee_visitors"] + r["tiktok_visitors"]
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
                "combined_gmv": r["tiktok_gmv"],
                "combined_orders": r["tiktok_orders"],
                "combined_visitors": r["tiktok_visitors"]
            }
            
    month_data["daily_trends"] = [v for k, v in sorted(daily_map.items())]
    
    # Overview totals
    shp_o = month_data.get("shopee_overview", {})
    tts_o = month_data.get("tiktok_overview", {})
    
    combined_gmv = shp_o.get("gmv", 0) + tts_o.get("gmv", 0)
    combined_orders = shp_o.get("orders", 0) + tts_o.get("orders", 0)
    combined_visitors = shp_o.get("visitors", 0) + tts_o.get("visitors", 0)
    
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
            
        m_p["combined_gmv"] = m_p["shopee_gmv"] + m_p["tiktok_gmv"]
        m_p["combined_items_sold"] = m_p["shopee_items_sold"] + m_p["tiktok_items_sold"]
        
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
    
    comb_cost = shp_cost + tts_cost
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
