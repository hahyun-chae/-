"use client";

import { CheckIcon, ShoppingCartIcon } from "lucide-react";
import { track } from "@/lib/analytics";
import { defaultListDate, listDayLabel } from "@/lib/shopping";
import { actions, useAppState } from "@/store/app-store";

/**
 * 재료 한 줄·상세에서 쓰는 장보기 담기 토글. 누르면 오늘/내일 목록에 담고, 다시 누르면 뺀다.
 * - icon: 목록 줄 끝의 아이콘 버튼 (관심 재료 별 옆)
 * - labeled: 재료 상세의 글자 버튼
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
  variant?: "icon" | "labeled";
}) {
  const app = useAppState();
  if (!app) return null;

  const date = defaultListDate();
  const day = listDayLabel(date);
  const item = (app.shoppingLists[date] ?? []).find((i) => i.ingredientId === ingredientId);

  const toggle = () => {
    if (item) {
      actions.removeShoppingItem(date, item.id);
      track("Shopping Item Removed", { ingredient_id: ingredientId, ingredient_name: name, from_recommendation: item.source === "recommendation" });
    } else {
      actions.addShoppingItem(date, { ingredientId, name, qty: "", source: "manual" });
      track("Shopping Item Added", { ingredient_id: ingredientId, ingredient_name: name, source, list_day: day });
    }
  };

  const label = item ? `${day} 장보기에서 빼기` : `${day} 장보기에 담기`;

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
        {item ? `${day} 장보기에 담김` : `${day} 장보기에 담기`}
      </button>
    );
  }

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
