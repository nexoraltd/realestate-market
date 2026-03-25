export interface PrefectureGeo {
  code: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  avgPrice?: number; // static sample avg for map coloring
}

export const PREFECTURE_GEO: PrefectureGeo[] = [
  { code: "01", name: "北海道", lat: 43.06, lng: 141.35, region: "北海道", avgPrice: 1280 },
  { code: "02", name: "青森県", lat: 40.82, lng: 140.74, region: "東北", avgPrice: 680 },
  { code: "03", name: "岩手県", lat: 39.70, lng: 141.15, region: "東北", avgPrice: 720 },
  { code: "04", name: "宮城県", lat: 38.27, lng: 140.87, region: "東北", avgPrice: 1850 },
  { code: "05", name: "秋田県", lat: 39.72, lng: 140.10, region: "東北", avgPrice: 550 },
  { code: "06", name: "山形県", lat: 38.24, lng: 140.34, region: "東北", avgPrice: 620 },
  { code: "07", name: "福島県", lat: 37.75, lng: 140.47, region: "東北", avgPrice: 780 },
  { code: "08", name: "茨城県", lat: 36.34, lng: 140.45, region: "関東", avgPrice: 1150 },
  { code: "09", name: "栃木県", lat: 36.57, lng: 139.88, region: "関東", avgPrice: 1050 },
  { code: "10", name: "群馬県", lat: 36.39, lng: 139.06, region: "関東", avgPrice: 980 },
  { code: "11", name: "埼玉県", lat: 35.86, lng: 139.65, region: "関東", avgPrice: 3050 },
  { code: "12", name: "千葉県", lat: 35.61, lng: 140.12, region: "関東", avgPrice: 2780 },
  { code: "13", name: "東京都", lat: 35.68, lng: 139.69, region: "関東", avgPrice: 7690 },
  { code: "14", name: "神奈川県", lat: 35.45, lng: 139.64, region: "関東", avgPrice: 4830 },
  { code: "15", name: "新潟県", lat: 37.90, lng: 139.02, region: "中部", avgPrice: 820 },
  { code: "16", name: "富山県", lat: 36.70, lng: 137.21, region: "中部", avgPrice: 950 },
  { code: "17", name: "石川県", lat: 36.59, lng: 136.63, region: "中部", avgPrice: 1120 },
  { code: "18", name: "福井県", lat: 36.07, lng: 136.22, region: "中部", avgPrice: 880 },
  { code: "19", name: "山梨県", lat: 35.66, lng: 138.57, region: "中部", avgPrice: 920 },
  { code: "20", name: "長野県", lat: 36.23, lng: 138.18, region: "中部", avgPrice: 1080 },
  { code: "21", name: "岐阜県", lat: 35.39, lng: 136.72, region: "中部", avgPrice: 1020 },
  { code: "22", name: "静岡県", lat: 34.98, lng: 138.38, region: "中部", avgPrice: 1560 },
  { code: "23", name: "愛知県", lat: 35.18, lng: 136.91, region: "中部", avgPrice: 3120 },
  { code: "24", name: "三重県", lat: 34.73, lng: 136.51, region: "近畿", avgPrice: 1080 },
  { code: "25", name: "滋賀県", lat: 35.00, lng: 135.87, region: "近畿", avgPrice: 1420 },
  { code: "26", name: "京都府", lat: 35.02, lng: 135.76, region: "近畿", avgPrice: 3560 },
  { code: "27", name: "大阪府", lat: 34.69, lng: 135.52, region: "近畿", avgPrice: 3245 },
  { code: "28", name: "兵庫県", lat: 34.69, lng: 135.18, region: "近畿", avgPrice: 2380 },
  { code: "29", name: "奈良県", lat: 34.69, lng: 135.83, region: "近畿", avgPrice: 1580 },
  { code: "30", name: "和歌山県", lat: 34.23, lng: 135.17, region: "近畿", avgPrice: 780 },
  { code: "31", name: "鳥取県", lat: 35.50, lng: 134.24, region: "中国", avgPrice: 650 },
  { code: "32", name: "島根県", lat: 35.47, lng: 133.05, region: "中国", avgPrice: 620 },
  { code: "33", name: "岡山県", lat: 34.66, lng: 133.93, region: "中国", avgPrice: 1250 },
  { code: "34", name: "広島県", lat: 34.40, lng: 132.46, region: "中国", avgPrice: 1680 },
  { code: "35", name: "山口県", lat: 34.19, lng: 131.47, region: "中国", avgPrice: 850 },
  { code: "36", name: "徳島県", lat: 34.07, lng: 134.56, region: "四国", avgPrice: 720 },
  { code: "37", name: "香川県", lat: 34.34, lng: 134.04, region: "四国", avgPrice: 980 },
  { code: "38", name: "愛媛県", lat: 33.84, lng: 132.77, region: "四国", avgPrice: 880 },
  { code: "39", name: "高知県", lat: 33.56, lng: 133.53, region: "四国", avgPrice: 1660 },
  { code: "40", name: "福岡県", lat: 33.59, lng: 130.42, region: "九州", avgPrice: 2890 },
  { code: "41", name: "佐賀県", lat: 33.25, lng: 130.30, region: "九州", avgPrice: 820 },
  { code: "42", name: "長崎県", lat: 32.74, lng: 129.87, region: "九州", avgPrice: 920 },
  { code: "43", name: "熊本県", lat: 32.79, lng: 130.74, region: "九州", avgPrice: 1350 },
  { code: "44", name: "大分県", lat: 33.24, lng: 131.61, region: "九州", avgPrice: 980 },
  { code: "45", name: "宮崎県", lat: 31.91, lng: 131.42, region: "九州", avgPrice: 750 },
  { code: "46", name: "鹿児島県", lat: 31.56, lng: 130.56, region: "九州", avgPrice: 1020 },
  { code: "47", name: "沖縄県", lat: 26.34, lng: 127.80, region: "沖縄", avgPrice: 2150 },
];

// Price color scale (万円)
export function getPriceColor(avgPrice: number): string {
  if (avgPrice >= 5000) return "#dc2626"; // red - very high
  if (avgPrice >= 3000) return "#ea580c"; // orange - high
  if (avgPrice >= 2000) return "#d97706"; // amber - above avg
  if (avgPrice >= 1500) return "#ca8a04"; // yellow - avg+
  if (avgPrice >= 1000) return "#65a30d"; // lime - average
  if (avgPrice >= 700) return "#16a34a";  // green - below avg
  return "#0d9488";                        // teal - low
}

export function getPriceLevel(avgPrice: number): string {
  if (avgPrice >= 5000) return "非常に高い";
  if (avgPrice >= 3000) return "高い";
  if (avgPrice >= 2000) return "やや高い";
  if (avgPrice >= 1500) return "平均的";
  if (avgPrice >= 1000) return "やや低い";
  if (avgPrice >= 700) return "低い";
  return "非常に低い";
}

export const REGIONS = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州", "沖縄"] as const;
