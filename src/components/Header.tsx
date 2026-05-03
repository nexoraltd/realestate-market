"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/10"
          : "bg-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.jpg" alt="不動産相場ナビ" className="w-8 h-8 rounded-lg shadow-lg" />
          <div>
            <span className="text-white font-bold text-base tracking-tight">
              不動産相場ナビ
            </span>
            <span className="hidden sm:inline text-slate-500 text-[10px] ml-2 font-medium">
              by ネクソラ不動産
            </span>
          </div>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white transition font-medium">
            トップ
          </Link>
          <Link href="/search" className="text-slate-300 hover:text-white transition font-medium">
            相場検索
          </Link>
          <Link href="/estimate" className="text-amber-400 hover:text-amber-300 transition font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            AI査定
          </Link>

          <Link href="/blog" className="text-slate-300 hover:text-white transition font-medium">
            コラム
          </Link>
          <Link href="/pricing" className="text-amber-400 hover:text-amber-300 transition font-bold">
            料金
          </Link>
          <Link href="/dashboard" className="text-slate-300 hover:text-white transition font-medium">
            マイページ
          </Link>
          <Link
            href="/register?plan=free"
            className="bg-amber-500 hover:bg-amber-400 px-5 py-2 rounded-lg font-bold transition text-sm text-slate-900 shadow-md"
          >
            無料登録
          </Link>
        </nav>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1.5 text-slate-300 hover:text-white"
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
        <nav className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-slate-800 px-4 py-3 space-y-1">
          {[
            { href: "/", label: "トップ" },
            { href: "/search", label: "相場検索" },
            { href: "/estimate", label: "AI査定" },

            { href: "/blog", label: "コラム" },
            { href: "/pricing", label: "料金" },
            { href: "/dashboard", label: "マイページ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="mailto:info@next-aura.com"
            className="block bg-amber-500 text-center py-2.5 rounded-lg font-bold mt-2 text-white"
            onClick={() => setMenuOpen(false)}
          >
            無料査定相談
          </a>
        </nav>
      )}
    </header>
  );
}
