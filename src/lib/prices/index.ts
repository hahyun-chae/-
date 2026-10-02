import "server-only";
import { todayKST } from "../format";
import type { PriceBoard, PriceType } from "../types";
import { getKamisBoard, isKamisConfigured } from "./kamis";
import { getMockBoard } from "./mock";

export interface PriceBoardResult {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  priceType: PriceType;
  region: string;
}

/** KAMIS 인증 정보가 있으면 실제 시세를, 없거나 실패하면 데모 시세를 돌려준다. */
export async function getPriceBoard(
  priceType: PriceType = "retail",
  region = "",
): Promise<PriceBoardResult> {
  const today = todayKST();
  if (isKamisConfigured()) {
    try {
      const board = await getKamisBoard(today, priceType, region);
      if (Object.keys(board).length > 0) return { board, source: "KAMIS", priceType, region };
    } catch (e) {
      console.error("[prices] KAMIS 조회 실패, 데모 시세로 대체합니다.", e);
    }
  }
  return { board: getMockBoard(today, priceType), source: "MOCK", priceType, region };
}
