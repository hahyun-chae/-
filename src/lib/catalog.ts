import type { Ingredient, IngredientCategory } from "./types";

// KAMIS 부류 코드: 100 식량작물, 200 채소류, 400 과일류, 500 축산물, 600 수산물
// itemName/kindName은 KAMIS 응답의 item_name/kind_name과 비교한다. 실제 연동 시 응답 값으로 다시 확인할 것.
export const INGREDIENTS: Ingredient[] = [
  { id: "rice", name: "쌀", aliases: ["백미"], category: "grain", unit: "20kg", kamis: { categoryCode: "100", itemName: "쌀" } },
  { id: "egg", name: "계란", aliases: ["달걀"], category: "meat", unit: "30구", kamis: { categoryCode: "500", itemName: "계란" } },
  { id: "pork-belly", name: "삼겹살", aliases: ["돼지고기"], category: "meat", unit: "100g", kamis: { categoryCode: "500", itemName: "돼지", kindName: "삼겹살" } },
  { id: "chicken", name: "닭고기", aliases: ["닭", "닭가슴살"], category: "meat", unit: "1kg", kamis: { categoryCode: "500", itemName: "닭" } },
  { id: "beef", name: "소고기 불고기용", aliases: ["소고기", "우둔"], category: "meat", unit: "100g", kamis: { categoryCode: "500", itemName: "소", kindName: "불고기" } },
  { id: "napa-cabbage", name: "배추", aliases: [], category: "leafy", unit: "1포기", kamis: { categoryCode: "200", itemName: "배추" } },
  { id: "cabbage", name: "양배추", aliases: [], category: "leafy", unit: "1포기", kamis: { categoryCode: "200", itemName: "양배추" } },
  { id: "spinach", name: "시금치", aliases: [], category: "namul", unit: "100g", kamis: { categoryCode: "200", itemName: "시금치" } },
  { id: "lettuce", name: "상추", aliases: ["청상추", "적상추"], category: "leafy", unit: "100g", kamis: { categoryCode: "200", itemName: "상추" } },
  { id: "iceberg", name: "양상추", aliases: [], category: "leafy", unit: "1통", kamis: { categoryCode: "200", itemName: "양상추" } },
  { id: "romaine", name: "로메인", aliases: ["로메인상추"], category: "leafy", unit: "100g" },
  { id: "kale", name: "케일", aliases: [], category: "leafy", unit: "100g", kamis: { categoryCode: "200", itemName: "케일" } },
  { id: "perilla", name: "깻잎", aliases: [], category: "leafy", unit: "100g", kamis: { categoryCode: "200", itemName: "깻잎" } },
  { id: "cucumber", name: "오이", aliases: [], category: "vegetable", unit: "10개", kamis: { categoryCode: "200", itemName: "오이" } },
  { id: "zucchini", name: "애호박", aliases: ["호박"], category: "vegetable", unit: "1개", kamis: { categoryCode: "200", itemName: "호박", kindName: "애호박" } },
  { id: "carrot", name: "당근", aliases: [], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "당근" } },
  { id: "radish", name: "무", aliases: [], category: "vegetable", unit: "1개", kamis: { categoryCode: "200", itemName: "무" } },
  { id: "onion", name: "양파", aliases: [], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "양파" } },
  { id: "green-onion", name: "대파", aliases: ["파"], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "파", kindName: "대파" } },
  { id: "garlic", name: "깐마늘", aliases: ["마늘"], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "깐마늘(국산)" } },
  { id: "chili", name: "풋고추", aliases: ["청양고추", "고추"], category: "vegetable", unit: "100g", kamis: { categoryCode: "200", itemName: "풋고추" } },
  { id: "paprika", name: "파프리카", aliases: [], category: "vegetable", unit: "200g", kamis: { categoryCode: "200", itemName: "파프리카" } },
  { id: "broccoli", name: "브로콜리", aliases: [], category: "vegetable", unit: "1개", kamis: { categoryCode: "200", itemName: "브로콜리" } },
  { id: "tomato", name: "토마토", aliases: [], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "토마토" } },
  { id: "cherry-tomato", name: "방울토마토", aliases: [], category: "vegetable", unit: "1kg", kamis: { categoryCode: "200", itemName: "방울토마토" } },
  { id: "potato", name: "감자", aliases: [], category: "vegetable", unit: "100g", kamis: { categoryCode: "100", itemName: "감자" } },
  { id: "sweet-potato", name: "고구마", aliases: [], category: "vegetable", unit: "1kg", kamis: { categoryCode: "100", itemName: "고구마" } },
  { id: "bean-sprout", name: "콩나물", aliases: [], category: "namul", unit: "1kg" },
  { id: "mung-sprout", name: "숙주", aliases: ["숙주나물"], category: "namul", unit: "1kg" },
  { id: "chwinamul", name: "취나물", aliases: [], category: "namul", unit: "100g" },
  { id: "amaranth", name: "비름나물", aliases: ["비름"], category: "namul", unit: "100g" },
  { id: "chard", name: "근대", aliases: [], category: "namul", unit: "100g" },
  { id: "bracken", name: "고사리", aliases: [], category: "namul", unit: "100g" },
  { id: "bellflower", name: "도라지", aliases: [], category: "namul", unit: "100g" },
  { id: "water-parsley", name: "미나리", aliases: [], category: "namul", unit: "100g", kamis: { categoryCode: "200", itemName: "미나리" } },
  { id: "oyster-mushroom", name: "느타리버섯", aliases: ["느타리"], category: "mushroom", unit: "100g", kamis: { categoryCode: "300", itemName: "느타리버섯" } },
  { id: "king-mushroom", name: "새송이버섯", aliases: ["새송이"], category: "mushroom", unit: "100g", kamis: { categoryCode: "300", itemName: "새송이버섯" } },
  { id: "avocado", name: "아보카도", aliases: [], category: "fruit", unit: "1개", kamis: { categoryCode: "400", itemName: "아보카도" } },
  { id: "lemon", name: "레몬", aliases: [], category: "fruit", unit: "10개", kamis: { categoryCode: "400", itemName: "레몬" } },
  { id: "salmon", name: "연어", aliases: [], category: "seafood", unit: "100g", kamis: { categoryCode: "600", itemName: "연어" } },
  { id: "tuna", name: "참치", aliases: [], category: "seafood", unit: "100g" },
  { id: "tofu", name: "두부", aliases: [], category: "etc", unit: "1모" },
];

export const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  grain: "곡물",
  leafy: "잎채소",
  vegetable: "채소",
  namul: "나물",
  mushroom: "버섯",
  fruit: "과일",
  meat: "축산",
  seafood: "수산",
  etc: "기타",
};

const BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function getIngredient(id: string): Ingredient | undefined {
  return BY_ID.get(id);
}

export function ingredientName(id: string): string {
  return BY_ID.get(id)?.name ?? id;
}
