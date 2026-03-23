import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#1a365d] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="14" width="24" height="16" rx="2" fill="#ed8936" />
            <path d="M2 16L16 4L30 16" stroke="white" strokeWidth="3" fill="none" />
            <rect x="13" y="20" width="6" height="10" rx="1" fill="white" />
          </svg>
          <span className="text-xl font-bold tracking-tight">不動産相場ナビ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-orange-300 transition">
            トップ
          </Link>
          <Link href="/search" className="hover:text-orange-300 transition">
            相場検索
          </Link>
          <a
            href="#contact"
            className="bg-[#ed8936] hover:bg-orange-500 px-4 py-2 rounded-lg font-bold transition"
          >
            無料査定相談
          </a>
        </nav>
      </div>
    </header>
  );
}
