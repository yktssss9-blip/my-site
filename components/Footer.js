import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg mb-2">✈️ 旅のしおり</p>
          <p className="text-sm leading-relaxed">
            みんなが自分だけの旅行計画を
            <br />
            かんたんに作れるサービスです。
          </p>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">リンク</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">機能</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">使い方</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">料金</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">サポート</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">よくある質問</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-gray-700 text-center text-sm">
        © {new Date().getFullYear()} 旅のしおり. All rights reserved.
      </div>
    </footer>
  );
}
