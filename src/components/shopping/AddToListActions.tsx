"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { josaRo } from "@/lib/hangul";
import type { Decision } from "@/lib/recommend";
import { defaultListDate, listDayLabel } from "@/lib/shopping";
import { actions, useAppState } from "@/store/app-store";

type Choice = "substitute" | "reduce" | "needed_only" | "as_is";

interface Option {
  key: string;
  label: string;
  choice: Choice;
  /** 목록에 담을 재료 (바꿔 담기면 대체 재료) */
  ingredientId: string;
  note?: string;
  primary?: boolean;
}

/** 추천 행동마다 사장님이 고를 수 있는 담기 방법 */
function optionsFor(d: Decision, nameOf: (id: string) => string): Option[] {
  const asIs: Option = { key: "as_is", label: "그대로 담기", choice: "as_is", ingredientId: d.ingredientId };
  switch (d.action) {
    case "substitute":
      if (d.candidates.length === 0) {
        return [{ key: "needed", label: "필요량만 담기", choice: "needed_only", ingredientId: d.ingredientId, note: "필요한 만큼만", primary: true }, asIs];
      }
      return [
        ...d.candidates.slice(0, 2).map(
          (c, i): Option => ({ key: `sub-${c.ingredientId}`, label: `${josaRo(nameOf(c.ingredientId))} 바꿔 담기`, choice: "substitute", ingredientId: c.ingredientId, note: `${nameOf(d.ingredientId)} 대신`, primary: i === 0 }),
        ),
        asIs,
      ];
    case "adjust":
      return [{ key: "reduce", label: "양 줄여 담기", choice: "reduce", ingredientId: d.ingredientId, note: "평소보다 적게", primary: true }, asIs];
    case "caution":
      return [{ key: "needed", label: "필요량만 담기", choice: "needed_only", ingredientId: d.ingredientId, note: "필요한 만큼만", primary: true }, asIs];
    default:
      return [asIs];
  }
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
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
