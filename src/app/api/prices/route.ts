import { getPriceBoard } from "@/lib/prices";
import type { PriceType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priceType: PriceType = searchParams.get("type") === "wholesale" ? "wholesale" : "retail";
  const region = searchParams.get("region") ?? "";
  const result = await getPriceBoard(priceType, region);
  return Response.json(result, {
    headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=3600" },
  });
}
