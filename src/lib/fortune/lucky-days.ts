/**
 * 吉日カレンダー
 * 一粒万倍日・天赦日・大安・寅の日・巳の日・甲子日などを計算
 */

import { getDayPillar, type Pillar } from './bazi'

// 六曜
const ROKK_YO = ['先勝', '友引', '先負', '仏滅', '大安', '赤口'] as const
type Rokuyou = typeof ROKK_YO[number]

function getRokuyo(date: Date): Rokuyou {
  const epoch = new Date('2000-01-07').getTime()
  const days = Math.floor((date.getTime() - epoch) / 86400000)
  const idx = ((days % 6) + 6) % 6
  return ROKK_YO[idx]
}

// 一粒万倍日
const ICHIRYUU_TABLE: Record<string, string[]> = {
  子: ['丑', '卯'], 丑: ['寅', '午'], 寅: ['卯', '巳'],
  卯: ['寅', '辰'], 辰: ['卯', '巳'], 巳: ['辰', '午'],
  午: ['巳', '未'], 未: ['午', '申'], 申: ['未', '酉'],
  酉: ['申', '戌'], 戌: ['酉', '亥'], 亥: ['戌', '子'],
}

function isIchiryuu(dayBranch: string, monthBranch: string): boolean {
  return ICHIRYUU_TABLE[monthBranch]?.includes(dayBranch) ?? false
}

// 天赦日
function isTensha(pillar: Pillar): boolean {
  return ['戊寅', '甲午', '戊申', '甲子'].includes(pillar.label)
}

function isTigerDay(branch: string): boolean { return branch === '寅' }
function isSnakeDay(branch: string): boolean { return branch === '巳' }
function isKoushi(pillar: Pillar): boolean { return pillar.label === '甲子' }

const MONTH_BRANCH: Record<number, string> = {
  1:'寅', 2:'卯', 3:'辰', 4:'巳', 5:'午', 6:'未',
  7:'申', 8:'酉', 9:'戌', 10:'亥', 11:'子', 12:'丑',
}

export interface LuckyDay {
  date:      string
  dayOfWeek: number
  pillar:    Pillar
  rokuyou:   Rokuyou
  tags:      string[]
  score:     number
  isToday:   boolean
}

export function calcLuckyDays(year: number, month: number, todayStr: string): LuckyDay[] {
  const days: LuckyDay[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthBranch = MONTH_BRANCH[month] ?? '寅'

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d)
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const pillar  = getDayPillar(date)
    const rokuyou = getRokuyo(date)

    const tags: string[] = []
    if (rokuyou === '大安') tags.push('大安')
    if (isTensha(pillar)) tags.push('天赦日')
    if (isIchiryuu(pillar.branch, monthBranch)) tags.push('一粒万倍日')
    if (isTigerDay(pillar.branch)) tags.push('寅の日')
    if (isSnakeDay(pillar.branch)) tags.push('巳の日')
    if (isKoushi(pillar)) tags.push('甲子日')
    if (rokuyou === '友引') tags.push('友引')

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

export function getTopLuckyDays(days: LuckyDay[]): LuckyDay[] {
  return [...days]
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, 5)
}
