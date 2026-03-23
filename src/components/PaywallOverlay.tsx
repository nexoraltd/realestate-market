"use client";

export default function PaywallOverlay({
  feature,
  children,
}: {
  feature: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
        <div className="text-center px-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a365d]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#1a365d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <p className="font-bold text-[#1a365d] mb-1">{feature}</p>
          <p className="text-sm text-gray-500 mb-3">
            スタンダードプラン以上でご利用いただけます
          </p>
          <a
            href="/#pricing"
            className="inline-block bg-[#ed8936] hover:bg-orange-500 text-white text-sm font-bold py-2 px-5 rounded-lg transition"
          >
            プランを見る
          </a>
        </div>
      </div>
    </div>
  );
}
