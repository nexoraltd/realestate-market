export default function TrustBadges() {
  const stats = [
    { value: "20年分", label: "取引データ蓄積" },
    { value: "47都道府県", label: "全国対応" },
    { value: "500万件+", label: "取引事例数" },
    { value: "国交省公式", label: "データソース" },
  ];

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-extrabold text-[#1a365d]">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
