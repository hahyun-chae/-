/** 한국 시간 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayKST(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatWon(v: number | null | undefined): string {
  if (v == null) return "-";
  return `${v.toLocaleString("ko-KR")}원`;
}

export function formatPct(v: number | null | undefined, digits = 0): string {
  if (v == null) return "-";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

export function formatDateShort(date: string): string {
  const [, m, d] = date.split("-");
  const day = ["일", "월", "화", "수", "목", "금", "토"][new Date(`${date}T00:00:00Z`).getUTCDay()];
  return `${Number(m)}/${Number(d)}(${day})`;
}

/**
 * 단위당 가격. 용량별 가격이 정비례하지 않으므로 곱해서 다른 용량 가격을 만들지 않고, 비교용으로만 쓴다.
 * "20kg" → kg당, "500g" → 100g당, "30구" → 1구당. 해석할 수 없는 단위면 null
 */
export function formatUnitPrice(price: number, unit: string): string | null {
  const m = unit.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|g|L|구|개|마리|장)$/);
  if (!m) return null;
  const qty = Number(m[1]);
  const u = m[2];
  if (u === "g") return `100g당 ${Math.round((price / qty) * 100).toLocaleString("ko-KR")}원`;
  const label = u === "kg" || u === "L" ? `${u}당` : `1${u}당`;
  return `${label} ${Math.round(price / qty).toLocaleString("ko-KR")}원`;
}

export function pctChange(now: number, before: number | null | undefined): number | null {
  if (!before) return null;
  return ((now - before) / before) * 100;
}
