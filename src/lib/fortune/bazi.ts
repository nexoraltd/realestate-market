/**
 * 四柱推命 日柱計算（吉日カレンダー用の最小実装）
 */

export const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
export const BRANCHES= ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
export type Stem   = typeof STEMS[number]
export type Branch = typeof BRANCHES[number]

export interface Pillar { stem: Stem; branch: Branch; label: string }

function makePillar(stemIdx: number, branchIdx: number): Pillar {
  const s = STEMS[((stemIdx % 10) + 10) % 10]
  const b = BRANCHES[((branchIdx % 12) + 12) % 12]
  return { stem: s, branch: b, label: `${s}${b}` }
}

// 1900/1/1 = 甲子（stem=0, branch=0）を基準
const BASE_DATE = new Date(Date.UTC(1900, 0, 1))

export function getDayPillar(localDate: Date): Pillar {
  const utc = Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())
  const diff = Math.round((utc - BASE_DATE.getTime()) / 86_400_000)
  const si = ((diff % 10) + 10) % 10
  const bi = ((diff % 12) + 12) % 12
  return makePillar(si, bi)
}
