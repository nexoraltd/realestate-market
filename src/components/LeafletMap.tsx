"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PREFECTURE_GEO, getPriceColor, getPriceLevel } from "@/lib/prefecture-geo";
import { MAJOR_CITIES } from "@/lib/major-cities";
import type { MapPricesResponse } from "@/app/api/map-prices/route";

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = (data: Partial<MapPricesResponse>) => {
      if (!mapRef.current) return;
      const prefPrices = data.prefectures ?? {};
      const cityPrices = data.cities ?? {};

      import("leaflet").then((L) => {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [36.5, 137.0],
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
          minZoom: 4,
          maxZoom: 14,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.attribution({ position: "bottomright" }).addTo(map);

        const currentYear = new Date().getFullYear() - 1;

        // ── 都道府県マーカー（大きめ・常時表示） ──
        PREFECTURE_GEO.forEach((pref) => {
          const price = prefPrices[pref.code] ?? pref.avgPrice ?? 0;
          if (!price) return;
          const color = getPriceColor(price);
          const level = getPriceLevel(price);
          const radius = Math.max(8, Math.min(22, Math.sqrt(price) * 0.18));

          const marker = L.circleMarker([pref.lat, pref.lng], {
            radius,
            fillColor: color,
            color: "#ffffff",
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.75,
          }).addTo(map);

          marker.bindPopup(
            `<div style="text-align:center;min-width:150px;font-family:sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${pref.name}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${pref.region}地方</div>
              <div style="color:${color};font-weight:800;font-size:18px;margin-bottom:2px">
                ${price.toLocaleString()}万円
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">中古マンション中央値 / ${level}</div>
              <div style="background:${color};color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" class="pref-popup-btn" data-pref="${pref.code}">
                詳細を見る →
              </div>
            </div>`,
            { closeButton: false, className: "pref-popup" }
          );
          marker.on("mouseover", () => marker.openPopup());
        });

        // ── 都市マーカー（小さめ・ズーム6以上で表示） ──
        const cityLayer = L.layerGroup();

        MAJOR_CITIES.forEach((city) => {
          const price = cityPrices[city.code];
          if (!price) return;
          const color = getPriceColor(price);
          const radius = Math.max(4, Math.min(10, Math.sqrt(price) * 0.10));

          const marker = L.circleMarker([city.lat, city.lng], {
            radius,
            fillColor: color,
            color: "#ffffff",
            weight: 1,
            opacity: 0.85,
            fillOpacity: 0.70,
          });

          marker.bindPopup(
            `<div style="text-align:center;min-width:140px;font-family:sans-serif">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px">${city.name}</div>
              <div style="color:${color};font-weight:800;font-size:17px;margin-bottom:2px">
                ${price.toLocaleString()}万円
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">中古マンション中央値</div>
              <div style="background:${color};color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer" class="pref-popup-btn" data-pref="${city.prefCode}">
                詳細を見る →
              </div>
            </div>`,
            { closeButton: false, className: "pref-popup" }
          );
          marker.on("mouseover", () => marker.openPopup());
          cityLayer.addLayer(marker);
        });

        // ズーム6以上で都市マーカーを表示
        const updateCityLayer = () => {
          if (map.getZoom() >= 6) {
            if (!map.hasLayer(cityLayer)) cityLayer.addTo(map);
          } else {
            if (map.hasLayer(cityLayer)) map.removeLayer(cityLayer);
          }
        };
        map.on("zoomend", updateCityLayer);
        updateCityLayer();

        // ポップアップボタンのクリック処理
        map.on("popupopen", (e: L.PopupEvent) => {
          const btn = e.popup.getElement()?.querySelector(".pref-popup-btn") as HTMLElement | null;
          if (btn) {
            btn.onclick = () => {
              const pref = btn.dataset.pref;
              router.push(`/search?area=${pref}&year=${currentYear}&quarter=1`);
            };
          }
        });

        mapInstance.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 100);
      });
    };

    fetch("/api/map-prices")
      .then((r) => r.json())
      .then((data: MapPricesResponse) => initMap(data))
      .catch(() => initMap({}));

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
        <div className="text-slate-400 font-medium mb-2">中古マンション中央値（万円）</div>
        <div className="flex items-center gap-1.5">
          {[
            { color: "#0d9488", label: "~1000" },
            { color: "#16a34a", label: "~1500" },
            { color: "#65a30d", label: "~2000" },
            { color: "#ca8a04", label: "~3000" },
            { color: "#d97706", label: "~4000" },
            { color: "#ea580c", label: "~5000" },
            { color: "#dc2626", label: "5000+" },
          ].map((item) => (
            <div key={item.color} className="flex flex-col items-center gap-0.5">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-slate-500 text-[10px]">ズームインで市区町村表示</div>
      </div>
    </div>
  );
}
