import kamisCatalog from "./kamis-catalog.json";
import type { Ingredient, IngredientCategory } from "./types";

type KamisRef = NonNullable<Ingredient["kamis"]>;

/** kamis-catalog.json의 품종 한 줄 */
interface KamisKind {
  categoryCode: string;
  itemCode: string;
  itemName: string;
  kindCode: string;
  kindName: string;
  units: { retail?: string; wholesale?: string };
  refPrice: { retail?: number; wholesale?: number };
}

const KAMIS_KINDS = kamisCatalog.kinds as KamisKind[];

function kamis(categoryCode: string, itemCode: string, itemName: string, kindCode?: string, kindName?: string): KamisRef {
  return { categoryCode, itemCode, itemName, kindCode, kindName };
}

/**
 * 직접 고른 대표 재료. 온보딩 선택지와 메뉴 템플릿이 이 id를 쓰고, 사용자가 저장한 메뉴·관심 재료도 이 id를 가리키므로 바꾸지 않는다.
 * kindCode를 비워 둔 재료는 품목 대표 시세를 쓴다 (예: 배추는 계절마다 조사 품종이 바뀜).
 */
export const FEATURED_INGREDIENTS: Ingredient[] = [
  { id: "rice", name: "쌀", aliases: ["백미"], category: "grain", unit: "20kg", kamis: kamis("100", "111", "쌀", "01") },
  { id: "egg", name: "계란", aliases: ["달걀"], category: "meat", unit: "30구", kamis: kamis("500", "9903", "계란", "23", "특란") },
  { id: "pork-belly", name: "삼겹살", aliases: ["돼지고기"], category: "meat", unit: "100g", kamis: kamis("500", "4304", "돼지", "27", "삼겹살") },
  { id: "chicken", name: "닭고기", aliases: ["닭", "닭가슴살"], category: "meat", unit: "1kg", kamis: kamis("500", "9901", "닭", "99", "육계") },
  // KAMIS에는 불고기용 부위가 따로 없어 시세 미연동. 부위별 시세는 '소(설도)' 등으로 조회
  { id: "beef", name: "소고기 불고기용", aliases: ["소고기", "우둔"], category: "meat", unit: "100g" },
  { id: "napa-cabbage", name: "배추", aliases: [], category: "leafy", unit: "1포기", kamis: kamis("200", "211", "배추") },
  { id: "cabbage", name: "양배추", aliases: [], category: "leafy", unit: "1포기", kamis: kamis("200", "212", "양배추") },
  { id: "spinach", name: "시금치", aliases: [], category: "namul", unit: "100g", kamis: kamis("200", "213", "시금치") },
  { id: "lettuce", name: "상추", aliases: ["청상추", "적상추"], category: "leafy", unit: "100g", kamis: kamis("200", "214", "상추") },
  { id: "iceberg", name: "양상추", aliases: [], category: "leafy", unit: "1통" },
  { id: "romaine", name: "로메인", aliases: ["로메인상추"], category: "leafy", unit: "100g" },
  { id: "kale", name: "케일", aliases: [], category: "leafy", unit: "100g" },
  { id: "perilla", name: "깻잎", aliases: [], category: "leafy", unit: "50g", kamis: kamis("200", "253", "깻잎") },
  { id: "cucumber", name: "오이", aliases: [], category: "vegetable", unit: "10개", kamis: kamis("200", "223", "오이") },
  { id: "zucchini", name: "애호박", aliases: ["호박"], category: "vegetable", unit: "1개", kamis: kamis("200", "224", "호박", "01", "애호박") },
  { id: "carrot", name: "당근", aliases: [], category: "vegetable", unit: "1kg", kamis: kamis("200", "232", "당근", "01", "무세척(국산)") },
  { id: "radish", name: "무", aliases: [], category: "vegetable", unit: "1개", kamis: kamis("200", "231", "무") },
  { id: "onion", name: "양파", aliases: [], category: "vegetable", unit: "1kg", kamis: kamis("200", "245", "양파", "00") },
  { id: "green-onion", name: "대파", aliases: ["파"], category: "vegetable", unit: "1kg", kamis: kamis("200", "246", "파", "00", "대파") },
  { id: "garlic", name: "깐마늘", aliases: ["마늘"], category: "vegetable", unit: "1kg", kamis: kamis("200", "258", "깐마늘", "01", "국산") },
  { id: "chili", name: "풋고추", aliases: ["고추"], category: "vegetable", unit: "100g", kamis: kamis("200", "242", "풋고추", "00", "풋고추(녹광 등)") },
  { id: "paprika", name: "파프리카", aliases: [], category: "vegetable", unit: "1개", kamis: kamis("200", "256", "파프리카") },
  { id: "broccoli", name: "브로콜리", aliases: [], category: "vegetable", unit: "1개", kamis: kamis("200", "280", "브로콜리") },
  { id: "tomato", name: "토마토", aliases: [], category: "vegetable", unit: "1kg", kamis: kamis("200", "225", "토마토") },
  { id: "cherry-tomato", name: "방울토마토", aliases: [], category: "vegetable", unit: "1kg", kamis: kamis("200", "422", "방울토마토", "01") },
  { id: "potato", name: "감자", aliases: [], category: "vegetable", unit: "100g", kamis: kamis("100", "152", "감자") },
  { id: "sweet-potato", name: "고구마", aliases: [], category: "vegetable", unit: "1kg", kamis: kamis("100", "151", "고구마") },
  { id: "bean-sprout", name: "콩나물", aliases: [], category: "namul", unit: "1kg" },
  { id: "mung-sprout", name: "숙주", aliases: ["숙주나물"], category: "namul", unit: "1kg" },
  { id: "chwinamul", name: "취나물", aliases: [], category: "namul", unit: "100g" },
  { id: "amaranth", name: "비름나물", aliases: ["비름"], category: "namul", unit: "100g" },
  { id: "chard", name: "근대", aliases: [], category: "namul", unit: "100g" },
  { id: "bracken", name: "고사리", aliases: [], category: "namul", unit: "100g" },
  { id: "bellflower", name: "도라지", aliases: [], category: "namul", unit: "100g" },
  { id: "water-parsley", name: "미나리", aliases: [], category: "namul", unit: "100g", kamis: kamis("200", "252", "미나리") },
  { id: "oyster-mushroom", name: "느타리버섯", aliases: ["느타리"], category: "mushroom", unit: "100g", kamis: kamis("300", "315", "느타리버섯", "00") },
  { id: "king-mushroom", name: "새송이버섯", aliases: ["새송이"], category: "mushroom", unit: "100g", kamis: kamis("300", "317", "새송이버섯") },
  { id: "avocado", name: "아보카도", aliases: [], category: "fruit", unit: "1개", kamis: kamis("400", "430", "아보카도") },
  { id: "lemon", name: "레몬", aliases: [], category: "fruit", unit: "10개", kamis: kamis("400", "424", "레몬") },
  { id: "salmon", name: "연어", aliases: [], category: "seafood", unit: "100g" },
  { id: "tuna", name: "참치", aliases: [], category: "seafood", unit: "100g" },
  { id: "tofu", name: "두부", aliases: [], category: "etc", unit: "1모" },
];

export const KAMIS_CATEGORY_LABEL: Record<string, string> = kamisCatalog.categories;

/** KAMIS 부류·품목을 앱 분류로 옮긴다. 품목 코드 예외를 먼저 보고, 없으면 부류 기본값 */
const CATEGORY_BY_ITEM: Record<string, IngredientCategory> = {
  "151": "vegetable", "152": "vegetable", // 고구마, 감자
  "211": "leafy", "212": "leafy", "213": "namul", "214": "leafy", "215": "leafy", "216": "leafy", "233": "leafy",
  "252": "namul", "253": "leafy", "254": "leafy", "279": "leafy",
  "221": "fruit", "222": "fruit", "226": "fruit", "257": "fruit", // 수박, 참외, 딸기, 멜론
  "241": "seasoning", "248": "seasoning", // 건고추, 고춧가루
  "315": "mushroom", "316": "mushroom", "317": "mushroom",
  "650": "seasoning", "651": "seasoning", "652": "seasoning", // 새우젓, 멸치액젓, 천일염
};
const CATEGORY_BY_KAMIS: Record<string, IngredientCategory> = {
  "100": "grain", "200": "vegetable", "300": "nuts", "400": "fruit", "500": "meat", "600": "seafood",
};

// ── 표시 이름 규칙: "품목(품종)", 예: 쌀(햅쌀). 용량(20kg, 10구 등)은 이름에 넣지 않고 금액 옆 단위로만 보여준다 ──

/** KAMIS 품목명 중 화면에 그대로 쓰기 어색한 것 */
const ITEM_LABEL: Record<string, string> = {
  "258": "깐마늘", // 깐마늘(국산)
};

/** 품목명을 되풀이하거나 뜻이 바로 안 읽히는 품종명. key: `${itemCode}-${kindCode}` */
const KIND_LABEL: Record<string, string> = {
  "141-01": "국산", "141-03": "수입", // 흰 콩(국산)
  "142-00": "국산", "142-01": "수입", // 붉은 팥(국산)
  "144-01": "수입", // 메밀(수입)
  "258-03": "대서", "258-04": "대서 햇마늘", "258-05": "남도", // 깐마늘(대서)
  "315-01": "애느타리", // 애느타리버섯
  "422-02": "대추형", // 대추방울토마토
  "9908-01": "", // 흰우유
  "649-04": "부세(냉동)", // 부세수입(냉동)
  "659-01": "홍가리비", // 해만가리비(홍가리비)
  "665-00": "새꼬막(국산)", // 국산(새꼬막)
};

/** "20kg(햅쌀)" → "햅쌀", "20kg" → "", "특란10구" → "특란", "육계(kg)" → "육계", "생선" → "생물" */
function cleanKindLabel(k: KamisKind): string {
  const key = `${k.itemCode}-${k.kindCode}`;
  if (key in KIND_LABEL) return KIND_LABEL[key];
  const label = k.kindName
    .replace(/^\d+(\.\d+)?(kg|g|L)/, "")
    .replace(/\((kg|g|L)\)/g, "")
    .replace(/\d+구$/, "")
    .replace(/^\((.+)\)$/, "$1")
    .replace(/^생선$/, "생물")
    .trim();
  return label === k.itemName ? "" : label;
}

/** "쌀" + "햅쌀" → "쌀(햅쌀)". 품종명 안의 괄호는 가운뎃점으로 풀어 괄호가 겹치지 않게 한다: 배추(여름·고랭지) */
function displayName(item: string, kind: string): string {
  if (!kind) return item;
  return `${item}(${kind.replace(/\s*\(([^)]*)\)/g, "·$1")})`;
}

function itemLabel(itemCode: string, itemName: string): string {
  return ITEM_LABEL[itemCode] ?? itemName;
}

/**
 * 같은 품목에서 이름이 겹치는 품종(용량만 다른 쌀 10kg/20kg, 계란 10구/30구 등)은 한 재료의 용량 선택지로 묶는다.
 * 대표 재료가 차지한 이름이 먼저이고, 품목 대표 시세(kindCode 없음)는 품종명이 없는 이름("쌀")을 차지한다.
 */
const takenNames = new Map<string, KamisRef>(
  FEATURED_INGREDIENTS.flatMap((i) => {
    if (!i.kamis) return [];
    const ref = i.kamis;
    const kinds = KAMIS_KINDS.filter((k) => k.itemCode === ref.itemCode);
    // 품종을 지정했으면 그 품종, 품목 대표 시세인데 품종이 하나뿐이면 그 품종(예: 고구마(밤))도 같은 재료로 본다
    const claimed = ref.kindCode ? kinds.filter((k) => k.kindCode === ref.kindCode) : kinds.length === 1 ? kinds : [];
    return [`${ref.itemCode}|`, ...claimed.map((k) => `${ref.itemCode}|${cleanKindLabel(k)}`)].map((key) => [key, ref] as const);
  }),
);

/** KAMIS가 조사하는 나머지 품종 전체. scripts/sync-kamis-catalog.mjs로 만든 kamis-catalog.json에서 생성 */
export const KAMIS_INGREDIENTS: Ingredient[] = KAMIS_KINDS.flatMap((k) => {
  const kind = cleanKindLabel(k);
  const nameKey = `${k.itemCode}|${kind}`;
  const owner = takenNames.get(nameKey);
  if (owner) {
    // 이름이 같으면 용량만 다른 품종이다: 먼저 나온 재료의 다른 용량으로 붙인다 (품목 대표 시세는 제외)
    if (owner.kindCode && owner.kindCode !== k.kindCode) owner.sizeKindCodes = [...(owner.sizeKindCodes ?? []), k.kindCode];
    return [];
  }
  const item = itemLabel(k.itemCode, k.itemName);
  const ref = kamis(k.categoryCode, k.itemCode, item, k.kindCode, kind || undefined);
  takenNames.set(nameKey, ref);
  return [
    {
      id: `kamis-${k.itemCode}-${k.kindCode}`,
      name: displayName(item, kind),
      aliases: kind ? [kind] : [],
      category: CATEGORY_BY_ITEM[k.itemCode] ?? CATEGORY_BY_KAMIS[k.categoryCode] ?? "etc",
      unit: k.units.retail ?? k.units.wholesale ?? "",
      kamis: ref,
    },
  ];
});

export const INGREDIENTS: Ingredient[] = [...FEATURED_INGREDIENTS, ...KAMIS_INGREDIENTS];

/** 데모 시세의 기준 가격 (동기화 시점 KAMIS 소매가, 없으면 도매가) */
export const KAMIS_REF_PRICE = new Map(
  KAMIS_KINDS.map((k) => [`${k.itemCode}-${k.kindCode}`, k.refPrice.retail ?? k.refPrice.wholesale ?? null]),
);

export const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  grain: "곡물",
  leafy: "잎채소",
  vegetable: "채소",
  namul: "나물",
  mushroom: "버섯",
  fruit: "과일",
  meat: "축산",
  seafood: "수산",
  seasoning: "양념·젓갈",
  nuts: "견과·종실",
  etc: "기타",
};

export const CATEGORY_ORDER: IngredientCategory[] = [
  "grain", "leafy", "vegetable", "namul", "mushroom", "fruit", "meat", "seafood", "seasoning", "nuts", "etc",
];

/** "채소류 › 배추 › 봄" 형태의 KAMIS 분류 경로 */
export function kamisPath(i: Ingredient): string | null {
  if (!i.kamis) return null;
  return [KAMIS_CATEGORY_LABEL[i.kamis.categoryCode], i.kamis.itemName, i.kamis.kindName].filter(Boolean).join(" › ");
}

const BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient | undefined {
  return BY_ID.get(id);
}

export function ingredientName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
