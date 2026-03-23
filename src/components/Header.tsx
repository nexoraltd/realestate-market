"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#1a365d] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="14" width="24" height="16" rx="2" fill="#ed8936" />
            <path d="M2 16L16 4L30 16" stroke="white" strokeWidth="3" fill="none" />
            <rect x="13" y="20" width="6" height="10" rx="1" fill="white" />
          </svg>
          <span className="text-lg font-bold tracking-tight">不動産相場ナビ</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/" className="hover:text-orange-300 transition">トップ</Link>
          <Link href="/search" className="hover:text-orange-300 transition">相場検索</Link>
          <Link href="/sell" className="hover:text-orange-300 transition">売りたい方</Link>
          <Link href="/buy" className="hover:text-orange-300 transition">買いたい方</Link>
          <a href="/#pricing" className="hover:text-orange-300 transition">料金</a>
          <a
            href="#contact"
            className="bg-[#ed8936] hover:bg-orange-500 px-4 py-2 rounded-lg font-bold transition text-sm"
          >
            無料査定相談
          </a>
        </nav>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1"
          aria-label="メニュー"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden bg-[#1a365d] border-t border-blue-700 px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 hover:text-orange-300" onClick={() => setMenuOpen(false)}>トップ</Link>
          <Link href="/search" className="block py-2 hover:text-orange-300" onClick={() => setMenuOpen(false)}>相場検索</Link>
          <Link href="/sell" className="block py-2 hover:text-orange-300" onClick={() => setMenuOpen(false)}>売りたい方</Link>
          <Link href="/buy" className="block py-2 hover:text-orange-300" onClick={() => setMenuOpen(false)}>買いたい方</Link>
          <a href="/#pricing" className="block py-2 hover:text-orange-300" onClick={() => setMenuOpen(false)}>料金</a>
          <a href="#contact" className="block bg-[#ed8936] text-center py-2 rounded-lg font-bold mt-2" onClick={() => setMenuOpen(false)}>
            無料査定相談
          </a>
        </nav>
      )}
    </header>
  );
}
