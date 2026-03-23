"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPriceColor, getPriceLevel } from "@/lib/prefecture-geo";

// 首都圏の主要市区町村データ
const KANTO_CITIES = [
  // 東京23区
  { code: "13101", name: "千代田区", pref: "13", lat: 35.694, lng: 139.754, avgPrice: 12500 },
  { code: "13102", name: "中央区", pref: "13", lat: 35.671, lng: 139.774, avgPrice: 11800 },
  { code: "13103", name: "港区", pref: "13", lat: 35.658, lng: 139.751, avgPrice: 14200 },
  { code: "13104", name: "新宿区", pref: "13", lat: 35.694, lng: 139.703, avgPrice: 8900 },
  { code: "13105", name: "文京区", pref: "13", lat: 35.708, lng: 139.752, avgPrice: 8500 },
  { code: "13106", name: "台東区", pref: "13", lat: 35.712, lng: 139.780, avgPrice: 6800 },
  { code: "13107", name: "墨田区", pref: "13", lat: 35.711, lng: 139.801, avgPrice: 5800 },
  { code: "13108", name: "江東区", pref: "13", lat: 35.673, lng: 139.817, avgPrice: 6200 },
  { code: "13109", name: "品川区", pref: "13", lat: 35.609, lng: 139.730, avgPrice: 8200 },
  { code: "13110", name: "目黒区", pref: "13", lat: 35.634, lng: 139.698, avgPrice: 9800 },
  { code: "13111", name: "大田区", pref: "13", lat: 35.561, lng: 139.716, avgPrice: 6500 },
  { code: "13112", name: "世田谷区", pref: "13", lat: 35.646, lng: 139.653, avgPrice: 8600 },
  { code: "13113", name: "渋谷区", pref: "13", lat: 35.664, lng: 139.698, avgPrice: 12000 },
  { code: "13114", name: "中野区", pref: "13", lat: 35.708, lng: 139.664, avgPrice: 6800 },
  { code: "13115", name: "杉並区", pref: "13", lat: 35.700, lng: 139.636, avgPrice: 7200 },
  { code: "13116", name: "豊島区", pref: "13", lat: 35.726, lng: 139.717, avgPrice: 7500 },
  { code: "13117", name: "北区", pref: "13", lat: 35.753, lng: 139.737, avgPrice: 5600 },
  { code: "13118", name: "荒川区", pref: "13", lat: 35.736, lng: 139.783, avgPrice: 5200 },
  { code: "13119", name: "板橋区", pref: "13", lat: 35.751, lng: 139.709, avgPrice: 5400 },
  { code: "13120", name: "練馬区", pref: "13", lat: 35.735, lng: 139.652, avgPrice: 5500 },
  { code: "13121", name: "足立区", pref: "13", lat: 35.775, lng: 139.805, avgPrice: 3800 },
  { code: "13122", name: "葛飾区", pref: "13", lat: 35.744, lng: 139.847, avgPrice: 3900 },
  { code: "13123", name: "江戸川区", pref: "13", lat: 35.707, lng: 139.868, avgPrice: 4100 },
  // 東京市部
  { code: "13201", name: "八王子市", pref: "13", lat: 35.666, lng: 139.316, avgPrice: 2800 },
  { code: "13202", name: "立川市", pref: "13", lat: 35.714, lng: 139.408, avgPrice: 3800 },
  { code: "13203", name: "武蔵野市", pref: "13", lat: 35.717, lng: 139.566, avgPrice: 7800 },
  { code: "13204", name: "三鷹市", pref: "13", lat: 35.683, lng: 139.560, avgPrice: 6500 },
  { code: "13210", name: "町田市", pref: "13", lat: 35.549, lng: 139.438, avgPrice: 3200 },
  { code: "13211", name: "調布市", pref: "13", lat: 35.652, lng: 139.541, avgPrice: 5200 },
  // 神奈川
  { code: "14101", name: "横浜市西区", pref: "14", lat: 35.452, lng: 139.622, avgPrice: 6800 },
  { code: "14102", name: "横浜市中区", pref: "14", lat: 35.438, lng: 139.642, avgPrice: 5500 },
  { code: "14104", name: "横浜市港北区", pref: "14", lat: 35.531, lng: 139.633, avgPrice: 5200 },
  { code: "14105", name: "横浜市青葉区", pref: "14", lat: 35.568, lng: 139.518, avgPrice: 5800 },
  { code: "14130", name: "川崎市中原区", pref: "14", lat: 35.570, lng: 139.660, avgPrice: 5600 },
  { code: "14131", name: "川崎市高津区", pref: "14", lat: 35.588, lng: 139.611, avgPrice: 4800 },
  { code: "14150", name: "藤沢市", pref: "14", lat: 35.341, lng: 139.487, avgPrice: 4200 },
  { code: "14151", name: "鎌倉市", pref: "14", lat: 35.319, lng: 139.547, avgPrice: 5500 },
  // 埼玉
  { code: "11101", name: "さいたま市大宮区", pref: "11", lat: 35.906, lng: 139.631, avgPrice: 4200 },
  { code: "11102", name: "さいたま市浦和区", pref: "11", lat: 35.862, lng: 139.657, avgPrice: 4800 },
  { code: "11201", name: "川越市", pref: "11", lat: 35.925, lng: 139.486, avgPrice: 2800 },
  { code: "11203", name: "川口市", pref: "11", lat: 35.808, lng: 139.724, avgPrice: 3600 },
  { code: "11204", name: "所沢市", pref: "11", lat: 35.799, lng: 139.469, avgPrice: 2900 },
  // 千葉
  { code: "12101", name: "千葉市中央区", pref: "12", lat: 35.607, lng: 140.107, avgPrice: 3200 },
  { code: "12203", name: "船橋市", pref: "12", lat: 35.695, lng: 139.983, avgPrice: 3800 },
  { code: "12207", name: "柏市", pref: "12", lat: 35.868, lng: 139.976, avgPrice: 3200 },
  { code: "12204", name: "市川市", pref: "12", lat: 35.728, lng: 139.931, avgPrice: 4200 },
  { code: "12216", name: "浦安市", pref: "12", lat: 35.654, lng: 139.902, avgPrice: 5600 },
];

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [35.68, 139.69], // 東京中心
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        minZoom: 8,
        maxZoom: 14,
      });

      // Dark premium tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Zoom control on right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright" }).addTo(map);

      const currentYear = new Date().getFullYear() - 1;

      // Add city markers
      KANTO_CITIES.forEach((city) => {
        const price = city.avgPrice;
        const color = getPriceColor(price);
        const level = getPriceLevel(price);
        const radius = Math.max(6, Math.min(18, Math.sqrt(price) * 0.15));

        const marker = L.circleMarker([city.lat, city.lng], {
          radius,
          fillColor: color,
          color: "#ffffff",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.75,
        }).addTo(map);

        // Popup
        marker.bindPopup(
          `<div style="text-align:center;min-width:150px;font-family:sans-serif">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${city.name}</div>
            <div style="color:${color};font-weight:800;font-size:18px;margin-bottom:2px">
              ${price.toLocaleString()}万円
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">平均取引価格 / ${level}</div>
            <div style="background:${color};color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" class="city-popup-btn" data-pref="${city.pref}" data-city="${city.code}">
              詳細を見る →
            </div>
          </div>`,
          { closeButton: false, className: "pref-popup" }
        );

        marker.on("mouseover", () => marker.openPopup());
      });

      // Handle popup button click
      map.on("popupopen", (e: L.PopupEvent) => {
        const popup = e.popup;
        const container = popup.getElement();
        if (!container) return;
        const btn = container.querySelector(".city-popup-btn") as HTMLElement;
        if (btn) {
          btn.onclick = () => {
            const pref = btn.dataset.pref;
            const city = btn.dataset.city;
            router.push(`/search?area=${pref}&city=${city}&year=${currentYear}&quarter=1`);
          };
        }
      });

      mapInstance.current = map;
      setReady(true);

      // Fix map size after render
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [router]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">マップを読み込み中...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 text-xs">
        <div className="text-slate-400 font-medium mb-2">首都圏 平均取引価格（万円）</div>
        <div className="flex items-center gap-1.5">
          {[
            { color: "#0d9488", label: "~700" },
            { color: "#16a34a", label: "~1000" },
            { color: "#65a30d", label: "~1500" },
            { color: "#ca8a04", label: "~2000" },
            { color: "#d97706", label: "~3000" },
            { color: "#ea580c", label: "~5000" },
            { color: "#dc2626", label: "5000+" },
          ].map((item) => (
            <div key={item.color} className="flex flex-col items-center gap-0.5">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
