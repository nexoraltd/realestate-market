/**
 * 吉日カレンダー
 * lunar-typescript を使った正確な旧暦変換による計算
 * 星詠み占い（ai-fortune-app）と同じロジックを使用
 *
 * 修正ポイント（旧実装からの変更）:
 *  1. 六曜: エポックベース → 旧暦(月+日)の正確な計算
 *  2. 一粒万倍日: 固定月支テーブル → 二十四節気ベースの正確な計算
 *  3. 天赦日: 干支ラベルのみ → 月支チェックを追加（4倍バグ修正）
 */

import { Solar } from 'lunar-typescript'
import { getDayPillar, type Pillar } from './bazi'

// ── 六曜 ─────────────────────────────────────────────────────────
const ROKK_YO = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'] as const
type Rokuyou = typeof ROKK_YO[number]

function getRokuyo(lunarMonth: number, lunarDay: number): Rokuyou {
  return ROKK_YO[(lunarMonth + lunarDay) % 6] as Rokuyou
}

// ── 一粒万倍日（二十四節気ベース）────────────────────────────────
// 節気が変わるごとに対象日支が切り替わる
// 出典: 星詠みの館 lucky-days.ts（lunar-typescript実装）
const ICHIRYUU_RULES: Record<string, string[]> = {
  // 大雪〜小寒前: 亥・子
  'DA_XUE': ['亥', '子'], '大雪': ['亥', '子'],
  // 小寒〜立春前: 子・卯
  '小寒': ['子', '卯'], 'XIAO_HAN': ['子', '卯'],
  // 立春〜啓蟄前: 丑・午
  '立春': ['丑', '午'], 'LI_CHUN': ['丑', '午'],
  // 啓蟄〜清明前: 寅・酉
  '惊蛰': ['寅', '酉'], 'JING_ZHE': ['寅', '酉'],
  // 清明〜立夏前: 子・卯
  '清明': ['子', '卯'],
  // 立夏〜芒種前: 卯・辰
  '立夏': ['卯', '辰'],
  // 芒種〜小暑前: 巳・午
  '芒种': ['巳', '午'],
  // 小暑〜大暑前: 未・申
  '小暑': ['未', '申'],
  // 大暑〜立秋前: 酉・戌
  '大暑': ['酉', '戌'],
  // 立秋〜白露前: 子・卯
  '立秋': ['子', '卯'],
  // 白露〜秋分前: 酉・午
  '白露': ['酉', '午'],
  // 秋分〜霜降前: 酉・戌
  '秋分': ['酉', '戌'],
  // 霜降〜立冬前: 亥・子
  '霜降': ['亥', '子'],
  // 立冬〜大雪前: 子・卯
  '立冬': ['子', '卯'],
}

// 節気テーブルをキャッシュ（月ごとに使い回す）
let cachedJieqiKey = ''
let cachedSorted: { key: string; ts: number }[] = []

function getSortedJieqi(year: number, month: number) {
  const cacheKey = `${year}-${month}`
  if (cachedJieqiKey === cacheKey) return cachedSorted

  const lunar = Solar.fromYmd(year, month, 15).getLunar()
  const jqTable = lunar.getJieQiTable()
  cachedSorted = Object.entries(jqTable)
    .map(([key, s]) => ({
      key,
      ts: Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay()),
    }))
    .sort((a, b) => a.ts - b.ts)
  cachedJieqiKey = cacheKey
  return cachedSorted
}

function getIchiryuuBranches(dateTs: number, sortedJieqi: { key: string; ts: number }[]): string[] {
  let lastRule: string[] = []
  for (const entry of sortedJieqi) {
    if (entry.ts > dateTs) break
    if (entry.key in ICHIRYUU_RULES) {
      lastRule = ICHIRYUU_RULES[entry.key]
    }
  }
  return lastRule
}

// ── 天赦日（月支チェックあり）────────────────────────────────────
// 春(寅卯辰月): 戊寅, 夏(巳午未月): 甲午
// 秋(申酉戌月): 戊申, 冬(亥子丑月): 甲子
const TENSHA_MAP: Record<string, string[]> = {
  '戊寅': ['寅', '卯', '辰'],
  '甲午': ['巳', '午', '未'],
  '戊申': ['申', '酉', '戌'],
  '甲子': ['亥', '子', '丑'],
}

// ── LuckyDay インターフェース ─────────────────────────────────────
export interface LuckyDay {
  date:      string    // YYYY-MM-DD
  dayOfWeek: number   // 0=日〜6=土
  pillar:    Pillar
  rokuyou:   Rokuyou
  tags:      string[] // ['天赦日', '一粒万倍日', '大安', '寅の日' ...]
  score:     number   // 吉日スコア 1-5
  isToday:   boolean
}

// ── メイン: 月の吉日リストを計算 ─────────────────────────────────
export function calcLuckyDays(year: number, month: number, todayStr: string): LuckyDay[] {
  const days: LuckyDay[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  const sortedJieqi = getSortedJieqi(year, month)

  for (let d = 1; d <= daysInMonth; d++) {
    const solar   = Solar.fromYmd(year, month, d)
    const lunar   = solar.getLunar()
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const dateTs  = Date.UTC(year, month - 1, d)

    const lunarMonth = lunar.getMonth()
    const lunarDay   = lunar.getDay()
    const monthZhi   = lunar.getMonthZhi()
    const dayZhi     = lunar.getDayZhi()
    const dayGanZhi  = lunar.getDayInGanZhi()
    const rokuyou    = getRokuyo(lunarMonth, lunarDay)

    const ichiryuuBranches = getIchiryuuBranches(dateTs, sortedJieqi)

    // bazi.ts の getDayPillar は引き続き使用（四柱推命日柱）
    const date   = new Date(year, month - 1, d)
    const pillar = getDayPillar(date)

    const tags: string[] = []
    if (rokuyou === '大安')                          tags.push('大安')
    if (TENSHA_MAP[dayGanZhi]?.includes(monthZhi))  tags.push('天赦日')  // 月支チェックあり
    if (ichiryuuBranches.includes(dayZhi))           tags.push('一粒万倍日')
    if (dayZhi === '寅')                             tags.push('寅の日')
    if (dayZhi === '巳')                             tags.push('巳の日')
    if (dayGanZhi === '甲子')                        tags.push('甲子日')
    if (rokuyou === '友引')                          tags.push('友引')

    const score = Math.min(5, Math.max(1, Math.floor(tags.length * 1.5) + 1))

    days.push({
      date: dateStr,
      dayOfWeek: date.getDay(),
      pillar,
      rokuyou,
      tags,
      score,
      isToday: dateStr === todayStr,
    })
  }

  return days
}

// 最強吉日トップ5
export function getTopLuckyDays(days: LuckyDay[]): LuckyDay[] {
  return [...days]
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, 5)
}
