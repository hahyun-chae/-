"use client";

import mixpanel from "mixpanel-browser";

// Mixpanel 연동. 토큰은 .env.local의 NEXT_PUBLIC_MIXPANEL_TOKEN으로 관리한다.
// 토큰이 없으면(예: 다른 사람이 저장소를 받아 실행) 아무것도 보내지 않는다.
const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

export function initAnalytics() {
  if (initialized || !TOKEN || typeof window === "undefined") return;
  mixpanel.init(TOKEN, {
    // App Router는 화면 전환 시 페이지를 새로 불러오지 않으므로 페이지뷰는 직접 보낸다 (AnalyticsProvider)
    track_pageview: false,
    // 정의한 이벤트만 수집 (자동 클릭 수집 끔)
    autocapture: false,
    persistence: "localStorage",
    debug: process.env.NODE_ENV === "development",
  });
  initialized = true;
}

/** 이벤트 이름 → 속성. 이벤트를 추가할 때 여기에 먼저 정의한다. */
export interface AnalyticsEvents {
  "Onboarding Step Completed": { step: number; step_name: string };
  "Onboarding Completed": { watch_count: number; custom_ingredient_count: number; menu_count: number; menus_skipped: boolean };
  "Watchlist Item Added": { ingredient_id: string; ingredient_name: string; source: "ingredients_list" | "ingredient_detail" };
  "Watchlist Item Removed": { ingredient_id: string; ingredient_name: string; source: "ingredients_list" | "ingredient_detail" };
  "Custom Ingredient Added": { ingredient_name: string; source: "ingredients_list" | "onboarding" | "menu_editor" };
  "Category Tab Selected": { category: string };
  "Ingredient Size Selected": { ingredient_id: string; unit: string; source: "price_row" | "ingredient_detail" };
  /** 장보기 목록에 담기. 판단 카드에서 담았으면 어떤 추천을 어떻게 따랐는지(choice) 남긴다 */
  "Shopping Item Added": {
    ingredient_id: string | null;
    ingredient_name: string;
    source: "recommendation" | "manual";
    list_day: string;
    recommendation_action?: string;
    choice?: "substitute" | "reduce" | "needed_only" | "as_is";
    replaced_from?: string;
    price_change_pct?: number | null;
    candidate_ids?: string[];
  };
  "Shopping Item Removed": { ingredient_id: string | null; ingredient_name: string; from_recommendation: boolean };
  "Shopping Item Checked": { ingredient_id: string | null; ingredient_name: string; checked: boolean; from_recommendation: boolean; replaced: boolean };
  "Shopping List Copied": { from_date: string; to_date: string; item_count: number };
  "Menu Template Applied": { template_id: string; template_name: string };
  "Menu Saved": { is_new: boolean; core_count: number; adjustable_count: number; substitute_group_count: number; has_price: boolean };
  "Menu Deleted": { menu_id: string };
  "Settings Changed": { setting: string; value: string | number | boolean };
  "Data Reset": Record<string, never>;
}

export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  if (!initialized) return;
  mixpanel.track(event, props);
}

let lastPageView: string | null = null;

/** 화면 이름을 함께 보내 Mixpanel에서 화면별로 묶어 보기 쉽게 한다 */
export function trackPageView(pathname: string) {
  // 개발 모드(StrictMode)에서 effect가 두 번 실행돼도 같은 화면은 한 번만 기록
  if (!initialized || lastPageView === pathname) return;
  lastPageView = pathname;
  mixpanel.track_pageview({ page: pageName(pathname), path: pathname });
}

function pageName(pathname: string): string {
  if (pathname.startsWith("/onboarding")) return "온보딩";
  if (/^\/ingredients\/.+/.test(pathname)) return "재료 상세";
  if (pathname.startsWith("/ingredients")) return "재료 시세";
  if (pathname.startsWith("/today")) return "오늘 판단";
  if (pathname === "/menus/new") return "메뉴 등록";
  if (/^\/menus\/.+/.test(pathname)) return "메뉴 편집";
  if (pathname.startsWith("/menus")) return "메뉴";
  if (pathname.startsWith("/settings")) return "설정";
  return pathname;
}
