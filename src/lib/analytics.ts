"use client";

import * as amplitude from "@amplitude/analytics-browser";
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
  "Custom Ingredient Added": { ingredient_name: string; source: "ingredients_list" | "onboarding" | "menu_editor" | "shopping" };
  "Category Tab Selected": { category: string };
  "Ingredient Size Selected": { ingredient_id: string; unit: string; source: "price_row" | "ingredient_detail" };
  /** 장보기 목록에 담기. 판단 카드에서 담았으면 어떤 추천을 어떻게 따랐는지(choice) 남긴다 */
  "Shopping Item Added": {
    ingredient_id: string | null;
    ingredient_name: string;
    /** recommendation: 먼저 확인할 재료 카드, manual: 장보기 화면 검색, price_row: 재료 한 줄, ingredient_detail: 재료 상세 */
    source: "recommendation" | "manual" | "price_row" | "ingredient_detail";
    recommendation_action?: string;
    choice?: "substitute" | "as_is";
    replaced_from?: string;
    price_change_pct?: number | null;
    candidate_ids?: string[];
  };
  /** 장보기 목록에서 오른 재료를 대체 재료로 바꾸기 */
  "Shopping Item Replaced": { from_ingredient_id: string; to_ingredient_id: string; price_change_pct: number | null };
  "Shopping Item Removed": { ingredient_id: string | null; ingredient_name: string; from_recommendation: boolean };
  "Shopping Item Checked": { ingredient_id: string | null; ingredient_name: string; checked: boolean; from_recommendation: boolean; replaced: boolean };
  /** 산 것 지우기(clear_checked) / 체크 모두 풀기(uncheck_all) */
  "Shopping List Reset": { mode: "clear_checked" | "uncheck_all"; item_count: number };
  /** 오늘 판단 화면에서 판단을 본 순간. 추천 적용률의 분모 */
  "Today Decisions Viewed": {
    data_date: string | null;
    data_source: "KAMIS" | "MOCK";
    fallback: string | null;
    tracked_count: number;
    substitute_count: number;
    adjust_count: number;
    caution_count: number;
    opportunity_count: number;
  };
  /** 장보기 화면을 연 순간의 목록 상태. 작성(밤)·사용(아침) 시간대는 이벤트 시각으로 본다 */
  "Shopping List Viewed": {
    item_count: number;
    checked_count: number;
    cheaper_count: number;
    rising_count: number;
    replaceable_count: number;
  };
  /** 검색을 마친 순간 (입력을 멈췄거나 결과를 골랐을 때). 결과 0개 = 없는 재료 */
  "Ingredient Searched": {
    query: string;
    result_count: number;
    no_result: boolean;
    picked: boolean;
    location: "ingredients_list" | "shopping" | "menu_editor" | "onboarding";
  };
  /** 장보기 항목의 수량을 적거나 바꾼 순간 (입력칸을 벗어날 때 한 번) */
  "Shopping Item Quantity Set": { ingredient_id: string | null; ingredient_name: string; qty: string; from_recommendation: boolean };
  /** 재료 시세 화면을 떠날 때 그 방문 동안의 스크롤 요약 */
  "Ingredients List Scrolled": { scroll_count: number; max_depth_pct: number; item_count: number; tab: string; searching: boolean };
  "Menu Template Applied": { template_id: string; template_name: string };
  "Menu Saved": { is_new: boolean; core_count: number; adjustable_count: number; substitute_group_count: number; has_price: boolean };
  "Menu Deleted": { menu_id: string };
  "Settings Changed": { setting: string; value: string | number | boolean };
  "Data Reset": Record<string, never>;
}

// Amplitude는 AmplitudeProvider에서 초기화한다 (페이지뷰·클릭은 autocapture로 자동 수집)
const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

/**
 * 직접 정의한 이벤트를 Mixpanel과 Amplitude 양쪽에 같은 이름·속성으로 보낸다.
 * (Amplitude는 초기화 전에 호출돼도 이벤트를 모아 두었다가 초기화 후 보낸다)
 */
export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  if (initialized) mixpanel.track(event, props);
  if (AMPLITUDE_API_KEY) amplitude.track(event, props);
}

let identifiedStore: string | null = null;

/**
 * 로그인이 없는 MVP에서 사장님을 구분하는 이름표. 온보딩·설정에서 입력한 가게 이름을 사용자 ID로 쓴다.
 * 같은 가게 이름이면 기기가 달라도 한 사람으로 묶인다 (테스트 사용자가 적을 때만 쓰는 방식).
 * Amplitude 사용자 ID는 5자 이상이어야 해서 "store:" 접두어를 붙인다.
 */
export function identifyStore(storeName: string) {
  const name = storeName.trim();
  if (!name || identifiedStore === name) return;
  identifiedStore = name;
  const userId = `store:${name}`;
  if (initialized) {
    mixpanel.identify(userId);
    mixpanel.register({ store_name: name });
    mixpanel.people.set({ $name: name, store_name: name });
  }
  if (AMPLITUDE_API_KEY) {
    amplitude.setUserId(userId);
    amplitude.identify(new amplitude.Identify().set("store_name", name));
  }
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
