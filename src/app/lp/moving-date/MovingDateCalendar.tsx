'use client'

import { useState, useMemo } from 'react'
import { calcLuckyDays, getTopLuckyDays, type LuckyDay } from '@/lib/fortune/lucky-days'

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const TAG_COLORS: Record<string, string> = {
  '天赦日':     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  '一粒万倍日': 'bg-purple-900/30 text-purple-300 border-purple-700/30',
  '大安':       'bg-green-900/20 text-green-400 border-green-700/30',
  '寅の日':     'bg-orange-900/20 text-orange-400 border-orange-700/30',
  '巳の日':     'bg-emerald-900/20 text-emerald-400 border-emerald-700/30',
  '甲子日':     'bg-blue-900/20 text-blue-400 border-blue-700/30',
  '友引':       'bg-sky-900/20 text-sky-400 border-sky-700/30',
}

// 不成就日の計算（簡易版）
function isFuseiJuJitsu(date: Date): boolean {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const table: Record<number, number[]> = {
    1: [3, 11, 19, 27],
    2: [2, 10, 18, 26],
    3: [1, 9, 17, 25],
    4: [4, 12, 20, 28],
    5: [5, 13, 21, 29],
    6: [2, 10, 18, 26],
    7: [1, 9, 17, 25],
    8: [8, 16, 24],
    9: [7, 15, 23],
    10: [4, 12, 20, 28],
    11: [5, 13, 21, 29],
    12: [2, 10, 18, 26],
  }
  return table[m]?.includes(d) ?? false
}

const MOVING_CHECKLIST = [
  { id: '1', label: '新居の契約・鍵の受け取り', description: '日取りを決めたら早めに手続きを' },
  { id: '2', label: '引っ越し業者の予約', description: '大安等の人気日は予約が埋まりやすいので早めに' },
  { id: '3', label: '不用品の処分・断捨離', description: '荷物を減らして引っ越し費用を節約' },
  { id: '4', label: '住所変更届・転出届', description: '引っ越し2週間前〜当日まで' },
  { id: '5', label: '荷造り・梱包', description: '部屋ごとに荷物をまとめると効率的' },
  { id: '6', label: 'ライフライン（電気・ガス・水道）の手続き', description: '引っ越し1週間前までに' },
  { id: '7', label: '新居の掃除・換気', description: '入居前にしっかり掃除と換気を' },
  { id: '8', label: '引っ越し当日', description: '午前中にスタートするとスムーズ' },
]

export default function MovingDateCalendar() {
  const now = new Date()
  const [selectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(now.getFullYear() === 2026 ? now.getMonth() + 1 : 1)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const todayStr = now.toISOString().split('T')[0]

  const { topDays, gridDays, badDays } = useMemo(() => {
    const days = calcLuckyDays(selectedYear, selectedMonth, todayStr)
    const topDays = getTopLuckyDays(days).filter(d => d.tags.length >= 1)

    const badDays = days.filter(d => {
      const date = new Date(selectedYear, selectedMonth - 1, parseInt(d.date.split('-')[2], 10))
      return d.rokuyou === '仏滅' || isFuseiJuJitsu(date)
    })

    const firstDow = new Date(selectedYear, selectedMonth - 1, 1).getDay()
    const gridDays: (LuckyDay | null)[] = [
      ...Array(firstDow).fill(null),
      ...days,
    ]
    while (gridDays.length % 7 !== 0) gridDays.push(null)

    return { days, topDays, gridDays, badDays }
  }, [selectedYear, selectedMonth, todayStr])

  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-8">
      {/* 月選択 */}
      <div className="flex flex-wrap justify-center gap-2">
        {MONTHS.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              selectedMonth === m
                ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                : 'border-slate-700 text-slate-500 hover:border-slate-500'
            }`}
          >
            {m}月
          </button>
        ))}
      </div>

      {/* カレンダー */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-amber-400 font-bold text-center mb-3">
          {selectedYear}年 {selectedMonth}月
        </h3>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DOW_JA.map((d, i) => (
            <div key={d} className={`text-center text-xs py-1 font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {gridDays.map((day, i) => {
            if (!day) return <div key={i} />
            const dayNum = parseInt(day.date.split('-')[2], 10)
            const date = new Date(selectedYear, selectedMonth - 1, dayNum)
            const isBad = day.rokuyou === '仏滅' || isFuseiJuJitsu(date)
            const isGood = day.tags.length > 0
            const isGoldDay = day.tags.includes('天赦日') || day.tags.includes('甲子日')
            const dow = day.dayOfWeek

            return (
              <div
                key={i}
                className={`text-center p-1 rounded ${
                  day.isToday ? 'ring-1 ring-amber-500' : ''
                } ${
                  isGoldDay ? 'bg-amber-500/10' : isGood ? 'bg-purple-900/10' : isBad ? 'bg-red-900/5' : ''
                }`}
              >
                <p className={`text-xs font-bold ${
                  dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400'
                  : day.isToday ? 'text-amber-400'
                  : isBad && !isGood ? 'text-red-400/60' : 'text-slate-300'
                }`}>
                  {dayNum}
                </p>
                {isGood && (
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                    {day.tags.slice(0, 2).map(t => (
                      <span key={t} className={`text-[8px] px-0.5 rounded border ${TAG_COLORS[t] ?? ''}`}>
                        {t.length > 3 ? t.slice(0, 3) : t}
                      </span>
                    ))}
                  </div>
                )}
                {isBad && !isGood && (
                  <span className="text-[8px] text-red-400/60">
                    {day.rokuyou === '仏滅' ? '仏滅' : '不成就'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-slate-800">
          {['天赦日', '一粒万倍日', '大安', '寅の日', '巳の日'].map(t => (
            <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border ${TAG_COLORS[t]}`}>{t}</span>
          ))}
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-red-900/20 text-red-400 border-red-700/30">仏滅</span>
        </div>
      </div>

      {/* 今月のおすすめ吉日 */}
      {topDays.length > 0 && (
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-6">
          <h3 className="text-amber-400 font-bold text-sm tracking-widest mb-4">
            {selectedMonth}月の引っ越し・契約おすすめ吉日
          </h3>
          <div className="space-y-3">
            {topDays.map(d => {
              const dayNum = parseInt(d.date.split('-')[2], 10)
              return (
                <div key={d.date} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-200 font-bold text-sm">
                      {selectedMonth}月{dayNum}日（{DOW_JA[d.dayOfWeek]}）
                    </span>
                    <span className="text-slate-600 text-xs">{d.pillar.label}・{d.rokuyou}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {d.tags.map(t => (
                      <span key={t} className={`text-xs px-1.5 py-0.5 rounded border ${TAG_COLORS[t] ?? 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 避けるべき日 */}
      {badDays.length > 0 && (
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
          <h3 className="text-red-400 font-bold text-sm mb-3">
            {selectedMonth}月の契約・引っ越しを避けたい日
          </h3>
          <div className="flex flex-wrap gap-2">
            {badDays.slice(0, 8).map(d => {
              const dayNum = parseInt(d.date.split('-')[2], 10)
              const date = new Date(selectedYear, selectedMonth - 1, dayNum)
              const reasons: string[] = []
              if (d.rokuyou === '仏滅') reasons.push('仏滅')
              if (isFuseiJuJitsu(date)) reasons.push('不成就日')
              return (
                <span key={d.date} className="text-xs px-2 py-1 rounded-full bg-red-900/20 text-red-400 border border-red-700/20">
                  {dayNum}日（{reasons.join('・')}）
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="space-y-3">
        <a
          href="#contact-form"
          className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl text-center text-base tracking-wider transition"
        >
          吉日に間に合う物件を探す
        </a>
        <a
          href="/search"
          className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-center text-base tracking-wider transition"
        >
          物件の相場を調べる
        </a>
      </div>

      {/* 引っ越し準備チェックリスト */}
      <div className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-6">
        <h3 className="text-amber-400 font-bold text-sm tracking-widest mb-4">
          引っ越し準備チェックリスト
        </h3>
        <div className="space-y-3">
          {MOVING_CHECKLIST.map(item => (
            <label
              key={item.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={checkedItems.has(item.id)}
                onChange={() => toggleChecklist(item.id)}
                className="accent-amber-500 mt-0.5 w-4 h-4 shrink-0"
              />
              <div>
                <p className={`text-sm font-bold transition-colors ${
                  checkedItems.has(item.id) ? 'text-amber-400 line-through' : 'text-slate-200 group-hover:text-slate-100'
                }`}>
                  {item.label}
                </p>
                <p className="text-slate-500 text-xs">{item.description}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4 h-1.5 bg-slate-800 rounded-full">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${(checkedItems.size / MOVING_CHECKLIST.length) * 100}%` }}
          />
        </div>
        <p className="text-slate-500 text-xs text-center mt-2">
          {checkedItems.size} / {MOVING_CHECKLIST.length} 完了
        </p>
      </div>
    </div>
  )
}
