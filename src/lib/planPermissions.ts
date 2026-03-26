/**
 * プランごとの機能権限定義
 *
 * standard: スタンダード（2,980円/月）
 * professional: プロフェッショナル（9,800円/月）
 */

export type PlanKey = "standard" | "professional";

export interface PlanPermissions {
  /** CSVダウンロード月間上限（-1 = 無制限） */
  csvMonthlyLimit: number;
  /** API連携の利用可否 */
  apiAccess: boolean;
  /** カスタムレポートの利用可否 */
  customReport: boolean;
  /** チームアカウントの利用可否 */
  teamAccount: boolean;
  /** チームアカウント上限人数 */
  teamMaxMembers: number;
}

const PERMISSIONS: Record<PlanKey, PlanPermissions> = {
  standard: {
    csvMonthlyLimit: 100,
    apiAccess: false,
    customReport: false,
    teamAccount: false,
    teamMaxMembers: 0,
  },
  professional: {
    csvMonthlyLimit: -1, // 無制限
    apiAccess: true,
    customReport: true,
    teamAccount: true,
    teamMaxMembers: 5,
  },
};

/**
 * プランキーから権限オブジェクトを取得
 * 不明なプランの場合はスタンダードとして扱う
 */
export function getPermissions(plan: string | null | undefined): PlanPermissions {
  if (plan === "professional") return PERMISSIONS.professional;
  return PERMISSIONS.standard;
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
    id: "api" as const,
    label: "API連携",
    description: "外部システムと連携して取引データを自動取得。独自ツールや社内システムとの統合が可能です。",
    icon: "api",
  },
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
