/**
 * プランごとの機能権限定義
 *
 * standard: スタンダード（2,980円/月）
 * professional: プロフェッショナル（6,800円/月）
 */

export type PlanKey = "standard" | "professional";

export interface PlanPermissions {
  /** CSVダウンロード月間上限（-1 = 無制限） */
  csvMonthlyLimit: number;
  /** カスタムレポートの利用可否 */
  customReport: boolean;
  /** チームアカウントの利用可否 */
  teamAccount: boolean;
  /** チームアカウント上限人数 */
  teamMaxMembers: number;
  /** トレンド分析の利用可否 */
  trendAccess: boolean;
  /** トレンド分析の取得年数 */
  trendYears: number;
  /** 取引データの取得可能年数（直近N年） */
  dataYears: number;
}

const PERMISSIONS: Record<PlanKey, PlanPermissions> = {
  standard: {
    csvMonthlyLimit: 100,
    customReport: false,
    teamAccount: false,
    teamMaxMembers: 0,
    trendAccess: true,
    trendYears: 2,
    dataYears: 5,
  },
  professional: {
    csvMonthlyLimit: -1, // 無制限
    customReport: true,
    teamAccount: true,
    teamMaxMembers: 5,
    trendAccess: true,
    trendYears: 20,
    dataYears: 20,
  },
};

/**
 * プランキーから権限オブジェクトを取得
 * "professional" / "professional-yearly" → プロフェッショナル
 * それ以外 → スタンダード
 */
export function getPermissions(plan: string | null | undefined): PlanPermissions {
  if (plan?.startsWith("professional")) return PERMISSIONS.professional;
  return PERMISSIONS.standard;
}

/**
 * プランキーからベースプラン名を抽出（"standard-yearly" → "standard"）
 */
export function basePlanKey(plan: string | null | undefined): PlanKey {
  if (plan?.startsWith("professional")) return "professional";
  return "standard";
}

/**
 * CSV残りダウンロード数を計算
 * @returns 残り件数（-1 = 無制限）
 */
export function csvRemainingDownloads(
  plan: string | null | undefined,
  usedCount: number
): number {
  const perms = getPermissions(plan);
  if (perms.csvMonthlyLimit === -1) return -1;
  return Math.max(0, perms.csvMonthlyLimit - usedCount);
}

/**
 * プロ限定機能の一覧（ダッシュボード表示用）
 */
export const PRO_ONLY_FEATURES = [
  {
    id: "customReport" as const,
    label: "カスタムレポート",
    description: "分析条件を自由に組み合わせて、オリジナルのレポートを生成できます。",
    icon: "report",
  },
  {
    id: "team" as const,
    label: "チームアカウント",
    description: "最大5名までのチームメンバーを招待し、データを共有できます。",
    icon: "team",
  },
];
