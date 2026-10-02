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

export function pctChange(now: number, before: number | null | undefined): number | null {
  if (!before) return null;
  return ((now - before) / before) * 100;
}
