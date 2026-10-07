import { getPriceBoard } from "@/lib/prices";
import type { PriceType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceType: PriceType = searchParams.get("type") === "wholesale" ? "wholesale" : "retail";
  const region = searchParams.get("region") ?? "";
  const result = await getPriceBoard(priceType, region);
  // KAMIS 연결에 실패한 결과는 캐시하지 않아 다음 요청에서 다시 시도한다
  const cacheControl = result.fallback === "kamis_failed" ? "no-store" : "public, max-age=600, stale-while-revalidate=3600";
  return Response.json(result, { headers: { "Cache-Control": cacheControl } });
}
