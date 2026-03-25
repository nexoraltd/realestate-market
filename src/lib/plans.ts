export interface Plan {
  name: string;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  limited: string[];
  cta: string;
  ctaLink: string;
  popular: boolean;
}

export const plans: Plan[] = [
  {
    name: "フリー",
    price: "0",
    unit: "円/月",
    desc: "まずは相場をチェック",
    features: [
      "都道府県別の相場サマリー",
      "直近1四半期のデータ閲覧",
      "取引事例 20件まで表示",
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
  },
  {
    name: "スタンダード",
    price: "2,980",
    unit: "円/月",
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
  },
  {
    name: "プロフェッショナル",
    price: "9,800",
    unit: "円/月",
    desc: "法人・大量データ利用向け",
    features: [
      "スタンダードの全機能",
      "CSVダウンロード 無制限",
      "API連携",
      "カスタムレポート生成",
      "チームアカウント (5名)",
      "優先サポート",
    ],
    limited: [],
    cta: "14日間無料で試す",
    ctaLink: "/register?plan=professional",
    popular: false,
  },
];

// 機能比較テーブル用データ
export const featureComparison = [
  { feature: "取引データ閲覧", free: "直近1四半期", standard: "過去20年分", pro: "過去20年分" },
  { feature: "取引事例表示件数", free: "20件", standard: "無制限", pro: "無制限" },
  { feature: "詳細データ（築年数・駅距離等）", free: false, standard: true, pro: true },
  { feature: "種別別グラフ", free: true, standard: true, pro: true },
  { feature: "相場トレンド分析", free: false, standard: true, pro: true },
  { feature: "エリア比較レポート", free: false, standard: true, pro: true },
  { feature: "CSVダウンロード", free: false, standard: "月100件", pro: "無制限" },
  { feature: "API連携", free: false, standard: false, pro: true },
  { feature: "カスタムレポート", free: false, standard: false, pro: true },
  { feature: "チームアカウント", free: false, standard: false, pro: "5名まで" },
  { feature: "サポート", free: "メール", standard: "メール", pro: "優先サポート" },
];
