"use client";

import { CheckIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { actions, useAppState } from "@/store/app-store";

/**
 * 장보기 담기 토글. 누르면 장보기 목록에 담고, 다시 누르면 뺀다.
 * - icon: 재료 목록 줄 끝의 아이콘 버튼 (관심 재료 별 옆)
 * - labeled: 재료 상세의 테두리 버튼
 * - button: 오늘 판단 '구매 기회'처럼 담기를 권하는 곳의 파란 버튼 (먼저 확인할 재료 카드와 같은 모양)
 */
export function AddToListButton({
  ingredientId,
  name,
  source,
  variant = "icon",
}: {
  ingredientId: string;
  name: string;
  source: "price_row" | "ingredient_detail";
  variant?: "icon" | "labeled" | "button";
}) {
  const app = useAppState();
  if (!app) return null;

  const item = app.shoppingList.find((i) => i.ingredientId === ingredientId);

  const toggle = () => {
    if (item) {
      actions.removeShoppingItem(item.id);
      track("Shopping Item Removed", { ingredient_id: ingredientId, ingredient_name: name, from_recommendation: item.source === "recommendation" });
    } else {
      actions.addShoppingItem({ ingredientId, name, qty: "", source: "manual" });
      track("Shopping Item Added", { ingredient_id: ingredientId, ingredient_name: name, source });
    }
  };

  if (variant === "button") {
    return (
      <Button variant={item ? "outline" : "default"} aria-pressed={Boolean(item)} className="flex-1 sm:flex-none" onClick={toggle}>
        {item ? <CheckIcon data-icon="inline-start" className="text-brand-700" /> : <ShoppingCartIcon data-icon="inline-start" />}
        {item ? "장보기에 담김" : "장보기에 담기"}
      </Button>
    );
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        aria-pressed={Boolean(item)}
        onClick={toggle}
        className={`inline-flex h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
          item ? "border-brand-600 bg-brand-50 text-ink" : "border-input text-ink hover:bg-muted"
        }`}
      >
        {item ? <CheckIcon className="size-4 text-brand-700" /> : <ShoppingCartIcon className="size-4" />}
        {item ? "장보기에 담김" : "장보기에 담기"}
      </button>
    );
  }

  const label = item ? "장보기에서 빼기" : "장보기에 담기";
  return (
    <button
      type="button"
      aria-pressed={Boolean(item)}
      aria-label={`${name} ${label}`}
      title={label}
      onClick={toggle}
      className={`relative grid size-11 shrink-0 place-items-center rounded-lg transition-colors ${
        item ? "text-brand-700 hover:bg-muted" : "text-steel hover:bg-muted hover:text-ink"
      }`}
    >
      <ShoppingCartIcon className="size-[21px]" />
      {item && (
        <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-brand-600 text-white">
          <CheckIcon className="size-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
