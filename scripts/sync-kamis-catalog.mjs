// KAMIS 품목 카탈로그 동기화
// dailyPriceByCategoryList는 조사한 날에 나온 품종만 돌려주므로(계절 품종은 철마다 바뀜)
// 최근 1년을 한 달에 두 번씩 훑어 부류(대분류) › 품목(중분류) › 품종(소분류)을 모두 모은다.
//
// 사용법: npm run sync:kamis   (.env.local의 KAMIS_CERT_KEY / KAMIS_CERT_ID 필요)
// 결과: src/lib/kamis-catalog.json

import { writeFileSync } from "node:fs";

const ENDPOINT = "https://www.kamis.or.kr/service/price/xml.do";
const OUT = new URL("../src/lib/kamis-catalog.json", import.meta.url);
const CATEGORIES = { 100: "식량작물", 200: "채소류", 300: "특용작물", 400: "과일류", 500: "축산물", 600: "수산물" };
const PRICE_TYPES = { "01": "retail", "02": "wholesale" };

const { KAMIS_CERT_KEY, KAMIS_CERT_ID } = process.env;
if (!KAMIS_CERT_KEY || !KAMIS_CERT_ID) {
  console.error("KAMIS_CERT_KEY / KAMIS_CERT_ID가 없습니다. node --env-file=.env.local 로 실행하세요.");
  process.exit(1);
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

/** 최근 12개월의 매월 7일·21일 (주말이면 금요일로 당김) + 어제 */
function sampleDates() {
  const now = new Date();
  const dates = new Set();
  for (let m = 0; m < 12; m++) {
    for (const day of [7, 21]) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - m, day));
      if (d > now) continue;
      const dow = d.getUTCDay();
      if (dow === 6) d.setUTCDate(d.getUTCDate() - 1);
      if (dow === 0) d.setUTCDate(d.getUTCDate() - 2);
      dates.add(ymd(d));
    }
  }
  dates.add(ymd(new Date(now.getTime() - 86400000)));
  return [...dates].sort().reverse();
}

async function fetchCategory(cls, category, date) {
  const params = new URLSearchParams({
    action: "dailyPriceByCategoryList",
    p_product_cls_code: cls,
    p_item_category_code: category,
    p_country_code: "",
    p_regday: date,
    p_convert_kg_yn: "N",
    p_cert_key: KAMIS_CERT_KEY,
    p_cert_id: KAMIS_CERT_ID,
    p_returntype: "json",
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(30000) });
      const json = await res.json();
      const items = json?.data?.item;
      return Array.isArray(items) ? items : [];
    } catch {
      // 재시도
    }
  }
  console.warn(`  ! ${date} ${cls} ${category} 실패`);
  return [];
}

function toNumber(v) {
  if (typeof v !== "string") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "여름(고랭지)(1포기)" → "여름(고랭지)". 품종명이 품목명과 같으면 빈 문자열 */
function kindLabel(kindName, unit, itemName) {
  let label = kindName.trim();
  if (unit && label.endsWith(`(${unit})`)) label = label.slice(0, -(unit.length + 2)).trim();
  return label === itemName ? "" : label;
}

const kinds = new Map();
const dates = sampleDates();
console.log(`${dates.length}개 날짜 × ${Object.keys(CATEGORIES).length}개 부류 × 소매·도매 조회`);

// 최신 날짜부터 훑어서 이름·단위·참고가격은 가장 최근 값을 쓴다
for (const date of dates) {
  const jobs = Object.keys(PRICE_TYPES).flatMap((cls) =>
    Object.keys(CATEGORIES).map(async (category) => ({ cls, category, items: await fetchCategory(cls, category, date) })),
  );
  let rows = 0;
  for (const { cls, category, items } of await Promise.all(jobs)) {
    rows += items.length;
    for (const it of items) {
      const key = `${it.item_code}-${it.kind_code}`;
      const type = PRICE_TYPES[cls];
      const k = kinds.get(key) ?? {
        categoryCode: category,
        itemCode: it.item_code,
        itemName: it.item_name,
        kindCode: it.kind_code,
        kindName: kindLabel(it.kind_name, it.unit, it.item_name),
        units: {},
        refPrice: {},
      };
      k.units[type] ??= it.unit;
      const price = toNumber(it.dpr1);
      if (price && !k.refPrice[type]) k.refPrice[type] = price;
      kinds.set(key, k);
    }
  }
  console.log(`  ${date}: ${rows}행, 누적 품종 ${kinds.size}`);
}

const list = [...kinds.values()].sort(
  (a, b) => a.categoryCode.localeCompare(b.categoryCode) || a.itemCode.localeCompare(b.itemCode) || a.kindCode.localeCompare(b.kindCode),
);
const itemCount = new Set(list.map((k) => k.itemCode)).size;

writeFileSync(
  OUT,
  JSON.stringify({ syncedAt: ymd(new Date()), categories: CATEGORIES, kinds: list }, null, 1) + "\n",
);
console.log(`완료: 품목 ${itemCount}개, 품종 ${list.length}개 → src/lib/kamis-catalog.json`);
