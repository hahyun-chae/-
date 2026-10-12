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
  /** 앱을 새로 열었거나, 30분 넘게 다른 앱에 있다가 돌아온 순간. 판단 확인까지 걸린 시간의 시작점 */
  "App Opened": {
    entry_page: string;
    entry_path: string;
    /** 사용자 기기 기준 시각 (0~23). 아침 장보기·밤 발주 시간대 확인용 */
    hour: number;
    /** 홈 화면에 추가한 앱으로 열었는지 */
    is_standalone: boolean;
    resumed: boolean;
    away_minutes: number | null;
  };
  /** 재료 상세를 연 순간. from: 직전 화면 (오늘 판단에서 왔으면 판단 근거를 확인하는 행동) */
  "Ingredient Detail Viewed": {
    ingredient_id: string;
    ingredient_name: string;
    from: string;
    status: string | null;
    action: string;
    is_watched: boolean;
    has_price: boolean;
    menu_usage_count: number;
    candidate_count: number;
  };
  "Onboarding Step Completed": { step: number; step_name: string };
  "Onboarding Completed": { watch_count: number; custom_ingredient_count: number };
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
    /** 앱을 연 뒤(App Opened) 판단을 보기까지 걸린 시간(초). 목표 60초 이내 */
    seconds_since_open: number;
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
 * 모든 이벤트에 붙는 공통 속성. 지금 화면에 보이는 시세가 실제(KAMIS)인지 데모(MOCK)인지 남겨서
 * 데모 시세를 보고 한 행동을 분석에서 걸러낼 수 있게 한다. (PricesProvider가 갱신)
 */
let context: { data_source?: "KAMIS" | "MOCK"; data_fallback?: string | null } = {};

export function setDataContext(source: "KAMIS" | "MOCK", fallback: string | null) {
  context = { data_source: source, data_fallback: fallback };
}

/**
 * 직접 정의한 이벤트를 Mixpanel과 Amplitude 양쪽에 같은 이름·속성으로 보낸다.
 * (Amplitude는 초기화 전에 호출돼도 이벤트를 모아 두었다가 초기화 후 보낸다)
 */
export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  const payload = { ...context, ...props };
  if (initialized) mixpanel.track(event, payload);
  if (AMPLITUDE_API_KEY) amplitude.track(event, payload);
}

const RESUME_AFTER_MS = 30 * 60 * 1000;
/** 앱을 연 시각. 처음 연 경우는 페이지를 불러오기 시작한 시각(performance.timeOrigin)을 쓴다 */
let openedAt: number | null = null;
let hiddenAt: number | null = null;

export function secondsSinceOpen(): number {
  const start = openedAt ?? performance.timeOrigin;
  return Math.max(0, Math.round((Date.now() - start) / 1000));
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

function sendAppOpened(resumed: boolean, awayMs: number | null) {
  const path = window.location.pathname;
  track("App Opened", {
    entry_page: pageName(path),
    entry_path: path,
    hour: new Date().getHours(),
    is_standalone: isStandalone(),
    resumed,
    away_minutes: awayMs == null ? null : Math.round(awayMs / 60000),
  });
}

let appOpenTracked = false;

/**
 * 페이지를 처음 불러왔을 때 App Opened를 보내고, 이후 30분 넘게 다른 앱에 있다가 돌아오면 다시 보낸다.
 * (휴대폰에서는 탭을 닫지 않고 다음 날 다시 여는 경우가 많아서 새로 불러올 때만 세면 접속이 빠진다)
 */
export function trackAppOpens() {
  if (appOpenTracked || typeof window === "undefined") return;
  appOpenTracked = true;
  sendAppOpened(false, null);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt == null) return;
    const away = Date.now() - hiddenAt;
    hiddenAt = null;
    if (away < RESUME_AFTER_MS) return;
    openedAt = Date.now();
    sendAppOpened(true, away);
  });
}

/** 사장님별 현재 상태. 이 값으로 사용자를 나눠 "메뉴를 등록한 사람이 더 자주 오나?" 같은 질문에 답한다 */
export interface UserProfile {
  onboarded: boolean;
  watch_count: number;
  menu_count: number;
  custom_ingredient_count: number;
  shopping_item_count: number;
  region: string;
  price_type: string;
}

let lastProfile: string | null = null;

export function syncUserProfile(profile: UserProfile) {
  const key = JSON.stringify(profile);
  if (lastProfile === key) return;
  lastProfile = key;
  // 처음 온보딩을 마친 것으로 확인된 시각. 이미 값이 있으면 바꾸지 않는다
  const firstOnboarded = profile.onboarded ? { first_onboarded_at: new Date().toISOString() } : null;
  if (initialized) {
    mixpanel.people.set(profile);
    if (firstOnboarded) mixpanel.people.set_once(firstOnboarded);
  }
  if (AMPLITUDE_API_KEY) {
    const identify = new amplitude.Identify();
    for (const [k, v] of Object.entries(profile)) identify.set(k, v);
    if (firstOnboarded) identify.setOnce("first_onboarded_at", firstOnboarded.first_onboarded_at);
    amplitude.identify(identify);
  }
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
let currentPath: string | null = null;
let previousPath: string | null = null;

/** 화면 이동을 기억해 둔다. 도구 연결 여부와 관계없이 직전 화면을 알기 위해 페이지뷰와 따로 둔다 */
export function notePath(pathname: string) {
  if (currentPath === pathname) return;
  previousPath = currentPath;
  currentPath = pathname;
}

/** pathname 화면으로 오기 직전에 있던 화면 이름. 바로 들어왔으면 "direct" */
export function previousPageOf(pathname: string): string {
  // 아직 notePath가 이 화면을 기록하기 전이면 currentPath가 직전 화면이다
  const prev = currentPath === pathname ? previousPath : currentPath;
  return prev ? pageName(prev) : "direct";
}

/** 화면 이름을 함께 보내 Mixpanel에서 화면별로 묶어 보기 쉽게 한다 */
export function trackPageView(pathname: string) {
  // 개발 모드(StrictMode)에서 effect가 두 번 실행돼도 같은 화면은 한 번만 기록
  if (!initialized || lastPageView === pathname) return;
  lastPageView = pathname;
  mixpanel.track_pageview({ ...context, page: pageName(pathname), path: pathname });
}

function pageName(pathname: string): string {
  if (pathname.startsWith("/onboarding")) return "온보딩";
  if (/^\/ingredients\/.+/.test(pathname)) return "재료 상세";
  if (pathname.startsWith("/ingredients")) return "재료 시세";
  if (pathname.startsWith("/today")) return "오늘 판단";
  if (pathname === "/menus/new") return "메뉴 등록";
  if (/^\/menus\/.+/.test(pathname)) return "메뉴 편집";
  if (pathname.startsWith("/menus")) return "메뉴";
  if (pathname.startsWith("/shopping")) return "장보기";
  if (pathname.startsWith("/settings")) return "설정";
  return pathname;
}
