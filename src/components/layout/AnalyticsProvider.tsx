"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { REGIONS } from "@/lib/templates";
import { identifyStore, initAnalytics, notePath, syncUserProfile, trackAppOpens, trackPageView } from "@/lib/analytics";
import { useAppState } from "@/store/app-store";

/** Mixpanel 초기화 + 가게 이름으로 사장님 구분 + 앱 열기·화면 이동 기록 + 사장님 상태를 사용자 속성으로 동기화 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const app = useAppState();
  const storeName = app?.settings.name ?? "";

  useEffect(() => {
    initAnalytics();
    trackAppOpens();
  }, []);

  // 온보딩에서 가게 이름을 입력했거나 설정에서 바꾸면 분석 도구의 사용자 이름표도 바뀐다
  useEffect(() => {
    if (storeName) identifyStore(storeName);
  }, [storeName]);

  // 가게 이름으로 사용자를 구분한 뒤부터 상태를 남긴다 (그 전에는 모두 0이라 의미가 없다)
  const profile = app && storeName
    ? {
        onboarded: app.onboarded,
        watch_count: app.watchlist.length,
        menu_count: app.menus.length,
        custom_ingredient_count: app.customIngredients.length,
        shopping_item_count: app.shoppingList.length,
        region: REGIONS.find((r) => r.code === app.settings.region)?.label ?? app.settings.region,
        price_type: app.settings.priceType,
      }
    : null;
  const profileKey = JSON.stringify(profile);
  useEffect(() => {
    if (profile) syncUserProfile(profile);
    // profile은 매 렌더 새 객체라 값이 바뀔 때(profileKey)만 보낸다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileKey]);

  useEffect(() => {
    // 첫 화면(/)은 바로 /ingredients로 이동하므로 이동 후 화면만 기록한다
    if (pathname === "/") return;
    notePath(pathname);
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
