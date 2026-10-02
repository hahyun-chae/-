import type { Menu } from "./types";

export type MenuTemplate = Omit<Menu, "id"> & { templateId: string };

/** 메뉴 등록·온보딩에서 고를 수 있는 메뉴 템플릿 */
export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    templateId: "bibimbap",
    name: "비빔밥",
    ingredients: [
      { ingredientId: "rice", role: "core" },
      { ingredientId: "egg", role: "core" },
      { ingredientId: "zucchini", role: "adjustable" },
      { ingredientId: "carrot", role: "adjustable" },
      { ingredientId: "bean-sprout", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-namul", name: "나물류", currentIngredientId: "spinach", optionIds: ["chwinamul", "amaranth", "chard"] },
    ],
  },
  {
    templateId: "bulgogi-bibimbap",
    name: "불고기 비빔밥",
    ingredients: [
      { ingredientId: "rice", role: "core" },
      { ingredientId: "beef", role: "core" },
      { ingredientId: "carrot", role: "adjustable" },
      { ingredientId: "green-onion", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-namul", name: "나물류", currentIngredientId: "spinach", optionIds: ["chwinamul", "chard", "bracken"] },
    ],
  },
  {
    templateId: "salmon-poke",
    name: "연어 포케",
    ingredients: [
      { ingredientId: "rice", role: "core" },
      { ingredientId: "salmon", role: "core" },
      { ingredientId: "avocado", role: "adjustable" },
      { ingredientId: "cucumber", role: "adjustable" },
      { ingredientId: "onion", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-leaf", name: "베이스 채소", currentIngredientId: "iceberg", optionIds: ["romaine", "kale", "lettuce", "cabbage"] },
    ],
  },
  {
    templateId: "chicken-salad",
    name: "닭가슴살 샐러드",
    ingredients: [
      { ingredientId: "chicken", role: "core" },
      { ingredientId: "cherry-tomato", role: "adjustable" },
      { ingredientId: "paprika", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-leaf", name: "베이스 채소", currentIngredientId: "iceberg", optionIds: ["romaine", "kale", "lettuce"] },
    ],
  },
  {
    templateId: "egg-sandwich",
    name: "에그 샌드위치",
    ingredients: [
      { ingredientId: "egg", role: "core" },
      { ingredientId: "tomato", role: "adjustable" },
      { ingredientId: "onion", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-leaf", name: "잎채소", currentIngredientId: "iceberg", optionIds: ["lettuce", "romaine", "cabbage"] },
    ],
  },
  {
    templateId: "namul-set",
    name: "오늘의 나물 반찬",
    ingredients: [{ ingredientId: "bean-sprout", role: "core" }],
    substituteGroups: [
      { id: "g-namul", name: "나물류", currentIngredientId: "spinach", optionIds: ["chwinamul", "amaranth", "chard", "water-parsley"] },
    ],
  },
  {
    templateId: "dosirak",
    name: "제육 도시락",
    ingredients: [
      { ingredientId: "rice", role: "core" },
      { ingredientId: "pork-belly", role: "core" },
      { ingredientId: "onion", role: "adjustable" },
      { ingredientId: "zucchini", role: "adjustable" },
    ],
    substituteGroups: [
      { id: "g-side", name: "곁들임 반찬", currentIngredientId: "perilla", optionIds: ["mung-sprout", "radish", "potato"] },
    ],
  },
];

/** KAMIS 지역 코드. 빈 값은 전국 평균. 연동 전에 코드 값을 공식 문서로 확인할 것. */
export const REGIONS: { code: string; label: string }[] = [
  { code: "", label: "전국 평균" },
  { code: "1101", label: "서울" },
  { code: "2100", label: "부산" },
  { code: "2200", label: "대구" },
  { code: "2300", label: "인천" },
  { code: "2401", label: "광주" },
  { code: "2501", label: "대전" },
  { code: "2601", label: "울산" },
];
