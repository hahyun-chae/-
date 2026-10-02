"use client";

import { useSyncExternalStore } from "react";
import { getIngredient } from "@/lib/catalog";
import { DEFAULT_THRESHOLDS } from "@/lib/status";
import type { AppState, Ingredient, Menu, StoreSettings, UserResponse } from "@/lib/types";

// MVP에서는 가게 데이터(관심 재료, 메뉴, 설정)를 브라우저 localStorage에 저장한다.
// 로그인·DB(PostgreSQL)를 붙일 때 이 모듈의 load/save만 서버 API 호출로 바꾸면 된다.
const STORAGE_KEY = "wongafit:v1";

export const DEFAULT_SETTINGS: StoreSettings = {
  name: "",
  businessType: "bibimbap",
  region: "",
  priceType: "retail",
  thresholds: DEFAULT_THRESHOLDS,
  autoWatchMenuIngredients: true,
};

export const INITIAL_STATE: AppState = {
  onboarded: false,
  settings: DEFAULT_SETTINGS,
  watchlist: [],
  menus: [],
  customIngredients: [],
  responses: {},
};

let state: AppState | null = null;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
        thresholds: { ...DEFAULT_THRESHOLDS, ...parsed.settings?.thresholds },
      },
    };
  } catch {
    return INITIAL_STATE;
  }
}

function getSnapshot(): AppState {
  if (state === null) state = load();
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패(사생활 보호 모드 등)해도 현재 세션에서는 계속 동작
  }
  listeners.forEach((l) => l());
}

/** 서버 렌더링·하이드레이션 중에는 null, 브라우저에서 저장값을 읽은 뒤에는 AppState */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function makeNameOf(custom: Ingredient[]) {
  return (id: string) => getIngredient(id)?.name ?? custom.find((c) => c.id === id)?.name ?? id;
}

/** 관심 재료로 자동 등록할 메뉴 재료. 대체 후보는 추천에만 쓰고 관심 목록에는 넣지 않는다. */
function menuIngredientIds(menu: Menu): string[] {
  return [
    ...menu.ingredients.map((i) => i.ingredientId),
    ...menu.substituteGroups.map((g) => g.currentIngredientId),
  ];
}

export const actions = {
  completeOnboarding(settings: Partial<StoreSettings>, watchlist: string[], menus: Menu[]) {
    setState((s) => ({
      ...s,
      onboarded: true,
      settings: { ...s.settings, ...settings },
      watchlist: [...new Set([...watchlist, ...menus.flatMap(menuIngredientIds)])],
      menus,
    }));
  },
  updateSettings(patch: Partial<StoreSettings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  addWatch(ids: string[]) {
    setState((s) => ({ ...s, watchlist: [...new Set([...s.watchlist, ...ids])] }));
  },
  removeWatch(id: string) {
    setState((s) => ({ ...s, watchlist: s.watchlist.filter((w) => w !== id) }));
  },
  addCustomIngredient(name: string): string {
    const id = newId("custom");
    const ing: Ingredient = { id, name, aliases: [], category: "etc", unit: "-" };
    setState((s) => ({ ...s, customIngredients: [...s.customIngredients, ing] }));
    return id;
  },
  saveMenu(menu: Menu) {
    setState((s) => {
      const exists = s.menus.some((m) => m.id === menu.id);
      const menus = exists ? s.menus.map((m) => (m.id === menu.id ? menu : m)) : [...s.menus, menu];
      const watchlist = s.settings.autoWatchMenuIngredients
        ? [...new Set([...s.watchlist, ...menuIngredientIds(menu)])]
        : s.watchlist;
      return { ...s, menus, watchlist };
    });
  },
  deleteMenu(id: string) {
    setState((s) => ({ ...s, menus: s.menus.filter((m) => m.id !== id) }));
  },
  respond(key: string, response: UserResponse | null) {
    setState((s) => {
      const responses = { ...s.responses };
      if (response) responses[key] = response;
      else delete responses[key];
      return { ...s, responses };
    });
  },
  reset() {
    setState(() => INITIAL_STATE);
  },
};
