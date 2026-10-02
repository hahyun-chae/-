export type PriceType = "retail" | "wholesale";

export type IngredientCategory =
  | "grain"
  | "leafy"
  | "vegetable"
  | "namul"
  | "mushroom"
  | "fruit"
  | "meat"
  | "seafood"
  | "etc";

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: IngredientCategory;
  unit: string;
  /** KAMIS 응답의 item_name / kind_name과 매칭할 때 쓰는 값. 없으면 시세 미연동 품목. */
  kamis?: { categoryCode: string; itemName: string; kindName?: string };
}

/** 한 품목의 특정 날짜 기준 시세와 비교 시점 가격 (KAMIS dailyPriceByCategoryList 구조를 따름) */
export interface PriceSnapshot {
  ingredientId: string;
  priceType: PriceType;
  date: string; // YYYY-MM-DD 조사 기준일
  unit: string;
  price: number;
  prevDay: number | null;
  weekAgo: number | null;
  twoWeeksAgo: number | null;
  monthAgo: number | null;
  yearAgo: number | null;
  normalYear: number | null;
  source: "KAMIS" | "MOCK";
}

export type PriceBoard = Record<string, PriceSnapshot>;

export type PriceStatus = "surge" | "up" | "flat" | "down" | "plunge";

export interface Thresholds {
  up: number; // % (1주 전 대비)
  surge: number;
  aboveNormal: number; // 평년 대비 %
}

export interface StoreSettings {
  name: string;
  region: string;
  priceType: PriceType;
  thresholds: Thresholds;
  autoWatchMenuIngredients: boolean;
}

export type IngredientRole = "core" | "adjustable";

export interface MenuIngredient {
  ingredientId: string;
  role: IngredientRole;
}

export interface SubstituteGroup {
  id: string;
  name: string;
  currentIngredientId: string;
  optionIds: string[];
}

export interface Menu {
  id: string;
  name: string;
  price?: number;
  ingredients: MenuIngredient[];
  substituteGroups: SubstituteGroup[];
}

export type RecommendedAction = "caution" | "adjust" | "substitute" | "opportunity" | "keep";

export type UserResponse = "applied" | "deferred" | "ignored";

export interface AppState {
  onboarded: boolean;
  settings: StoreSettings;
  watchlist: string[];
  menus: Menu[];
  /** 시세 품목에 없어 사용자가 직접 입력한 재료 (시세 미연동) */
  customIngredients: Ingredient[];
  /** key: `${date}:${ingredientId}` */
  responses: Record<string, UserResponse>;
}
