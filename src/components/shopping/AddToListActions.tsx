"use client";

import { CheckIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { josaRo } from "@/lib/hangul";
import type { Decision } from "@/lib/recommend";
import { defaultListDate, listDayLabel } from "@/lib/shopping";
import { actions, useAppState } from "@/store/app-store";

type Choice = "substitute" | "as_is";

interface Option {
  key: string;
  label: string;
  choice: Choice;
  /** 목록에 담을 재료 (바꿔 담기면 대체 재료) */
  ingredientId: string;
  note?: string;
  primary?: boolean;
}

/**
 * 담기 방법. 대체 검토만 '어떤 재료를 살지'를 고르게 하고, 나머지는 '장보기에 담기' 하나다.
 * (얼마나 살지는 사장님이 장보기 목록에서 수량으로 정한다)
 */
function optionsFor(d: Decision, nameOf: (id: string) => string): Option[] {
  const name = nameOf(d.ingredientId);
  if (d.action === "substitute" && d.candidates.length > 0) {
    return [
      ...d.candidates.slice(0, 2).map(
        (c, i): Option => ({ key: `sub-${c.ingredientId}`, label: `${josaRo(nameOf(c.ingredientId))} 바꿔 담기`, choice: "substitute", ingredientId: c.ingredientId, note: `${name} 대신`, primary: i === 0 }),
      ),
      { key: "as_is", label: `${name} 담기`, choice: "as_is", ingredientId: d.ingredientId },
    ];
  }
  return [{ key: "as_is", label: "장보기에 담기", choice: "as_is", ingredientId: d.ingredientId, primary: true }];
}

/**
 * 판단 카드의 담기 버튼. 누르면 오늘/내일 장보기 목록에 바로 들어간다.
 * 담은 뒤에는 무엇을 담았는지 보여주고, 빼거나 목록으로 이동할 수 있다.
 */
export function AddToListActions({ decision: d, nameOf }: { decision: Decision; nameOf: (id: string) => string }) {
  const app = useAppState();
  if (!app) return null;

  const date = defaultListDate();
  const day = listDayLabel(date);
  const items = app.shoppingLists[date] ?? [];
  // 이 재료를 그대로 담았거나, 이 재료 대신 다른 재료로 바꿔 담은 항목
  const added = items.find((i) => i.ingredientId === d.ingredientId || i.replacedFrom === d.ingredientId);

  if (added) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 text-ink">
          <CheckIcon className="size-4 text-brand-700" />
          {day} 장보기에 <b>{added.name}</b>
          {added.note && <span className="text-muted-foreground">({added.note})</span>} 담았어요
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              actions.removeShoppingItem(date, added.id);
              track("Shopping Item Removed", { ingredient_id: added.ingredientId ?? null, ingredient_name: added.name, from_recommendation: added.source === "recommendation" });
            }}
          >
            빼기
          </button>
          <Link href="/shopping" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            목록 보기 →
          </Link>
        </span>
      </div>
    );
  }

  const add = (o: Option) => {
    const name = nameOf(o.ingredientId);
    actions.addShoppingItem(date, {
      ingredientId: o.ingredientId,
      name,
      qty: "",
      note: o.note,
      source: "recommendation",
      replacedFrom: o.choice === "substitute" ? d.ingredientId : undefined,
    });
    track("Shopping Item Added", {
      ingredient_id: o.ingredientId,
      ingredient_name: name,
      source: "recommendation",
      list_day: day,
      recommendation_action: d.action,
      choice: o.choice,
      replaced_from: o.choice === "substitute" ? d.ingredientId : undefined,
      price_change_pct: d.change == null ? null : Math.round(d.change * 10) / 10,
      candidate_ids: d.candidates.map((c) => c.ingredientId),
    });
  };

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-muted-foreground">{day} 장보기 목록에 담기</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`${nameOf(d.ingredientId)} 장보기 목록에 담기`}>
        {optionsFor(d, nameOf).map((o) => (
          <Button key={o.key} variant={o.primary ? "default" : "outline"} className="flex-1 sm:flex-none" onClick={() => add(o)}>
            {o.choice === "as_is" && o.primary && <ShoppingCartIcon data-icon="inline-start" />}
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
