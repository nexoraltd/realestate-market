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
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L12 3L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" stroke="white" strokeWidth="2" />
            </svg>
          </div>
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
          <Link href="/sell" className="text-slate-300 hover:text-white transition font-medium">
            売りたい方
          </Link>
          <Link href="/buy" className="text-slate-300 hover:text-white transition font-medium">
            買いたい方
          </Link>
          <a href="/#pricing" className="text-slate-300 hover:text-white transition font-medium">
            料金
          </a>
          <a
            href="#contact"
            className="bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-lg font-bold transition text-sm text-white shadow-md"
          >
            無料査定相談
          </a>
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
            { href: "/sell", label: "売りたい方" },
            { href: "/buy", label: "買いたい方" },
            { href: "/#pricing", label: "料金" },
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
            href="#contact"
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
