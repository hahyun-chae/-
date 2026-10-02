import { INGREDIENTS } from "../catalog";
import type { PriceBoard, PriceType } from "../types";
import { shiftDate } from "../format";

// KAMIS Open API - 일별 부류별 도·소매가격 (dailyPriceByCategoryList)
// 필드 의미(dpr1~dpr7)와 코드 값은 KAMIS 공식 문서 기준으로 연동 전에 다시 확인할 것.
const ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do";

interface KamisItem {
  item_name: string;
  kind_name: string;
  rank: string;
  unit: string;
  dpr1: string; // 당일
  dpr2: string; // 1일 전
  dpr3: string; // 1주일 전
  dpr4: string; // 2주일 전
  dpr5: string; // 1개월 전
  dpr6: string; // 1년 전
  dpr7: string; // 일평년
}

function toNumber(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function fetchCategory(
  categoryCode: string,
  priceType: PriceType,
  date: string,
  region: string,
): Promise<KamisItem[]> {
  const params = new URLSearchParams({
    action: "dailyPriceByCategoryList",
    p_product_cls_code: priceType === "retail" ? "01" : "02",
    p_item_category_code: categoryCode,
    p_country_code: region,
    p_regday: date,
    p_convert_kg_yn: "N",
    p_cert_key: process.env.KAMIS_CERT_KEY ?? "",
    p_cert_id: process.env.KAMIS_CERT_ID ?? "",
    p_returntype: "json",
  });
  const res = await fetch(`${ENDPOINT}?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`KAMIS ${res.status}`);
  const json = await res.json();
  const items = json?.data?.item;
  return Array.isArray(items) ? items : [];
}

function pick(items: KamisItem[], itemName: string, kindName?: string): KamisItem | undefined {
  const matches = items.filter(
    (it) => it.item_name === itemName && (!kindName || it.kind_name?.includes(kindName)),
  );
  return matches.find((it) => it.rank === "상품") ?? matches[0];
}

export function isKamisConfigured(): boolean {
  return Boolean(process.env.KAMIS_CERT_KEY && process.env.KAMIS_CERT_ID);
}

/**
 * 오늘부터 최대 6일 전까지 거슬러 올라가며 데이터가 있는 가장 최근 조사일의 시세를 가져온다.
 * (주말·공휴일은 조사하지 않음)
 */
export async function getKamisBoard(
  today: string,
  priceType: PriceType,
  region: string,
): Promise<PriceBoard> {
  const categories = [
    ...new Set(INGREDIENTS.flatMap((i) => (i.kamis ? [i.kamis.categoryCode] : []))),
  ];

  for (let back = 0; back <= 6; back++) {
    const date = shiftDate(today, -back);
    const results = await Promise.all(
      categories.map((c) => fetchCategory(c, priceType, date, region).catch(() => [])),
    );
    const byCategory = new Map(categories.map((c, i) => [c, results[i]]));
    if (results.every((r) => r.length === 0)) continue;

    const board: PriceBoard = {};
    for (const ing of INGREDIENTS) {
      if (!ing.kamis) continue;
      const item = pick(byCategory.get(ing.kamis.categoryCode) ?? [], ing.kamis.itemName, ing.kamis.kindName);
      const price = item && toNumber(item.dpr1);
      if (!item || !price) continue;
      board[ing.id] = {
        ingredientId: ing.id,
        priceType,
        date,
        unit: item.unit || ing.unit,
        price,
        prevDay: toNumber(item.dpr2),
        weekAgo: toNumber(item.dpr3),
        twoWeeksAgo: toNumber(item.dpr4),
        monthAgo: toNumber(item.dpr5),
        yearAgo: toNumber(item.dpr6),
        normalYear: toNumber(item.dpr7),
        source: "KAMIS",
      };
    }
    return board;
  }
  return {};
}
