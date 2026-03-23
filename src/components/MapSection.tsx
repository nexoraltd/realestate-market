"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function MapSection() {
  return (
    <div className="h-[420px] md:h-[520px]">
      <div className="text-center text-xs text-slate-500 mb-2">
        市区町村をクリックして相場を確認
      </div>
      <LeafletMap />
    </div>
  );
}
