"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { identifyStore, initAnalytics, trackPageView } from "@/lib/analytics";
import { useAppState } from "@/store/app-store";

/** Mixpanel 초기화 + 가게 이름으로 사장님 구분 + 화면이 바뀔 때마다 페이지뷰 전송 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const storeName = useAppState()?.settings.name ?? "";

  useEffect(() => {
    initAnalytics();
  }, []);

  // 온보딩에서 가게 이름을 입력했거나 설정에서 바꾸면 분석 도구의 사용자 이름표도 바뀐다
  useEffect(() => {
    if (storeName) identifyStore(storeName);
  }, [storeName]);

  useEffect(() => {
    // 첫 화면(/)은 바로 /ingredients로 이동하므로 이동 후 화면만 기록한다
    if (pathname === "/") return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
