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
  | "seasoning"
  | "nuts"
  | "etc";

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: IngredientCategory;
  unit: string;
  /**
   * KAMIS 분류: 부류(대분류) › 품목(중분류) › 품종(소분류). 응답의 item_code / kind_code로 시세를 맞춘다.
   * kindCode가 없으면 품목 대표 시세(그날 조사된 품종 중 첫 번째, 예: 배추는 철마다 봄·고랭지·가을·월동).
   * 없으면 시세 미연동 품목.
   */
  kamis?: {
    categoryCode: string;
    itemCode: string;
    itemName: string;
    kindCode?: string;
    kindName?: string;
    /** 용량만 다른 품종 (예: 쌀 20kg 재료에 쌀 10kg). 가격이 용량에 정비례하지 않아 따로 받아 보여준다 */
    sizeKindCodes?: string[];
  };
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
  /** KAMIS 품종 코드 (용량 선택에 쓴다) */
  kindCode?: string;
  /** 용량별 시세 (지금 보여주는 용량 포함). 용량이 2개 이상인 재료만 있다 */
  sizes?: PriceSnapshot[];
}

export type PriceBoard = Record<string, PriceSnapshot>;

/** 데모 시세로 대신 보여주는 이유: KAMIS 키가 없음 / 키는 있지만 KAMIS에서 시세를 받지 못함 */
export type PriceFallback = "no_key" | "kamis_failed";

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

/** 장보기 목록 항목. 판단 카드에서 담았으면 어떤 추천에서 왔는지 남긴다 */
export interface ShoppingItem {
  id: string;
  /** 시세 품목 또는 직접 추가한 재료의 id */
  ingredientId?: string;
  name: string;
  /** "2단", "1판"처럼 사장님이 쓰는 말 그대로 */
  qty: string;
  /** 판단 카드에서 담을 때 붙는 메모 (예: "평소보다 적게") */
  note?: string;
  checked: boolean;
  source: "manual" | "recommendation" | "previous_list";
  /** 대체 재료로 바꿔 담았으면 원래 재료 id */
  replacedFrom?: string;
}

/** key: 장 보는 날 (YYYY-MM-DD) */
export type ShoppingLists = Record<string, ShoppingItem[]>;

export interface AppState {
  onboarded: boolean;
  settings: StoreSettings;
  watchlist: string[];
  menus: Menu[];
  /** 시세 품목에 없어 사용자가 직접 입력한 재료 (시세 미연동) */
  customIngredients: Ingredient[];
  shoppingLists: ShoppingLists;
  /** 재료별로 고른 용량 (KAMIS 품종 코드). 없으면 기본 용량 */
  sizePrefs: Record<string, string>;
}
