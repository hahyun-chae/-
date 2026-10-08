"use client";

import { CheckIcon, RotateCcwIcon, Trash2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { formatWon } from "@/lib/format";
import { buildDecisions, type Decision } from "@/lib/recommend";
import type { ShoppingItem } from "@/lib/types";
import { actions } from "@/store/app-store";
import { useDecisions } from "@/store/use-decisions";
import { IngredientPicker } from "../ingredients/IngredientPicker";
import { ChangeText, StatusBadge } from "../ui/Badges";
import { LoadingBlock, PageHeader, SectionTitle } from "../ui/common";
import { AddToListActions } from "./AddToListActions";

/** 아직 목록에 반영하지 않은 '먼저 확인할 재료' 한 줄 */
function PendingDecision({ decision: d, nameOf }: { decision: Decision; nameOf: (id: string) => string }) {
  return (
    <li className="px-5 py-4 sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/ingredients/${d.ingredientId}`} className="flex items-center gap-2 font-semibold text-ink hover:underline">
          {nameOf(d.ingredientId)}
          <StatusBadge status={d.status} size="sm" />
        </Link>
        <span className="text-sm">
          <ChangeText value={d.change} status={d.status} />
          <span className="ml-1 text-xs text-muted-foreground">1주 전 대비</span>
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{d.reason}</p>
      <AddToListActions decision={d} nameOf={nameOf} />
    </li>
  );
}

function ItemRow({ item, decision }: { item: ShoppingItem; decision?: Decision }) {
  const s = decision?.snapshot;
  const fromRecommendation = item.source === "recommendation";
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={`${item.name} 샀어요`}
        onClick={() => {
          actions.updateShoppingItem(item.id, { checked: !item.checked });
          track("Shopping Item Checked", {
            ingredient_id: item.ingredientId ?? null,
            ingredient_name: item.name,
            checked: !item.checked,
            from_recommendation: fromRecommendation,
            replaced: Boolean(item.replacedFrom),
          });
        }}
        className="grid size-11 shrink-0 place-items-center"
      >
        <span className={`grid size-6 place-items-center rounded-md border-2 transition-colors ${item.checked ? "border-brand-600 bg-brand-600 text-white" : "border-slate-400"}`}>
          {item.checked && <CheckIcon className="size-4" strokeWidth={3} />}
        </span>
      </button>

      <div className={`min-w-0 flex-1 ${item.checked ? "opacity-50" : ""}`}>
        <p className="flex flex-wrap items-center gap-x-2">
          <span className={`font-semibold text-ink ${item.checked ? "line-through" : ""}`}>{item.name}</span>
          {item.note && <span className="text-xs text-launch-orange">{item.note}</span>}
        </p>
        <p className="tabular text-xs text-muted-foreground">
          {s ? (
            <>
              <span className="whitespace-nowrap">{formatWon(s.price)} / {s.unit}</span>{" "}
              <ChangeText value={decision.change} status={decision.status} className="text-xs" />
            </>
          ) : (
            "시세 정보 없음"
          )}
        </p>
      </div>

      <input
        value={item.qty}
        onChange={(e) => actions.updateShoppingItem(item.id, { qty: e.target.value })}
        placeholder="수량"
        aria-label={`${item.name} 수량`}
        className="h-11 w-20 shrink-0 rounded-lg border border-input bg-canvas/60 px-3 text-center text-sm text-ink placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`${item.name} 빼기`}
        onClick={() => {
          actions.removeShoppingItem(item.id);
          track("Shopping Item Removed", { ingredient_id: item.ingredientId ?? null, ingredient_name: item.name, from_recommendation: fromRecommendation });
        }}
        className="grid size-11 shrink-0 place-items-center rounded-lg text-steel hover:bg-control hover:text-ink"
      >
        <XIcon className="size-4" />
      </button>
    </li>
  );
}

/**
 * 장보기 목록 (날짜 구분 없이 하나). 영업 후 살 것을 적어 두고, 장 볼 때 체크한다.
 * 체크해도 항목 위치는 그대로 둔다 (장 보는 중에 순서가 바뀌지 않게).
 * 다 사면 '산 것 지우기', 매일 비슷한 걸 사면 '체크 모두 풀기'로 같은 목록을 다시 쓴다.
 */
export function ShoppingView() {
  const data = useDecisions();
  if (!data) return <LoadingBlock />;

  const { app, prices, decisions, nameOf } = data;
  const items = app.shoppingList;
  const checked = items.filter((i) => i.checked).length;
  // 검색해서 담은 재료는 관심 재료가 아닐 수 있어 목록 재료의 시세를 따로 계산한다
  const itemIds = items.flatMap((i) => (i.ingredientId ? [i.ingredientId] : []));
  const decisionOf = new Map(buildDecisions(itemIds, app.menus, prices.board, app.settings.thresholds, nameOf).map((d) => [d.ingredientId, d]));
  const inList = (d: Decision) => items.some((i) => i.ingredientId === d.ingredientId || i.replacedFrom === d.ingredientId);
  const pending = decisions.filter((d) => ["substitute", "adjust", "caution"].includes(d.action) && !inList(d));

  const reset = (mode: "clear_checked" | "uncheck_all") => {
    if (mode === "clear_checked") actions.clearCheckedShoppingItems();
    else actions.uncheckAllShoppingItems();
    track("Shopping List Reset", { mode, item_count: checked });
  };

  return (
    <>
      <PageHeader title="장보기" description={items.length ? `${items.length}개 중 ${checked}개 샀어요` : "영업 후 살 것을 적어 두고, 장 볼 때 체크하세요"} />

      <div className="space-y-10">
        {pending.length > 0 && (
          <section>
            <SectionTitle count={pending.length} hint="오늘 시세 기준">
              판단 반영하기
            </SectionTitle>
            <ul className="card divide-y divide-slate-100">
              {pending.map((d) => (
                <PendingDecision key={d.ingredientId} decision={d} nameOf={nameOf} />
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionTitle count={items.length}>살 것</SectionTitle>
          <div className="mb-3">
            <IngredientPicker
              placeholder="재료 검색해서 담기 (예: 양파, ㅇㅍ)"
              exclude={itemIds}
              custom={app.customIngredients}
              source="shopping"
              onPick={(id) => {
                const name = nameOf(id);
                actions.addShoppingItem({ ingredientId: id, name, qty: "", source: "manual" });
                track("Shopping Item Added", { ingredient_id: id, ingredient_name: name, source: "manual" });
              }}
            />
          </div>

          {items.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-10 text-center">
              <p className="text-lg font-medium text-ink">아직 담은 재료가 없어요</p>
              <p className="mt-1 text-sm text-muted-foreground">위에서 검색하거나, 재료 시세·오늘 판단에서 🛒를 눌러 담을 수 있어요.</p>
            </div>
          ) : (
            <>
              <ul className="card divide-y divide-slate-100">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} decision={item.ingredientId ? decisionOf.get(item.ingredientId) : undefined} />
                ))}
              </ul>
              {checked > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => reset("clear_checked")}>
                    <Trash2Icon data-icon="inline-start" />
                    산 것 지우기 ({checked}개)
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => reset("uncheck_all")}>
                    <RotateCcwIcon data-icon="inline-start" />
                    체크 모두 풀기
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
