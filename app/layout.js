import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "旅のしおり | みんなの旅行計画",
  description: "あなただけの旅のしおりを簡単に作れるサービスです",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
