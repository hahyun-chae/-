import { INGREDIENTS, KAMIS_CATEGORY_LABEL } from "../catalog";
import type { PriceBoard, PriceSnapshot, PriceType } from "../types";
import { shiftDate } from "../format";

// KAMIS Open API - 일별 부류별 도·소매가격 (dailyPriceByCategoryList)
// 부류마다 한 번씩 받아 item_code / kind_code로 재료와 맞춘다.
const ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do";

interface KamisItem {
  item_name: string;
  item_code: string;
  kind_name: string;
  kind_code: string;
  rank: string;
  rank_code: string;
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
  // KAMIS가 응답하지 않을 때 서버 함수가 시간 초과로 멈추지 않도록 끊는다
  const res = await fetch(`${ENDPOINT}?${params}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
  const json = await res.json();
  const items = json?.data?.item;
  if (Array.isArray(items)) return items;
  // 데이터가 없으면 data가 ["001"], 인증 정보가 비면 ["900"] 같은 오류 코드 배열로 온다. 001(조사 안 한 날)만 정상으로 본다
  const code = Array.isArray(json?.data) ? json.data[0] : json?.data?.error_code;
  if (code && code !== "001" && code !== "000") throw new Error(`KAMIS 오류 코드 ${code}`);
  return [];
}

/** 품종을 지정하지 않으면 그날 조사된 첫 품종. 등급은 상품(04)을 우선하고 없으면 첫 등급 */
function pick(items: KamisItem[], itemCode: string, kindCode?: string): KamisItem | undefined {
  const matches = items.filter((it) => it.item_code === itemCode && (!kindCode || it.kind_code === kindCode) && toNumber(it.dpr1));
  const kind = matches[0]?.kind_code;
  const sameKind = matches.filter((it) => it.kind_code === kind);
  return sameKind.find((it) => it.rank_code === "04") ?? sameKind[0];
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
  const categories = Object.keys(KAMIS_CATEGORY_LABEL);

  for (let back = 0; back <= 6; back++) {
    const date = shiftDate(today, -back);
    const errors: unknown[] = [];
    const results = await Promise.all(
      categories.map((c) =>
        fetchCategory(c, priceType, date, region).catch((e) => {
          errors.push(e);
          return [];
        }),
      ),
    );
    // 모든 부류가 실패했으면 '조사 안 한 날'이 아니라 연결 문제다. 더 거슬러 올라가지 않고 원인을 알린다
    if (errors.length === categories.length) {
      throw new Error(`KAMIS 연결 실패 (${date}): ${errors.map((e) => (e instanceof Error ? e.message : String(e))).join(", ")}`);
    }
    const byCategory = new Map(categories.map((c, i) => [c, results[i]]));
    if (results.every((r) => r.length === 0)) continue;

    const board: PriceBoard = {};
    for (const ing of INGREDIENTS) {
      if (!ing.kamis) continue;
      const { categoryCode, itemCode, kindCode, sizeKindCodes = [] } = ing.kamis;
      const rows = byCategory.get(categoryCode) ?? [];
      // 기본 용량이 오늘 조사되지 않았으면(도매 등) 조사된 다른 용량이 기본이 된다
      const sizes = [kindCode, ...sizeKindCodes].flatMap((code): PriceSnapshot[] => {
        const item = pick(rows, itemCode, code);
        const price = item && toNumber(item.dpr1);
        if (!item || !price) return [];
        return [
          {
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
            kindCode: item.kind_code,
          },
        ];
      });
      if (sizes.length === 0) continue;
      board[ing.id] = sizes.length > 1 ? { ...sizes[0], sizes } : sizes[0];
    }
    return board;
  }
  return {};
}
