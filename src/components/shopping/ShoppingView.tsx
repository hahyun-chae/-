"use client";

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { shiftDate, formatDateShort, formatWon, todayKST } from "@/lib/format";
import { buildDecisions, type Decision } from "@/lib/recommend";
import { defaultListDate, findItem, listDayLabel, previousListDate } from "@/lib/shopping";
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

function ItemRow({ item, date, decision }: { item: ShoppingItem; date: string; decision?: Decision }) {
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
          actions.updateShoppingItem(date, item.id, { checked: !item.checked });
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
        onChange={(e) => actions.updateShoppingItem(date, item.id, { qty: e.target.value })}
        placeholder="수량"
        aria-label={`${item.name} 수량`}
        className="h-11 w-20 shrink-0 rounded-lg border border-input bg-canvas/60 px-3 text-center text-sm text-ink placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`${item.name} 빼기`}
        onClick={() => {
          actions.removeShoppingItem(date, item.id);
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
 * 장보기 목록. 영업 후 밤에 내일 살 것을 적고, 아침에 보면서 체크한다.
 * 체크해도 항목 위치는 그대로 둔다 (장 보는 중에 순서가 바뀌지 않게).
 */
export function ShoppingView() {
  const data = useDecisions();
  const [date, setDate] = useState(defaultListDate);
  if (!data) return <LoadingBlock />;

  const { app, prices, decisions, nameOf } = data;
  const today = todayKST();
  const day = listDayLabel(date);
  const items = app.shoppingLists[date] ?? [];
  const checked = items.filter((i) => i.checked).length;
  // 검색해서 담은 재료는 관심 재료가 아닐 수 있어 목록 재료의 시세를 따로 계산한다
  const itemIds = items.flatMap((i) => (i.ingredientId ? [i.ingredientId] : []));
  const decisionOf = new Map(buildDecisions(itemIds, app.menus, prices.board, app.settings.thresholds, nameOf).map((d) => [d.ingredientId, d]));
  const inList = (d: Decision) => items.some((i) => i.ingredientId === d.ingredientId || i.replacedFrom === d.ingredientId);
  // 담기 버튼은 기본 목록(오늘/내일)에 담으므로, 지금 보는 목록이 기본 목록일 때만 판단 반영 칸을 보여준다
  const pending = date === defaultListDate() ? decisions.filter((d) => ["substitute", "adjust", "caution"].includes(d.action) && !inList(d)) : [];
  const prevDate = previousListDate(app.shoppingLists, date);
  const prevCount = prevDate ? app.shoppingLists[prevDate].length : 0;
  // 지난 목록 중 지금 목록에 없는 재료 수 (다 불러왔으면 버튼을 숨긴다)
  const missingCount = prevDate ? app.shoppingLists[prevDate].filter((i) => !findItem(items, i.ingredientId, i.name)).length : 0;

  const copyPrevious = () => {
    if (!prevDate) return;
    const count = actions.copyShoppingList(prevDate, date);
    track("Shopping List Copied", { from_date: prevDate, to_date: date, item_count: count });
  };

  return (
    <>
      <PageHeader
        title={`${day} 장보기`}
        description={`${formatDateShort(date)} · ${items.length ? `${items.length}개 중 ${checked}개 샀어요` : "영업 후 적어 두고, 장 볼 때 체크하세요"}`}
      />

      <div className="mb-8 flex gap-2" role="radiogroup" aria-label="목록 날짜">
        {[today, shiftDate(today, 1)].map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={d === date}
            onClick={() => setDate(d)}
            className={`h-11 rounded-lg border px-4 text-[15px] transition-colors ${d === date ? "border-brand-600 bg-brand-50 font-semibold text-ink" : "border-hairline text-steel hover:bg-control hover:text-ink"}`}
          >
            {listDayLabel(d)} <span className="font-mono text-xs">{formatDateShort(d)}</span>
          </button>
        ))}
      </div>

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
              exclude={items.flatMap((i) => (i.ingredientId ? [i.ingredientId] : []))}
              custom={app.customIngredients}
              source="shopping"
              onPick={(id) => {
                const name = nameOf(id);
                actions.addShoppingItem(date, { ingredientId: id, name, qty: "", source: "manual" });
                track("Shopping Item Added", { ingredient_id: id, ingredient_name: name, source: "manual", list_day: day });
              }}
            />
          </div>

          {items.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-10 text-center">
              <p className="text-lg font-medium text-ink">아직 담은 재료가 없어요</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {prevDate ? "지난번 목록을 불러와서 고치면 금방 끝나요." : "위에서 검색하거나, 오늘 판단 카드에서 바로 담을 수 있어요."}
              </p>
              {prevDate && (
                <Button className="mt-5" onClick={copyPrevious}>
                  <CopyIcon data-icon="inline-start" />
                  {formatDateShort(prevDate)} 목록 불러오기 ({prevCount}개)
                </Button>
              )}
            </div>
          ) : (
            <>
              <ul className="card divide-y divide-slate-100">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} date={date} decision={item.ingredientId ? decisionOf.get(item.ingredientId) : undefined} />
                ))}
              </ul>
              {prevDate && missingCount > 0 && (
                <Button variant="outline" className="mt-3 w-full sm:w-auto" onClick={copyPrevious}>
                  <CopyIcon data-icon="inline-start" />
                  {formatDateShort(prevDate)} 목록에서 빠진 재료 {missingCount}개 불러오기
                </Button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
