"use client";

import { track } from "@/lib/analytics";
import { formatUnitPrice, formatWon } from "@/lib/format";
import type { PriceSnapshot } from "@/lib/types";
import { actions } from "@/store/app-store";

/**
 * 용량 선택 (쌀 20kg/10kg 등). 용량마다 KAMIS가 따로 조사한 실제 가격을 보여주고, 곱해서 만들지 않는다.
 * - detail: 재료 상세. 용량별 가격과 단위당 가격을 함께 보여준다
 * - compact: 재료 목록 한 줄 안. 용량만 보여주고, 고르면 줄의 가격이 바뀐다
 */
export function SizePicker({
  ingredientId,
  snapshot,
  variant,
}: {
  ingredientId: string;
  snapshot: PriceSnapshot;
  variant: "detail" | "compact";
}) {
  if (!snapshot.sizes) return null;

  const choose = (size: PriceSnapshot) => {
    if (!size.kindCode || size.kindCode === snapshot.kindCode) return;
    actions.setSizePref(ingredientId, size.kindCode);
    track("Ingredient Size Selected", { ingredient_id: ingredientId, unit: size.unit, source: variant === "detail" ? "ingredient_detail" : "price_row" });
  };

  if (variant === "compact") {
    return (
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="용량 선택">
        {snapshot.sizes.map((size) => {
          const selected = size.kindCode === snapshot.kindCode;
          return (
            <button
              key={size.kindCode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(size)}
              // 보이는 크기는 작게, 누르는 영역은 위아래로 넓혀 44px에 가깝게
              className={`relative h-8 rounded-md border px-3 font-mono text-xs font-semibold transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0 ${
                selected ? "border-brand-600 bg-brand-50 text-ink" : "border-hairline text-steel hover:bg-control hover:text-ink"
              }`}
            >
              {size.unit}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <p className="label">용량 선택</p>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="용량 선택">
        {snapshot.sizes.map((size) => {
          const selected = size.kindCode === snapshot.kindCode;
          const unitPrice = formatUnitPrice(size.price, size.unit);
          return (
            <button
              key={size.kindCode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(size)}
              className={`flex items-baseline justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                selected ? "border-brand-600 bg-brand-50" : "border-hairline hover:bg-control"
              }`}
            >
              <span className="font-semibold text-ink">{size.unit}</span>
              <span className="tabular text-right">
                <span className="font-semibold text-ink">{formatWon(size.price)}</span>
                {unitPrice && <span className="ml-2 font-mono text-xs text-steel">{unitPrice}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        용량마다 KAMIS가 따로 조사한 실제 가격이에요. 큰 용량일수록 단위당 가격이 달라서 작은 용량 가격을 곱해 계산하면 맞지 않아요.
      </p>
    </div>
  );
}
