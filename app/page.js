"use client";

import { useState, useCallback } from "react";

const INK_COLORS = [
  "#FF6B6B", "#FFE66D", "#4ECDC4",
  "#F97316", "#A78BFA", "#34D399", "#F472B6",
];

const BLOB_OFFSETS = [
  { offsetX: 0,   offsetY: 0,   size: 24, delay: 0   },
  { offsetX: -20, offsetY: -14, size: 20, delay: 55  },
  { offsetX: 18,  offsetY: -10, size: 22, delay: 30  },
  { offsetX: -12, offsetY: 22,  size: 18, delay: 85  },
  { offsetX: 24,  offsetY: 16,  size: 20, delay: 45  },
  { offsetX: -28, offsetY: 8,   size: 16, delay: 100 },
];

const DROPLET_DEFS = [
  { angle: 20,  dist: 90,  size: 20, delay: 70  },
  { angle: 70,  dist: 110, size: 14, delay: 100 },
  { angle: 130, dist: 80,  size: 22, delay: 50  },
  { angle: 185, dist: 100, size: 16, delay: 120 },
  { angle: 240, dist: 88,  size: 18, delay: 75  },
  { angle: 295, dist: 105, size: 12, delay: 90  },
  { angle: 345, dist: 78,  size: 24, delay: 60  },
];

let inkCounter = 0;

export default function Home() {
  const [inks, setInks] = useState([]);

  const handleBgClick = useCallback((e) => {
    // ボタンやリンクのクリックは無視
    if (e.target.closest("a, button")) return;

    const id = ++inkCounter;
    // クリックした色のセットをずらして使う
    const colorOffset = id % INK_COLORS.length;
    const colors = [...INK_COLORS.slice(colorOffset), ...INK_COLORS.slice(0, colorOffset)];

    setInks((prev) => [...prev, { id, x: e.clientX, y: e.clientY, colors }]);

    // アニメーション終了後に削除
    setTimeout(() => {
      setInks((prev) => prev.filter((ink) => ink.id !== id));
    }, 1200);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        onClick={handleBgClick}
        className="relative flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 overflow-hidden cursor-crosshair select-none"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        {/* インクアニメーション（複数同時対応） */}
        {inks.map((ink) => (
          <span key={ink.id}>
            {BLOB_OFFSETS.map((b, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: b.size,
                  height: b.size,
                  left: ink.x + b.offsetX,
                  top: ink.y + b.offsetY,
                  backgroundColor: ink.colors[i % ink.colors.length],
                  animationName: "inkBlobSpread",
                  animationDuration: "0.9s",
                  animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  animationDelay: `${b.delay}ms`,
                  animationFillMode: "forwards",
                  zIndex: 5,
                }}
              />
            ))}
            {DROPLET_DEFS.map((d, i) => {
              const rad = (d.angle * Math.PI) / 180;
              return (
                <div
                  key={i}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    width: d.size,
                    height: d.size,
                    left: ink.x + Math.cos(rad) * d.dist,
                    top: ink.y + Math.sin(rad) * d.dist,
                    backgroundColor: ink.colors[(i + 2) % ink.colors.length],
                    transform: "translate(-50%, -50%) scale(0)",
                    animationName: "inkDroplet",
                    animationDuration: "0.55s",
                    animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animationDelay: `${d.delay}ms`,
                    animationFillMode: "forwards",
                    zIndex: 4,
                  }}
                />
              );
            })}
          </span>
        ))}

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-4">
            Travel Itinerary
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            あなただけの
            <br />
            旅のしおりを作ろう
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mb-10 leading-relaxed">
            行き先・スケジュール・思い出をまとめて、
            <br className="hidden sm:block" />
            大切な人と簡単に共有できます。
          </p>
          <a
            href="/create"
            className="inline-block bg-white text-indigo-600 font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            Get started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            旅をもっと楽しく、スマートに
          </h2>
          <p className="text-gray-500 mb-10 sm:mb-16 text-base sm:text-lg">
            シンプルな操作で、あなたの旅行を丸ごとサポートします
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { emoji: "🗺️", title: "スケジュール管理", desc: "日程・時間・場所をわかりやすく整理できます" },
              { emoji: "📸", title: "思い出を記録",     desc: "写真やメモを添付して旅の記録を残しましょう" },
              { emoji: "🔗", title: "かんたん共有",     desc: "リンク一つで友達や家族としおりを共有できます" },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          さっそく旅のしおりを作ってみよう
        </h2>
        <p className="text-white/80 text-lg mb-8">
          登録不要・無料でご利用いただけます
        </p>
        <a
          href="/create"
          className="inline-block bg-white text-indigo-600 font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-200"
        >
          無料で始める
        </a>
      </section>
    </>
  );
}
