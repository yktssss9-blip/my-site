export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 overflow-hidden">
        {/* subtle background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

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
            className="inline-block bg-white text-indigo-600 font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-200"
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
              {
                emoji: "🗺️",
                title: "スケジュール管理",
                desc: "日程・時間・場所をわかりやすく整理できます",
              },
              {
                emoji: "📸",
                title: "思い出を記録",
                desc: "写真やメモを添付して旅の記録を残しましょう",
              },
              {
                emoji: "🔗",
                title: "かんたん共有",
                desc: "リンク一つで友達や家族としおりを共有できます",
              },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {title}
                </h3>
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
