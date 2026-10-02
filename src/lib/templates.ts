import type { BusinessType, Menu } from "./types";

export const BUSINESS_TYPES: { id: BusinessType; label: string; desc: string }[] = [
  { id: "bibimbap", label: "비빔밥·한식", desc: "비빔밥, 한정식, 백반" },
  { id: "salad", label: "샐러드·포케", desc: "샐러드, 포케, 볼 메뉴" },
  { id: "sandwich", label: "샌드위치", desc: "샌드위치, 브런치" },
  { id: "banchan", label: "반찬·도시락", desc: "반찬가게, 도시락 매장" },
  { id: "etc", label: "기타", desc: "직접 고를게요" },
];

/** 업종별 추천 관심 재료 */
export const WATCH_PRESETS: Record<BusinessType, string[]> = {
  bibimbap: ["rice", "egg", "spinach", "bean-sprout", "zucchini", "carrot", "bracken", "chwinamul", "chard", "amaranth", "beef", "green-onion"],
  salad: ["iceberg", "romaine", "kale", "lettuce", "cherry-tomato", "cucumber", "avocado", "paprika", "salmon", "tuna", "chicken", "onion", "lemon"],
  sandwich: ["iceberg", "lettuce", "tomato", "cucumber", "onion", "egg", "chicken", "avocado", "paprika", "cabbage"],
  banchan: ["spinach", "bean-sprout", "mung-sprout", "radish", "zucchini", "perilla", "napa-cabbage", "chwinamul", "chard", "amaranth", "bellflower", "potato", "egg", "tofu", "pork-belly", "chili"],
  etc: ["onion", "green-onion", "garlic", "egg", "rice"],
};

type MenuTemplate = Omit<Menu, "id"> & { templateId: string };

export const MENU_TEMPLATES: Record<BusinessType, MenuTemplate[]> = {
  bibimbap: [
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
  ],
  salad: [
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
  ],
  sandwich: [
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
  ],
  banchan: [
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
  ],
  etc: [],
};

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
