import "server-only";
import { todayKST } from "../format";
import type { PriceBoard, PriceFallback, PriceType } from "../types";
import { getKamisBoard, isKamisConfigured } from "./kamis";
import { getMockBoard } from "./mock";

export interface PriceBoardResult {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  /** source가 MOCK일 때 그 이유 */
  fallback?: PriceFallback;
  priceType: PriceType;
  region: string;
}

/** KAMIS 인증 정보가 있으면 실제 시세를, 없거나 실패하면 데모 시세를 돌려준다. */
export async function getPriceBoard(
  priceType: PriceType = "retail",
  region = "",
): Promise<PriceBoardResult> {
  const today = todayKST();
  const mock = (fallback: PriceFallback): PriceBoardResult => ({ board: getMockBoard(today, priceType), source: "MOCK", fallback, priceType, region });
  if (!isKamisConfigured()) {
    console.warn("[prices] KAMIS_CERT_KEY / KAMIS_CERT_ID 환경변수가 없어 데모 시세를 씁니다.");
    return mock("no_key");
  }
  try {
    const board = await getKamisBoard(today, priceType, region);
    if (Object.keys(board).length > 0) return { board, source: "KAMIS", priceType, region };
    console.error("[prices] KAMIS 응답에 최근 7일 시세가 없어 데모 시세로 대체합니다.");
  } catch (e) {
    console.error("[prices] KAMIS 조회 실패, 데모 시세로 대체합니다.", e);
  }
  return mock("kamis_failed");
}
