import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { getPriceBoard } from "@/lib/prices";
import { PricesProvider } from "@/store/prices-context";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "원가핏 · 식재료 시세와 원가 판단",
  description: "오늘 장 보기 전 1분, 우리 가게 메뉴 기준으로 무엇을 그대로 사고 무엇을 줄이거나 바꿀지 알려드려요.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
};

// 시세는 하루 1~2회 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prices = await getPriceBoard();
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PricesProvider initial={prices}>
          <AppShell>{children}</AppShell>
        </PricesProvider>
      </body>
    </html>
  );
}
