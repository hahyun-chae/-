import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import { AmplitudeProvider } from "@/components/layout/AmplitudeProvider";
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider";
import { AppShell } from "@/components/layout/AppShell";
import { getPriceBoard } from "@/lib/prices";
import { PricesProvider } from "@/store/prices-context";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// 한글은 Inter에 없으므로 Noto Sans KR로 받친다
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
  themeColor: "#020617",
};

// 시세는 하루 1~2회 바뀌므로 1시간마다 다시 생성
export const revalidate = 3600;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prices = await getPriceBoard();
  return (
    <html lang="ko" className={cn("h-full antialiased font-sans", inter.variable, jetbrainsMono.variable, notoSansKr.variable)}>
      <body className="min-h-full">
        <AnalyticsProvider />
        <AmplitudeProvider />
        <PricesProvider initial={prices}>
          <AppShell>{children}</AppShell>
        </PricesProvider>
      </body>
    </html>
  );
}
