"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REGIONS: {
  name: string;
  prefs: { code: string; name: string; x: number; y: number; w: number; h: number }[];
}[] = [
  {
    name: "北海道・東北",
    prefs: [
      { code: "01", name: "北海道", x: 340, y: 10, w: 110, h: 80 },
      { code: "02", name: "青森", x: 370, y: 100, w: 50, h: 30 },
      { code: "03", name: "岩手", x: 380, y: 130, w: 50, h: 35 },
      { code: "04", name: "宮城", x: 375, y: 165, w: 45, h: 28 },
      { code: "05", name: "秋田", x: 340, y: 130, w: 40, h: 35 },
      { code: "06", name: "山形", x: 345, y: 165, w: 35, h: 30 },
      { code: "07", name: "福島", x: 345, y: 195, w: 55, h: 30 },
    ],
  },
  {
    name: "関東",
    prefs: [
      { code: "08", name: "茨城", x: 365, y: 225, w: 40, h: 30 },
      { code: "09", name: "栃木", x: 345, y: 215, w: 35, h: 28 },
      { code: "10", name: "群馬", x: 315, y: 210, w: 35, h: 28 },
      { code: "11", name: "埼玉", x: 335, y: 243, w: 35, h: 22 },
      { code: "12", name: "千葉", x: 370, y: 250, w: 35, h: 30 },
      { code: "13", name: "東京", x: 345, y: 265, w: 30, h: 20 },
      { code: "14", name: "神奈川", x: 340, y: 280, w: 35, h: 20 },
    ],
  },
  {
    name: "中部",
    prefs: [
      { code: "15", name: "新潟", x: 300, y: 150, w: 50, h: 50 },
      { code: "16", name: "富山", x: 265, y: 195, w: 35, h: 25 },
      { code: "17", name: "石川", x: 245, y: 185, w: 30, h: 35 },
      { code: "18", name: "福井", x: 235, y: 220, w: 30, h: 30 },
      { code: "19", name: "山梨", x: 310, y: 255, w: 30, h: 25 },
      { code: "20", name: "長野", x: 290, y: 220, w: 35, h: 40 },
      { code: "21", name: "岐阜", x: 260, y: 225, w: 35, h: 30 },
      { code: "22", name: "静岡", x: 290, y: 275, w: 50, h: 25 },
      { code: "23", name: "愛知", x: 265, y: 260, w: 35, h: 28 },
    ],
  },
  {
    name: "近畿",
    prefs: [
      { code: "24", name: "三重", x: 248, y: 270, w: 28, h: 40 },
      { code: "25", name: "滋賀", x: 235, y: 235, w: 25, h: 30 },
      { code: "26", name: "京都", x: 215, y: 220, w: 30, h: 35 },
      { code: "27", name: "大阪", x: 215, y: 260, w: 25, h: 25 },
      { code: "28", name: "兵庫", x: 190, y: 235, w: 30, h: 35 },
      { code: "29", name: "奈良", x: 225, y: 265, w: 25, h: 28 },
      { code: "30", name: "和歌山", x: 210, y: 290, w: 35, h: 28 },
    ],
  },
  {
    name: "中国",
    prefs: [
      { code: "31", name: "鳥取", x: 180, y: 215, w: 30, h: 22 },
      { code: "32", name: "島根", x: 145, y: 215, w: 38, h: 22 },
      { code: "33", name: "岡山", x: 170, y: 240, w: 30, h: 25 },
      { code: "34", name: "広島", x: 135, y: 240, w: 38, h: 25 },
      { code: "35", name: "山口", x: 100, y: 240, w: 38, h: 28 },
    ],
  },
  {
    name: "四国",
    prefs: [
      { code: "36", name: "徳島", x: 185, y: 278, w: 28, h: 22 },
      { code: "37", name: "香川", x: 175, y: 262, w: 28, h: 18 },
      { code: "38", name: "愛媛", x: 140, y: 272, w: 38, h: 25 },
      { code: "39", name: "高知", x: 145, y: 295, w: 45, h: 22 },
    ],
  },
  {
    name: "九州・沖縄",
    prefs: [
      { code: "40", name: "福岡", x: 85, y: 268, w: 32, h: 25 },
      { code: "41", name: "佐賀", x: 65, y: 275, w: 25, h: 20 },
      { code: "42", name: "長崎", x: 40, y: 280, w: 30, h: 28 },
      { code: "43", name: "熊本", x: 70, y: 300, w: 32, h: 30 },
      { code: "44", name: "大分", x: 102, y: 285, w: 30, h: 25 },
      { code: "45", name: "宮崎", x: 100, y: 310, w: 28, h: 30 },
      { code: "46", name: "鹿児島", x: 65, y: 330, w: 40, h: 35 },
      { code: "47", name: "沖縄", x: 15, y: 380, w: 40, h: 30 },
    ],
  },
];

export default function JapanMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  const handleClick = (code: string) => {
    const currentYear = new Date().getFullYear() - 1;
    router.push(`/search?area=${code}&year=${currentYear}&quarter=1`);
  };

  return (
    <div className="relative">
      <svg viewBox="0 0 480 430" className="w-full max-w-2xl mx-auto">
        {REGIONS.map((region) =>
          region.prefs.map((pref) => (
            <g
              key={pref.code}
              onMouseEnter={(e) => {
                setHovered(pref.code);
                const rect = (e.target as SVGElement).getBoundingClientRect();
                setTooltip({ name: pref.name, x: rect.x + rect.width / 2, y: rect.y });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltip(null);
              }}
              onClick={() => handleClick(pref.code)}
              className="cursor-pointer"
            >
              <rect
                x={pref.x}
                y={pref.y}
                width={pref.w}
                height={pref.h}
                rx={4}
                fill={hovered === pref.code ? "#ed8936" : "#2b6cb0"}
                stroke="#ffffff"
                strokeWidth={1.5}
                className="transition-all duration-200"
                opacity={hovered === pref.code ? 1 : 0.85}
              />
              <text
                x={pref.x + pref.w / 2}
                y={pref.y + pref.h / 2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={pref.name.length > 3 ? 9 : 11}
                fontWeight="600"
                pointerEvents="none"
              >
                {pref.name}
              </text>
            </g>
          ))
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.name}の相場を見る
        </div>
      )}

      {/* Region Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {REGIONS.map((r) => (
          <span key={r.name} className="text-xs text-gray-500">
            {r.name}
          </span>
        ))}
      </div>
    </div>
  );
}
