"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";

/** Mixpanel 초기화 + 화면이 바뀔 때마다 페이지뷰 전송 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // 첫 화면(/)은 바로 /ingredients로 이동하므로 이동 후 화면만 기록한다
    if (pathname === "/") return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
