import { pctChange } from "./format";
import type { PriceSnapshot, PriceStatus, Thresholds } from "./types";

export const DEFAULT_THRESHOLDS: Thresholds = { up: 5, surge: 15, aboveNormal: 20 };

/** 판단 기준은 1주 전 대비 등락률. 1주 전 값이 없으면 전일 대비로 대신한다. */
export function weekChange(s: PriceSnapshot): number | null {
  return pctChange(s.price, s.weekAgo) ?? pctChange(s.price, s.prevDay);
}

export function classify(change: number | null, t: Thresholds): PriceStatus {
  if (change == null) return "flat";
  if (change >= t.surge) return "surge";
  if (change >= t.up) return "up";
  if (change <= -t.surge) return "plunge";
  if (change <= -t.up) return "down";
  return "flat";
}

export function isAboveNormal(s: PriceSnapshot, t: Thresholds): boolean {
  const c = pctChange(s.price, s.normalYear);
  return c != null && c >= t.aboveNormal;
}

/** 정렬용 위험도. 클수록 위험 */
export const STATUS_RANK: Record<PriceStatus, number> = {
  surge: 4,
  up: 3,
  flat: 2,
  down: 1,
  plunge: 0,
};

/** 목록 표시 순서: 급등·상승 → 급락·하락 → 보합 → 시세 없음 (PRD F1-8) */
const DISPLAY_ORDER: Record<PriceStatus, number> = { surge: 0, up: 1, plunge: 2, down: 3, flat: 4 };

export function compareForDisplay(
  a: { status: PriceStatus | null; change: number | null },
  b: { status: PriceStatus | null; change: number | null },
): number {
  const oa = a.status ? DISPLAY_ORDER[a.status] : 5;
  const ob = b.status ? DISPLAY_ORDER[b.status] : 5;
  return oa - ob || Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0);
}

/**
 * 목록 표시 순서(id → 순위). 기본 용량 시세로 만든 판단을 넘겨, 용량 칩을 눌러도 재료 위치가 바뀌지 않게 한다.
 */
export function displayRank(baseDecisions: { ingredientId: string; status: PriceStatus | null; change: number | null }[]): Map<string, number> {
  return new Map([...baseDecisions].sort(compareForDisplay).map((d, i) => [d.ingredientId, i]));
}

export const STATUS_META: Record<PriceStatus, { label: string; icon: string }> = {
  surge: { label: "급등", icon: "▲▲" },
  up: { label: "상승", icon: "▲" },
  flat: { label: "보합", icon: "–" },
  down: { label: "하락", icon: "▼" },
  plunge: { label: "급락", icon: "▼▼" },
};
