/** Stripe Price ID マッピング（一元管理） */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  // 月額
  standard: "price_1TEY8xRoGbypKtRLTCar48k2",
  professional: "price_1TF4pnRoGbypKtRL5GKebMrj",
  // 年額
  "standard-yearly": "price_1THO5aRoGbypKtRL2n4GtHkU",
  "professional-yearly": "price_1THO5aRoGbypKtRLA4eTzqyr",
};

export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  name: string;
  price: string;
  yearlyPrice: string;
  unit: string;
  yearlyUnit: string;
  desc: string;
  features: string[];
  limited: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
  /** plan key（standard / professional） */
  key: string;
}

export const plans: Plan[] = [
  {
    name: "フリー",
    price: "0",
    yearlyPrice: "0",
    unit: "円/月",
    yearlyUnit: "円/年",
    desc: "まずは相場をチェック",
    features: [
      "都道府県別の相場サマリー",
      "直近1四半期のデータ閲覧",
      "取引事例 5件まで表示",
      "種別別グラフ",
    ],
    limited: [
      "詳細データ閲覧",
      "CSVダウンロード",
      "トレンド分析",
      "エリア比較",
    ],
    cta: "無料で始める",
    ctaLink: "/search",
    popular: false,
    key: "free",
  },
  {
    name: "スタンダード",
    price: "2,980",
    yearlyPrice: "28,600",
    unit: "円/月",
    yearlyUnit: "円/年",
    desc: "不動産業者・投資家向け",
    features: [
      "全国の詳細取引データ",
      "過去20年分のデータ閲覧",
      "取引事例 無制限表示",
      "種別別グラフ",
      "CSVダウンロード (月100件)",
      "相場トレンド分析",
      "エリア比較レポート",
    ],
    limited: [],
    cta: "14日間無料で試す",
    ctaLink: "/register?plan=standard",
    popular: true,
    key: "standard",
  },
  {
    name: "プロフェッショナル",
    price: "6,800",
    yearlyPrice: "65,280",
    unit: "円/月",
    yearlyUnit: "円/年",
    desc: "法人・大量データ利用向け",
    features: [
      "スタンダードの全機能",
      "CSVダウンロード 無制限",
      "カスタムレポート生成",
      "チームアカウント (5名)",
      "優先サポート",
    ],
    limited: [],
    cta: "14日間無料で試す",
    ctaLink: "/register?plan=professional",
    popular: false,
    key: "professional",
  },
];

/** 年額の月あたり価格を計算 */
export function yearlyMonthlyPrice(yearlyPrice: string): string {
  const num = parseInt(yearlyPrice.replace(/,/g, ""), 10);
  if (num === 0) return "0";
  return Math.round(num / 12).toLocaleString();
}

// 機能比較テーブル用データ
export const featureComparison = [
  { feature: "取引データ閲覧", free: "直近1四半期", standard: "過去20年分", pro: "過去20年分" },
  { feature: "取引事例表示件数", free: "5件", standard: "無制限", pro: "無制限" },
  { feature: "詳細データ（築年数・駅距離等）", free: false, standard: true, pro: true },
  { feature: "種別別グラフ", free: true, standard: true, pro: true },
  { feature: "相場トレンド分析", free: false, standard: true, pro: true },
  { feature: "エリア比較レポート", free: false, standard: true, pro: true },
  { feature: "CSVダウンロード", free: false, standard: "月100件", pro: "無制限" },
  { feature: "API連携", free: false, standard: false, pro: false },
  { feature: "カスタムレポート", free: false, standard: false, pro: true },
  { feature: "チームアカウント", free: false, standard: false, pro: "5名まで" },
  { feature: "サポート", free: "メール", standard: "メール", pro: "優先サポート" },
];
