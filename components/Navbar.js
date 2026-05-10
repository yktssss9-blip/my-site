"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 print:hidden">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ✈️ 旅のしおり
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#" className="hover:text-indigo-600 transition-colors">
            機能
          </Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">
            使い方
          </Link>
          <Link href="#" className="hover:text-indigo-600 transition-colors">
            料金
          </Link>
          <Link
            href="/create"
            className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            無料で始める
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="メニューを開く"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="sm:hidden px-6 pb-4 flex flex-col gap-4 text-sm font-medium text-gray-600 border-t border-gray-100">
          <Link href="#" onClick={() => setOpen(false)} className="hover:text-indigo-600">機能</Link>
          <Link href="#" onClick={() => setOpen(false)} className="hover:text-indigo-600">使い方</Link>
          <Link href="#" onClick={() => setOpen(false)} className="hover:text-indigo-600">料金</Link>
          <Link href="/create" onClick={() => setOpen(false)} className="bg-indigo-600 text-white px-5 py-2 rounded-full text-center hover:bg-indigo-700">
            無料で始める
          </Link>
        </nav>
      )}
    </header>
  );
}
