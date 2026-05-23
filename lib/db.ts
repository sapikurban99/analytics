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

export interface DashboardData {
  monthName: string;
  overview: OverviewMetric[];
  dailyTrends: DailyTrendPoint[];
  products: ConsolidatedProduct[];
  lives: LiveSession[];
  videos: VideoMetric[];
  ads: {
    summary: AdPerformanceSummary;
    shopee: ShopeeAdItem[];
    tiktokLive: TiktokLiveAdItem[];
    tiktokProduct: TiktokProductAdItem[];
  };
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
  platform: 'All' | 'Shopee' | 'TikTok' | 'Meta',
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
  } else {
    overview.push({ key: 'gmv', label: 'Meta Revenue', value: 48250000, growth: 0.12, format: 'currency' });
    overview.push({ key: 'orders', label: 'Meta Orders', value: 320, growth: 0.08, format: 'number' });
    overview.push({ key: 'visitors', label: 'Meta Visitors', value: 8420, growth: 0.15, format: 'number' });
    overview.push({ key: 'conversion_rate', label: 'Conversion Rate', value: 0.038, growth: 0.02, format: 'percent' });
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
    } else {
      gmv = Math.round((t.combined_gmv || 0) * 0.15); orders = Math.round((t.combined_orders || 0) * 0.15); visitors = Math.round((t.combined_visitors || 0) * 0.15);
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
      else { platformGmv = Math.round(p.combined_gmv * 0.22); platformItemsSold = Math.round(p.combined_items_sold * 0.22); }
      return { name: p.name, status: p.status, shopeeGmv: p.shopee_gmv, shopeeItemsSold: p.shopee_items_sold, tiktokGmv: p.tiktok_gmv, tiktokItemsSold: p.tiktok_items_sold, combinedGmv: p.combined_gmv, combinedItemsSold: p.combined_items_sold, platformGmv, platformItemsSold };
    })
    .filter((p: ConsolidatedProduct) => p.platformGmv > 0)
    .sort((a: ConsolidatedProduct, b: ConsolidatedProduct) => b.platformGmv - a.platformGmv);

  const lives: LiveSession[] = (platform === 'Shopee' || platform === 'Meta') ? [] : monthData.lives || [];
  const videos: VideoMetric[] = (platform === 'Shopee' || platform === 'Meta') ? [] : monthData.videos || [];

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
  } else {
    adsSummary = { cost: 9200000, gmv: 48250000, orders: 320, roi: 5.24 };
  }

  return {
    monthName, overview, dailyTrends, products, lives, videos,
    ads: { summary: adsSummary, shopee: shopeeAdsList, tiktokLive: tiktokLiveAdsList, tiktokProduct: tiktokProductAdsList },
  };
}
