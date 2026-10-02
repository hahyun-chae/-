"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { CATEGORY_LABEL, INGREDIENTS } from "@/lib/catalog";
import { matchesKorean } from "@/lib/hangul";
import { buildDecisions, type Decision } from "@/lib/recommend";
import { compareForDisplay } from "@/lib/status";
import type { IngredientCategory } from "@/lib/types";
import { actions, makeNameOf, useAppState } from "@/store/app-store";
import { usePrices } from "@/store/prices-context";
import { LoadingBlock, PageHeader, SourceNote } from "../ui/common";
import { PriceRow } from "./PriceRow";

type Tab = "all" | IngredientCategory;

const CATEGORY_ORDER: IngredientCategory[] = ["grain", "leafy", "vegetable", "namul", "mushroom", "fruit", "meat", "seafood", "etc"];

/** 관심 재료 담기/빼기 + 이벤트 기록 (재료 상세 화면에서도 사용) */
export function toggleWatch(id: string, name: string, on: boolean, source: "ingredients_list" | "ingredient_detail") {
  if (on) {
    actions.removeWatch(id);
    track("Watchlist Item Removed", { ingredient_id: id, ingredient_name: name, source });
  } else {
    actions.addWatch([id]);
    track("Watchlist Item Added", { ingredient_id: id, ingredient_name: name, source });
  }
}

function StarButton({ on, name, onToggle }: { on: boolean; name: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? `${name} 관심 재료에서 빼기` : `${name} 관심 재료로 담기`}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[22px] leading-none transition-colors hover:bg-canvas ${
        on ? "text-ink" : "text-hairline hover:text-steel"
      }`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

function Group({
  title,
  hint,
  items,
  watched,
  nameOf,
}: {
  title: string;
  hint?: string;
  items: Decision[];
  watched: Set<string>;
  nameOf: (id: string) => string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2 px-1">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        <span className="text-[17px] text-steel">{items.length}</span>
        {hint && <span className="ml-auto text-sm text-muted-foreground">{hint}</span>}
      </div>
      <ul className="card divide-y divide-slate-100 overflow-hidden">
        {items.map((d) => {
          const name = nameOf(d.ingredientId);
          const on = watched.has(d.ingredientId);
          return (
            <PriceRow
              key={d.ingredientId}
              decision={d}
              name={name}
              trailing={<StarButton on={on} name={name} onToggle={() => toggleWatch(d.ingredientId, name, on, "ingredients_list")} />}
            />
          );
        })}
      </ul>
    </section>
  );
}

export function IngredientsView() {
  const app = useAppState();
  const prices = usePrices();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const view = useMemo(() => {
    if (!app) return null;
    const nameOf = makeNameOf(app.customIngredients);
    const all = [...INGREDIENTS, ...app.customIngredients];
    const decisions = buildDecisions(all.map((i) => i.id), app.menus, prices.board, app.settings.thresholds, nameOf);
    const categoryOf = new Map(all.map((i) => [i.id, i.category]));
    const searchable = new Map(all.map((i) => [i.id, [i.name, ...i.aliases]]));
    return { nameOf, decisions, categoryOf, searchable };
  }, [app, prices.board]);

  if (!app || !view) return <LoadingBlock />;

  const watched = new Set(app.watchlist);
  const q = query.trim();
  const searched = view.decisions.filter((d) => !q || view.searchable.get(d.ingredientId)!.some((n) => matchesKorean(q, n)));
  const countBy = (c: IngredientCategory) => searched.filter((d) => view.categoryOf.get(d.ingredientId) === c).length;
  const tabs = [
    { id: "all" as Tab, label: "전체", count: searched.length },
    ...CATEGORY_ORDER.map((c) => ({ id: c as Tab, label: CATEGORY_LABEL[c], count: countBy(c) })).filter((t) => t.count > 0),
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "all";

  const visible = searched
    .filter((d) => activeTab === "all" || view.categoryOf.get(d.ingredientId) === activeTab)
    .sort(compareForDisplay);
  const watchedItems = visible.filter((d) => watched.has(d.ingredientId));
  const otherItems = visible.filter((d) => !watched.has(d.ingredientId));
  const up = watchedItems.filter((d) => d.status === "surge" || d.status === "up").length;
  const down = watchedItems.filter((d) => d.status === "down" || d.status === "plunge").length;
  const exactMatch = q && [...INGREDIENTS, ...app.customIngredients].some((i) => i.name === q);

  return (
    <>
      <PageHeader title="재료 시세" description={<SourceNote date={prices.date} source={prices.source} />} />

      {/* 검색 + 카테고리 탭: 스크롤해도 상단에 고정 */}
      <div className="sticky top-12 z-10 -mx-4 bg-canvas/90 px-4 pt-1 pb-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-12 lg:px-12 lg:pt-4">
        <input
          type="search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="재료 검색 (예: 시금치, ㅅㄱㅊ)"
          aria-label="재료 검색"
        />
        <div role="tablist" aria-label="재료 분류" className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          {tabs.map((t) => {
            const selected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  if (t.id !== activeTab) track("Category Tab Selected", { category: t.label });
                  setTab(t.id);
                }}
                className={`min-h-10 shrink-0 rounded-full px-4 text-[15px] whitespace-nowrap transition-colors ${
                  selected ? "bg-ink font-semibold text-white" : "text-ink ring-1 ring-hairline ring-inset hover:bg-white"
                }`}
              >
                {t.label}
                <span className={`ml-1 ${selected ? "text-white/70" : "text-steel"}`}>{t.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-10">
        {watchedItems.length > 0 ? (
          <Group title="★ 관심 재료" hint={`상승 ${up} · 하락 ${down}`} items={watchedItems} watched={watched} nameOf={view.nameOf} />
        ) : (
          !q && (
            <p className="card px-5 py-4 text-[15px] text-muted-foreground sm:px-7">
              {activeTab === "all" ? "" : `${CATEGORY_LABEL[activeTab]} 중 `}
              <span className="text-ink">☆</span>를 눌러 관심 재료로 담으면 목록 맨 위에 모여요.
            </p>
          )
        )}

        {otherItems.length > 0 && (
          <Group title={watchedItems.length > 0 ? "다른 재료" : "전체 재료"} items={otherItems} watched={watched} nameOf={view.nameOf} />
        )}

        {q && visible.length === 0 && (
          <div className="card px-5 py-8 text-center sm:px-7">
            <p className="text-[17px] text-ink">&lsquo;{q}&rsquo; 검색 결과가 없어요</p>
            <p className="mt-1 text-sm text-muted-foreground">공식 시세가 없는 재료도 직접 추가해서 메뉴 구성에 쓸 수 있어요.</p>
          </div>
        )}

        {q && !exactMatch && (
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => {
              track("Custom Ingredient Added", { ingredient_name: q, source: "ingredients_list" });
              actions.addWatch([actions.addCustomIngredient(q)]);
              setQuery("");
            }}
          >
            + &lsquo;{q}&rsquo; 직접 추가 <span className="text-sm text-muted-foreground">(시세 미연동)</span>
          </button>
        )}
      </div>
    </>
  );
}
