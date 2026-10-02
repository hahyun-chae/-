import { INGREDIENTS } from "../catalog";
import type { PriceBoard, PriceType } from "../types";

// KAMIS 인증키가 없을 때 쓰는 데모 시세.
// 날짜가 같으면 항상 같은 값이 나오도록 품목 id + 날짜로 시드를 만든다.

interface MockProfile {
  base: number; // 소매 기준 가격 (원)
  week: number; // 1주 전 대비 변동률
  month: number; // 1개월 전 대비 변동률
  normal: number; // 평년 대비 변동률
}

const PROFILES: Record<string, MockProfile> = {
  rice: { base: 54800, week: 0.01, month: 0.03, normal: 0.08 },
  egg: { base: 7200, week: 0.03, month: 0.06, normal: 0.12 },
  "pork-belly": { base: 2680, week: 0.02, month: 0.04, normal: 0.05 },
  chicken: { base: 6100, week: -0.02, month: 0.01, normal: 0.02 },
  beef: { base: 3900, week: 0.0, month: -0.02, normal: -0.04 },
  "napa-cabbage": { base: 4800, week: 0.09, month: 0.21, normal: 0.25 },
  cabbage: { base: 3900, week: -0.06, month: -0.11, normal: -0.03 },
  spinach: { base: 1580, week: 0.32, month: 0.48, normal: 0.41 },
  lettuce: { base: 1290, week: 0.11, month: 0.16, normal: 0.14 },
  iceberg: { base: 2950, week: 0.22, month: 0.3, normal: 0.27 },
  romaine: { base: 1650, week: 0.04, month: 0.06, normal: 0.03 },
  kale: { base: 1180, week: -0.03, month: -0.05, normal: -0.02 },
  perilla: { base: 2150, week: 0.18, month: 0.24, normal: 0.22 },
  cucumber: { base: 7900, week: -0.07, month: -0.12, normal: -0.05 },
  zucchini: { base: 1890, week: 0.12, month: 0.19, normal: 0.17 },
  carrot: { base: 4300, week: 0.02, month: 0.05, normal: 0.06 },
  radish: { base: 2400, week: -0.04, month: 0.02, normal: 0.01 },
  onion: { base: 2700, week: -0.17, month: -0.22, normal: -0.15 },
  "green-onion": { base: 3600, week: 0.06, month: 0.1, normal: 0.09 },
  garlic: { base: 11800, week: 0.01, month: 0.02, normal: -0.01 },
  chili: { base: 1480, week: 0.16, month: 0.2, normal: 0.23 },
  paprika: { base: 2100, week: -0.09, month: -0.14, normal: -0.06 },
  broccoli: { base: 2500, week: 0.07, month: 0.09, normal: 0.11 },
  tomato: { base: 6200, week: -0.09, month: -0.13, normal: -0.07 },
  "cherry-tomato": { base: 9800, week: -0.05, month: -0.08, normal: -0.02 },
  potato: { base: 420, week: 0.03, month: 0.05, normal: 0.04 },
  "sweet-potato": { base: 6300, week: -0.02, month: -0.04, normal: 0.0 },
  "bean-sprout": { base: 3100, week: 0.0, month: 0.01, normal: 0.0 },
  "mung-sprout": { base: 3400, week: 0.02, month: 0.02, normal: 0.01 },
  chwinamul: { base: 1350, week: -0.04, month: -0.06, normal: -0.03 },
  amaranth: { base: 1220, week: 0.02, month: 0.03, normal: 0.02 },
  chard: { base: 890, week: -0.08, month: -0.12, normal: -0.09 },
  bracken: { base: 2900, week: 0.01, month: 0.02, normal: 0.03 },
  bellflower: { base: 2300, week: 0.04, month: 0.05, normal: 0.06 },
  "water-parsley": { base: 1450, week: 0.13, month: 0.18, normal: 0.12 },
  "oyster-mushroom": { base: 780, week: -0.03, month: -0.02, normal: -0.04 },
  "king-mushroom": { base: 820, week: 0.0, month: 0.01, normal: 0.0 },
  avocado: { base: 2300, week: 0.05, month: 0.08, normal: 0.1 },
  lemon: { base: 8500, week: -0.02, month: 0.01, normal: 0.04 },
  salmon: { base: 4900, week: 0.08, month: 0.15, normal: 0.18 },
  tuna: { base: 3800, week: 0.01, month: 0.02, normal: 0.02 },
  tofu: { base: 2200, week: 0.0, month: 0.02, normal: 0.03 },
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** -1 ~ 1 사이의 결정적 노이즈 */
function noise(key: string): number {
  return hash(key) * 2 - 1;
}

function roundPrice(v: number): number {
  return v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v);
}

export function getMockBoard(date: string, priceType: PriceType): PriceBoard {
  const board: PriceBoard = {};
  // 도매가는 소매가의 약 65~75% 수준으로 가정
  const typeRatio = priceType === "wholesale" ? 0.7 : 1;

  for (const ing of INGREDIENTS) {
    const p = PROFILES[ing.id];
    if (!p) continue;
    const n = (k: string, amp: number) => 1 + noise(`${ing.id}:${date}:${k}`) * amp;

    const price = p.base * typeRatio * n("today", 0.02);
    const weekAgo = price / (1 + p.week);
    const dailyDrift = p.week / 5;

    board[ing.id] = {
      ingredientId: ing.id,
      priceType,
      date,
      unit: ing.unit,
      price: roundPrice(price),
      prevDay: roundPrice((price / (1 + dailyDrift)) * n("prev", 0.01)),
      weekAgo: roundPrice(weekAgo),
      twoWeeksAgo: roundPrice((weekAgo / (1 + (p.month - p.week) / 3)) * n("2w", 0.015)),
      monthAgo: roundPrice(price / (1 + p.month)),
      yearAgo: roundPrice((price / (1 + p.normal)) * n("year", 0.08)),
      normalYear: roundPrice(price / (1 + p.normal)),
      source: "MOCK",
    };
  }
  return board;
}
