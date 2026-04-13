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
    unit: "円",
    yearlyUnit: "円",
    desc: "まずはAI査定を体験",
    features: [
      "AI査定 月1回（10年予測+スコア内訳付き）",
      "相場検索 月3回",
      "取引事例 5件まで表示",
    ],
    limited: [
      "無制限のAI査定",
      "無制限の相場検索",
      "CSVダウンロード",
      "トレンド分析",
    ],
    cta: "無料で登録する",
    ctaLink: "/register?plan=free",
    popular: false,
    key: "free",
  },
  {
    name: "スタンダード",
    price: "2,980",
    yearlyPrice: "28,600",
    unit: "円/月",
    yearlyUnit: "円/年",
    desc: "売買判断をデータで確信に",
    features: [
      "AI査定 無制限",
      "将来価格予測 10年後まで",
      "資産性スコア 5因子内訳",
      "相場検索 無制限",
      "取引事例 20件まで表示",
      "2年分トレンド分析",
      "CSVダウンロード (月100件)",
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
    desc: "プロ・法人向けフル機能",
    features: [
      "将来価格予測 10年後まで + 改善提案",
      "取引事例 無制限表示",
      "20年分トレンド分析",
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
  { feature: "AI推定価格", free: true, standard: true, pro: true },
  { feature: "AI査定", free: "月1回", standard: "無制限", pro: "無制限" },
  { feature: "将来価格予測", free: "10年後（月1回）", standard: "10年後", pro: "10年後+改善提案" },
  { feature: "資産性スコア", free: "5因子（月1回）", standard: "5因子内訳", pro: "5因子+改善提案" },
  { feature: "相場検索", free: "月3回", standard: "無制限", pro: "無制限" },
  { feature: "トレンド分析", free: false, standard: "2年分", pro: "20年分" },
  { feature: "CSVダウンロード", free: false, standard: "月100件", pro: "無制限" },
  { feature: "エリア比較レポート", free: false, standard: true, pro: true },
  { feature: "カスタムレポート", free: false, standard: false, pro: true },
  { feature: "チームアカウント", free: false, standard: false, pro: "5名まで" },
  { feature: "サポート", free: "メール", standard: "メール", pro: "優先サポート" },
];
