import consolidatedMetrics from "./data/consolidated_metrics.json";

export interface OverviewMetric {
  key: string;
  label: string;
  value: number;
  growth: number;
  format: 'currency' | 'number' | 'percent';
}

export interface DailyTrendPoint {
  date: string;
  gmv: number;
  orders: number;
  visitors: number;
}

export interface ConsolidatedProduct {
  name: string;
  status: string;
  shopeeGmv: number;
  shopeeItemsSold: number;
  tiktokGmv: number;
  tiktokItemsSold: number;
  websiteGmv: number;
  websiteItemsSold: number;
  combinedGmv: number;
  combinedItemsSold: number;
  platformGmv: number;
  platformItemsSold: number;
}

export interface LiveSession {
  creator: string;
  creator_name: string;
  type: string;
  duration: string;
  duration_minutes: number;
  gmv: number;
  items_sold: number;
  views: number;
  clicks: number;
  ctr: number;
}

export interface VideoMetric {
  creator: string;
  title: string;
  type: string;
  views: number;
  gmv: number;
  items_sold: number;
  ctr: number;
  likes: number;
  comments: number;
}

export interface AdPerformanceSummary {
  cost: number;
  gmv: number;
  orders: number;
  roi: number;
}

export interface ShopeeAffiliateItem {
  creator: string;
  gmv: number;
  items_sold: number;
  orders: number;
  clicks: number;
  commission: number;
  roi: number;
}

export interface ShopeeAdItem {
  ad_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  gmv: number;
  orders: number;
  roas: number;
  ctr: number;
}

export interface TiktokLiveAdItem {
  campaign_name: string;
  cost: number;
  gmv: number;
  orders: number;
  views: number;
  roi: number;
}

export interface TiktokProductAdItem {
  campaign_name: string;
  cost: number;
  gmv: number;
  orders: number;
  impressions: number;
  clicks: number;
  roi: number;
}

export interface TiktokAffiliateCreator {
  creator: string;
  gmv: number;
  items_sold: number;
  orders: number;
  commission: number;
  refunds: number;
  videos: number;
  live_streams: number;
  aov: number;
}

export interface MetaCPASSummary {
  cost: number;
  purchase: number;
  items: number;
  roas: number;
}

export interface MetaWebsiteSummary {
  cost: number;
  purchase: number;
  items: number;
  roas: number;
}

export interface MetaTrafficSummary {
  cost: number;
  reach: number;
  impressions: number;
  link_clicks: number;
  cpm: number;
  cpr: number;
}

export interface ShopeeChannelBreakdown {
  product_card: number;
  seller_live: number;
  seller_video: number;
  affiliate: number;
  shopee_ads: number;
}

export interface DashboardData {
  monthName: string;
  overview: OverviewMetric[];
  dailyTrends: DailyTrendPoint[];
  products: ConsolidatedProduct[];
  lives: LiveSession[];
  videos: VideoMetric[];
  shopeeAffiliate: ShopeeAffiliateItem[];
  ads: {
    summary: AdPerformanceSummary;
    shopee: ShopeeAdItem[];
    tiktokLive: TiktokLiveAdItem[];
    tiktokProduct: TiktokProductAdItem[];
    meta: {
      cpas: MetaCPASSummary;
      website: MetaWebsiteSummary;
      traffic: MetaTrafficSummary;
    };
  };
  shopeeChannel?: ShopeeChannelBreakdown;
  tiktokAffiliateCreators: TiktokAffiliateCreator[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawData = consolidatedMetrics as any;

export function getAvailableMonths(customData?: any) {
  const dataToUse = customData || rawData;
  if (!dataToUse || !dataToUse.months) return [];
  const months = Object.keys(dataToUse.months).sort((a, b) => b.localeCompare(a));
  return months.map((key) => {
    const monthData = dataToUse.months[key];
    return {
      key,
      name: `${monthData.month_name} 2026`,
      label: monthData.month_name,
    };
  });
}

export function getDashboardData(
  monthKey: string,
  platform: 'All' | 'Shopee' | 'TikTok' | 'Meta' | 'Website',
  customData?: any
): DashboardData | null {
  const dataToUse = customData || rawData;
  if (!dataToUse || !dataToUse.months) return null;
  const monthData = dataToUse.months[monthKey];
  if (!monthData) return null;

  const monthName = monthData.month_name;

  const overview: OverviewMetric[] = [];
  if (platform === 'All') {
    const o = monthData.combined_overview || {};
    overview.push({ key: 'gmv', label: 'Total Revenue', value: o.gmv || 0, growth: o.growth?.gmv || 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Total Orders', value: o.orders || 0, growth: o.growth?.orders || 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'Total Visitors', value: o.visitors || 0, growth: o.growth?.visitors || 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: o.conversion_rate || 0, growth: o.growth?.conversion_rate || 0, format: 'percent' });
  } else if (platform === 'Shopee') {
    const o = monthData.shopee_overview || {};
    overview.push({ key: 'gmv', label: 'Shopee Revenue', value: o.gmv || 0, growth: o.growth?.gmv || 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Shopee Orders', value: o.orders || 0, growth: o.growth?.orders || 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'Shopee Visitors', value: o.visitors || 0, growth: o.growth?.visitors || 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: o.conversion_rate || 0, growth: o.growth?.conversion_rate || 0, format: 'percent' });
  } else if (platform === 'TikTok') {
    const o = monthData.tiktok_overview || {};
    overview.push({ key: 'gmv', label: 'TikTok Revenue', value: o.gmv || 0, growth: o.growth?.gmv || 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'TikTok Orders', value: o.orders || 0, growth: o.growth?.orders || 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'TikTok Visitors', value: o.visitors || 0, growth: o.growth?.visitors || 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: o.conversion_rate || 0, growth: o.growth?.conversion_rate || 0, format: 'percent' });
    overview.push({ key: 'aov', label: 'AOV', value: o.aov || 0, growth: 0, format: 'currency' });
  } else if (platform === 'Meta') {
    const meta_ads = monthData.meta_ads_performance || [];
    const meta_gmv = meta_ads.reduce((sum: number, x: any) => sum + (x.gmv || 0), 0);
    const meta_orders = meta_ads.reduce((sum: number, x: any) => sum + (x.orders || 0), 0);
    const meta_clicks = meta_ads.reduce((sum: number, x: any) => sum + (x.clicks || 0), 0);
    overview.push({ key: 'gmv', label: 'Meta Revenue', value: meta_gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Meta Orders', value: meta_orders, growth: 0, format: 'number' });
    overview.push({ key: 'clicks', label: 'Meta Clicks', value: meta_clicks, growth: 0, format: 'number' });
  } else if (platform === 'Website') {
    const w = monthData.website_overview_utm || {};
    overview.push({ key: 'gmv', label: 'Website Revenue', value: w.gmv || 0, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Website Orders', value: w.orders || 0, growth: 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: w.conversion_rate || 0, growth: 0, format: 'percent' });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyTrends: DailyTrendPoint[] = (monthData.daily_trends || []).map((t: any) => {
    let gmv = 0, orders = 0, visitors = 0;
    if (platform === 'All') {
      gmv = t.combined_gmv || 0; orders = t.combined_orders || 0; visitors = t.combined_visitors || 0;
    } else if (platform === 'Shopee') {
      gmv = t.shopee_gmv || 0; orders = t.shopee_orders || 0; visitors = t.shopee_visitors || 0;
    } else if (platform === 'TikTok') {
      gmv = t.tiktok_gmv || 0; orders = t.tiktok_orders || 0; visitors = t.tiktok_visitors || 0;
    } else if (platform === 'Meta') {
      gmv = t.meta_gmv || 0; orders = t.meta_orders || 0; visitors = 0;
    } else if (platform === 'Website') {
      gmv = t.website_gmv || 0; orders = t.website_orders || 0; visitors = 0;
    }
    return { date: t.date, gmv, orders, visitors };
  });

  const rawProducts = monthData.products_consolidated || [];
  const products: ConsolidatedProduct[] = rawProducts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => {
      let platformGmv = 0, platformItemsSold = 0;
      if (platform === 'All') { platformGmv = p.combined_gmv; platformItemsSold = p.combined_items_sold; }
      else if (platform === 'Shopee') { platformGmv = p.shopee_gmv; platformItemsSold = p.shopee_items_sold; }
      else if (platform === 'TikTok') { platformGmv = p.tiktok_gmv; platformItemsSold = p.tiktok_items_sold; }
      else if (platform === 'Website') { platformGmv = p.website_gmv || 0; platformItemsSold = p.website_items_sold || 0; }
      else { platformGmv = 0; platformItemsSold = 0; }
      return {
        name: p.name, status: p.status,
        shopeeGmv: p.shopee_gmv, shopeeItemsSold: p.shopee_items_sold,
        tiktokGmv: p.tiktok_gmv, tiktokItemsSold: p.tiktok_items_sold,
        websiteGmv: p.website_gmv || 0, websiteItemsSold: p.website_items_sold || 0,
        combinedGmv: p.combined_gmv, combinedItemsSold: p.combined_items_sold,
        platformGmv, platformItemsSold,
      };
    })
    .filter((p: ConsolidatedProduct) => p.platformGmv > 0)
    .sort((a: ConsolidatedProduct, b: ConsolidatedProduct) => b.platformGmv - a.platformGmv);

  const lives: LiveSession[] = (platform === 'Shopee' || platform === 'Meta' || platform === 'Website') ? [] : monthData.lives || [];
  const videos: VideoMetric[] = (platform === 'Shopee' || platform === 'Meta' || platform === 'Website') ? [] : monthData.videos || [];
  const shopeeAffiliate: ShopeeAffiliateItem[] = (platform === 'Shopee' || platform === 'All') ? (monthData.shopee_affiliate || []) : [];
  const shopeeChannel: ShopeeChannelBreakdown | undefined = (platform === 'Shopee' || platform === 'All') ? (monthData.shopee_channel || undefined) : undefined;
  const tiktokAffiliateCreators: TiktokAffiliateCreator[] = (platform === 'TikTok' || platform === 'All') ? (monthData.tiktok_affiliate_creators || []) : [];

  const rawAds = monthData.ads || {};
  let adsSummary: AdPerformanceSummary = { cost: 0, gmv: 0, orders: 0, roi: 0 };
  let shopeeAdsList: ShopeeAdItem[] = [];
  let tiktokLiveAdsList: TiktokLiveAdItem[] = [];
  let tiktokProductAdsList: TiktokProductAdItem[] = [];

  if (platform === 'All') {
    const s = rawAds.summary || {};
    adsSummary = { cost: s.cost || 0, gmv: s.gmv || 0, orders: s.orders || 0, roi: s.roi || 0 };
    shopeeAdsList = rawAds.shopee || [];
    tiktokLiveAdsList = rawAds.tiktok?.live || [];
    tiktokProductAdsList = rawAds.tiktok?.product || [];
  } else if (platform === 'Shopee') {
    const s = rawAds.shopee_summary || {};
    adsSummary = { cost: s.cost || 0, gmv: s.gmv || 0, orders: s.orders || 0, roi: s.roas || 0 };
    shopeeAdsList = rawAds.shopee || [];
  } else if (platform === 'TikTok') {
    const s = rawAds.tiktok?.summary || {};
    adsSummary = { cost: s.cost || 0, gmv: s.gmv || 0, orders: s.orders || 0, roi: s.roi || 0 };
    tiktokLiveAdsList = rawAds.tiktok?.live || [];
    tiktokProductAdsList = rawAds.tiktok?.product || [];
  } else if (platform === 'Meta') {
    const meta_ads = monthData.meta_ads_performance || [];
    const meta_cost = meta_ads.reduce((sum: number, x: any) => sum + (x.cost || 0), 0);
    const meta_gmv = meta_ads.reduce((sum: number, x: any) => sum + (x.gmv || 0), 0);
    const meta_orders = meta_ads.reduce((sum: number, x: any) => sum + (x.orders || 0), 0);
    adsSummary = { cost: meta_cost, gmv: meta_gmv, orders: meta_orders, roi: meta_cost > 0 ? meta_gmv / meta_cost : 0 };
  } else if (platform === 'Website') {
    const meta_ads = monthData.meta_ads_performance || [];
    const meta_cost = meta_ads.reduce((sum: number, x: any) => sum + (x.cost || 0), 0);
    adsSummary = { cost: meta_cost, gmv: 0, orders: 0, roi: 0 };
  }

  const metaData = monthData.ads?.meta || { cpas: { cost:0, purchase:0, items:0, roas:0 }, website: { cost:0, purchase:0, items:0, roas:0 }, traffic: { cost:0, reach:0, impressions:0, link_clicks:0, cpm:0, cpr:0 } };

  return {
    monthName, overview, dailyTrends, products, lives, videos, shopeeAffiliate, shopeeChannel, tiktokAffiliateCreators,
    ads: { summary: adsSummary, shopee: shopeeAdsList, tiktokLive: tiktokLiveAdsList, tiktokProduct: tiktokProductAdsList, meta: metaData },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAvailableDateRange(customData?: any): { minDate: string; maxDate: string } {
  const dataToUse = customData || rawData;
  if (!dataToUse?.months) return { minDate: '', maxDate: '' };
  let minDate = '9999-12-31';
  let maxDate = '0000-01-01';
  for (const monthKey of Object.keys(dataToUse.months)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const t of (dataToUse.months[monthKey].daily_trends || []) as any[]) {
      if (t.date) {
        if (t.date < minDate) minDate = t.date;
        if (t.date > maxDate) maxDate = t.date;
      }
    }
  }
  if (minDate === '9999-12-31') return { minDate: '', maxDate: '' };
  return { minDate, maxDate };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDashboardDataByDateRange(
  startDate: string,
  endDate: string,
  platform: 'All' | 'Shopee' | 'TikTok' | 'Meta' | 'Website',
  customData?: any
): DashboardData | null {
  const dataToUse = customData || rawData;
  if (!dataToUse?.months) return null;

  // Merge daily trends across all months by date, filtering by range
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyMap: Record<string, any> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productMap: Record<string, any> = {};
  const allLives: LiveSession[] = [];
  const allVideos: VideoMetric[] = [];
  const allShopeeAffiliate: ShopeeAffiliateItem[] = [];
  const shopeeAdsList: ShopeeAdItem[] = [];
  const tiktokLiveAdsList: TiktokLiveAdItem[] = [];
  const tiktokProductAdsList: TiktokProductAdItem[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metaAdsList: any[] = [];
  const includedMonths = new Set<string>();

  for (const monthKey of Object.keys(dataToUse.months)) {
    const monthData = dataToUse.months[monthKey];
    let monthHasData = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const t of (monthData.daily_trends || []) as any[]) {
      if (t.date >= startDate && t.date <= endDate) {
        monthHasData = true;
        if (!dailyMap[t.date]) {
          dailyMap[t.date] = {
            date: t.date,
            shopee_gmv: 0, shopee_orders: 0, shopee_visitors: 0,
            tiktok_gmv: 0, tiktok_orders: 0, tiktok_visitors: 0,
            website_gmv: 0, website_orders: 0,
            meta_gmv: 0, meta_orders: 0,
            combined_gmv: 0, combined_orders: 0, combined_visitors: 0,
          };
        }
        const d = dailyMap[t.date];
        d.shopee_gmv += t.shopee_gmv || 0;
        d.shopee_orders += t.shopee_orders || 0;
        d.shopee_visitors += t.shopee_visitors || 0;
        d.tiktok_gmv += t.tiktok_gmv || 0;
        d.tiktok_orders += t.tiktok_orders || 0;
        d.tiktok_visitors += t.tiktok_visitors || 0;
        d.website_gmv += t.website_gmv || 0;
        d.website_orders += t.website_orders || 0;
        d.meta_gmv += t.meta_gmv || 0;
        d.meta_orders += t.meta_orders || 0;
        d.combined_gmv += t.combined_gmv || 0;
        d.combined_orders += t.combined_orders || 0;
        d.combined_visitors += t.combined_visitors || 0;
      }
    }

    if (monthHasData && !includedMonths.has(monthKey)) {
      includedMonths.add(monthKey);

      // Merge products across months
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const p of (monthData.products_consolidated || []) as any[]) {
        if (!productMap[p.name]) {
          productMap[p.name] = {
            name: p.name, status: p.status,
            shopee_gmv: 0, shopee_items_sold: 0,
            tiktok_gmv: 0, tiktok_items_sold: 0,
            website_gmv: 0, website_items_sold: 0,
            combined_gmv: 0, combined_items_sold: 0,
          };
        }
        const m = productMap[p.name];
        m.shopee_gmv += p.shopee_gmv || 0;
        m.shopee_items_sold += p.shopee_items_sold || 0;
        m.tiktok_gmv += p.tiktok_gmv || 0;
        m.tiktok_items_sold += p.tiktok_items_sold || 0;
        m.website_gmv += p.website_gmv || 0;
        m.website_items_sold += p.website_items_sold || 0;
        m.combined_gmv += p.combined_gmv || 0;
        m.combined_items_sold += p.combined_items_sold || 0;
        if (p.status === 'Active') m.status = 'Active';
      }

      allLives.push(...(monthData.lives || []));
      allVideos.push(...(monthData.videos || []));
      allShopeeAffiliate.push(...(monthData.shopee_affiliate || []));

      const rawAds = monthData.ads || {};
      shopeeAdsList.push(...(rawAds.shopee || []));
      tiktokLiveAdsList.push(...(rawAds.tiktok?.live || []));
      tiktokProductAdsList.push(...(rawAds.tiktok?.product || []));
      metaAdsList.push(...(monthData.meta_ads_performance || []));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedDaily = Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
  if (sortedDaily.length === 0) return null;

  // Overview from aggregated daily totals
  const overview: OverviewMetric[] = [];
  if (platform === 'All') {
    const gmv = sortedDaily.reduce((s, t) => s + t.combined_gmv, 0);
    const orders = sortedDaily.reduce((s, t) => s + t.combined_orders, 0);
    const visitors = sortedDaily.reduce((s, t) => s + t.combined_visitors, 0);
    overview.push({ key: 'gmv', label: 'Total Revenue', value: gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Total Orders', value: orders, growth: 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'Total Visitors', value: visitors, growth: 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: visitors > 0 ? orders / visitors : 0, growth: 0, format: 'percent' });
  } else if (platform === 'Shopee') {
    const gmv = sortedDaily.reduce((s, t) => s + t.shopee_gmv, 0);
    const orders = sortedDaily.reduce((s, t) => s + t.shopee_orders, 0);
    const visitors = sortedDaily.reduce((s, t) => s + t.shopee_visitors, 0);
    overview.push({ key: 'gmv', label: 'Shopee Revenue', value: gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Shopee Orders', value: orders, growth: 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'Shopee Visitors', value: visitors, growth: 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: visitors > 0 ? orders / visitors : 0, growth: 0, format: 'percent' });
  } else if (platform === 'TikTok') {
    const gmv = sortedDaily.reduce((s, t) => s + t.tiktok_gmv, 0);
    const orders = sortedDaily.reduce((s, t) => s + t.tiktok_orders, 0);
    const visitors = sortedDaily.reduce((s, t) => s + t.tiktok_visitors, 0);
    overview.push({ key: 'gmv', label: 'TikTok Revenue', value: gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'TikTok Orders', value: orders, growth: 0, format: 'number' });
    overview.push({ key: 'visitors', label: 'TikTok Visitors', value: visitors, growth: 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: visitors > 0 ? orders / visitors : 0, growth: 0, format: 'percent' });
  } else if (platform === 'Meta') {
    const gmv = metaAdsList.reduce((s, x) => s + (x.gmv || 0), 0);
    const orders = metaAdsList.reduce((s, x) => s + (x.orders || 0), 0);
    const clicks = metaAdsList.reduce((s, x) => s + (x.clicks || 0), 0);
    overview.push({ key: 'gmv', label: 'Meta Revenue', value: gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Meta Orders', value: orders, growth: 0, format: 'number' });
    overview.push({ key: 'clicks', label: 'Meta Clicks', value: clicks, growth: 0, format: 'number' });
  } else if (platform === 'Website') {
    const gmv = sortedDaily.reduce((s, t) => s + t.website_gmv, 0);
    const orders = sortedDaily.reduce((s, t) => s + t.website_orders, 0);
    overview.push({ key: 'gmv', label: 'Website Revenue', value: gmv, growth: 0, format: 'currency' });
    overview.push({ key: 'orders', label: 'Website Orders', value: orders, growth: 0, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: 0, growth: 0, format: 'percent' });
  }

  // Daily trends for chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyTrends: DailyTrendPoint[] = sortedDaily.map((t: any) => {
    let gmv = 0, orders = 0, visitors = 0;
    if (platform === 'All') { gmv = t.combined_gmv; orders = t.combined_orders; visitors = t.combined_visitors; }
    else if (platform === 'Shopee') { gmv = t.shopee_gmv; orders = t.shopee_orders; visitors = t.shopee_visitors; }
    else if (platform === 'TikTok') { gmv = t.tiktok_gmv; orders = t.tiktok_orders; visitors = t.tiktok_visitors; }
    else if (platform === 'Meta') { gmv = t.meta_gmv; orders = t.meta_orders; }
    else if (platform === 'Website') { gmv = t.website_gmv; orders = t.website_orders; }
    return { date: t.date, gmv, orders, visitors };
  });

  // Products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: ConsolidatedProduct[] = Object.values(productMap)
    .map((p: any) => {
      let platformGmv = 0, platformItemsSold = 0;
      if (platform === 'All') { platformGmv = p.combined_gmv; platformItemsSold = p.combined_items_sold; }
      else if (platform === 'Shopee') { platformGmv = p.shopee_gmv; platformItemsSold = p.shopee_items_sold; }
      else if (platform === 'TikTok') { platformGmv = p.tiktok_gmv; platformItemsSold = p.tiktok_items_sold; }
      else if (platform === 'Website') { platformGmv = p.website_gmv || 0; platformItemsSold = p.website_items_sold || 0; }
      return {
        name: p.name, status: p.status,
        shopeeGmv: p.shopee_gmv, shopeeItemsSold: p.shopee_items_sold,
        tiktokGmv: p.tiktok_gmv, tiktokItemsSold: p.tiktok_items_sold,
        websiteGmv: p.website_gmv || 0, websiteItemsSold: p.website_items_sold || 0,
        combinedGmv: p.combined_gmv, combinedItemsSold: p.combined_items_sold,
        platformGmv, platformItemsSold,
      };
    })
    .filter((p: ConsolidatedProduct) => p.platformGmv > 0)
    .sort((a: ConsolidatedProduct, b: ConsolidatedProduct) => b.platformGmv - a.platformGmv);

  const lives: LiveSession[] = (platform === 'Shopee' || platform === 'Meta' || platform === 'Website') ? [] : allLives;
  const videos: VideoMetric[] = (platform === 'Shopee' || platform === 'Meta' || platform === 'Website') ? [] : allVideos;

  // Ads summary
  let adsSummary: AdPerformanceSummary = { cost: 0, gmv: 0, orders: 0, roi: 0 };
  if (platform === 'All') {
    const shpCost = shopeeAdsList.reduce((s, a) => s + a.cost, 0);
    const shpGmv = shopeeAdsList.reduce((s, a) => s + a.gmv, 0);
    const shpOrders = shopeeAdsList.reduce((s, a) => s + a.orders, 0);
    const ttsCost = tiktokLiveAdsList.reduce((s, a) => s + a.cost, 0) + tiktokProductAdsList.reduce((s, a) => s + a.cost, 0);
    const ttsGmv = tiktokLiveAdsList.reduce((s, a) => s + a.gmv, 0) + tiktokProductAdsList.reduce((s, a) => s + a.gmv, 0);
    const ttsOrders = tiktokLiveAdsList.reduce((s, a) => s + a.orders, 0) + tiktokProductAdsList.reduce((s, a) => s + a.orders, 0);
    const metaCost = metaAdsList.reduce((s, x) => s + (x.cost || 0), 0);
    const metaGmv = metaAdsList.reduce((s, x) => s + (x.gmv || 0), 0);
    const metaOrders = metaAdsList.reduce((s, x) => s + (x.orders || 0), 0);
    const totalCost = shpCost + ttsCost + metaCost;
    const totalGmv = shpGmv + ttsGmv + metaGmv;
    const totalOrders = shpOrders + ttsOrders + metaOrders;
    adsSummary = { cost: totalCost, gmv: totalGmv, orders: totalOrders, roi: totalCost > 0 ? totalGmv / totalCost : 0 };
  } else if (platform === 'Shopee') {
    const cost = shopeeAdsList.reduce((s, a) => s + a.cost, 0);
    const gmv = shopeeAdsList.reduce((s, a) => s + a.gmv, 0);
    const orders = shopeeAdsList.reduce((s, a) => s + a.orders, 0);
    adsSummary = { cost, gmv, orders, roi: cost > 0 ? gmv / cost : 0 };
  } else if (platform === 'TikTok') {
    const cost = tiktokLiveAdsList.reduce((s, a) => s + a.cost, 0) + tiktokProductAdsList.reduce((s, a) => s + a.cost, 0);
    const gmv = tiktokLiveAdsList.reduce((s, a) => s + a.gmv, 0) + tiktokProductAdsList.reduce((s, a) => s + a.gmv, 0);
    const orders = tiktokLiveAdsList.reduce((s, a) => s + a.orders, 0) + tiktokProductAdsList.reduce((s, a) => s + a.orders, 0);
    adsSummary = { cost, gmv, orders, roi: cost > 0 ? gmv / cost : 0 };
  } else if (platform === 'Meta') {
    const cost = metaAdsList.reduce((s, x) => s + (x.cost || 0), 0);
    const gmv = metaAdsList.reduce((s, x) => s + (x.gmv || 0), 0);
    const orders = metaAdsList.reduce((s, x) => s + (x.orders || 0), 0);
    adsSummary = { cost, gmv, orders, roi: cost > 0 ? gmv / cost : 0 };
  } else if (platform === 'Website') {
    const cost = metaAdsList.reduce((s, x) => s + (x.cost || 0), 0);
    adsSummary = { cost, gmv: 0, orders: 0, roi: 0 };
  }

  const monthName = startDate === endDate ? startDate : `${startDate} — ${endDate}`;
  const shopeeAffiliate: ShopeeAffiliateItem[] = (platform === 'Shopee' || platform === 'All') ? allShopeeAffiliate : [];
  const tiktokAffiliateCreators2: TiktokAffiliateCreator[] = (platform === 'TikTok' || platform === 'All') ? [] : [];

  const metaData2 = { cpas: { cost:0, purchase:0, items:0, roas:0 }, website: { cost:0, purchase:0, items:0, roas:0 }, traffic: { cost:0, reach:0, impressions:0, link_clicks:0, cpm:0, cpr:0 } } as any;

  return {
    monthName,
    overview,
    dailyTrends,
    products,
    lives,
    videos,
    shopeeAffiliate,
    shopeeChannel: undefined,
    tiktokAffiliateCreators: tiktokAffiliateCreators2,
    ads: { summary: adsSummary, shopee: shopeeAdsList, tiktokLive: tiktokLiveAdsList, tiktokProduct: tiktokProductAdsList, meta: metaData2 },
  };
}
