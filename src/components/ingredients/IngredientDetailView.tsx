"use client";

import { StarIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Toggle } from "@/components/ui/toggle";
import { CATEGORY_LABEL, getIngredient, kamisPath } from "@/lib/catalog";
import { formatPct, formatUnitPrice, formatWon, pctChange } from "@/lib/format";
import { buildDecisions } from "@/lib/recommend";
import { makeNameOf, useAppState } from "@/store/app-store";
import { usePrices } from "@/store/prices-context";
import { ActionBadge, ChangeText, NormalBadge, RoleBadge, StatusBadge } from "../ui/Badges";
import { EmptyState, LoadingBlock, SectionTitle, SourceNote } from "../ui/common";
import { AddToListButton } from "../shopping/AddToListButton";
import { toggleWatch } from "./IngredientsView";
import { PriceChart } from "./PriceChart";
import { SizePicker } from "./SizePicker";

const CHART_COLOR = { surge: "#f87171", up: "#fb923c", flat: "#a1a1aa", down: "#60a5fa", plunge: "#3b82f6" } as const;

export function IngredientDetailView({ id }: { id: string }) {
  const app = useAppState();
  const prices = usePrices();

  const view = useMemo(() => {
    if (!app) return null;
    const nameOf = makeNameOf(app.customIngredients);
    const [decision] = buildDecisions([id], app.menus, prices.board, app.settings.thresholds, nameOf);
    return { nameOf, decision };
  }, [app, prices.board, id]);

  if (!app || !view) return <LoadingBlock />;

  const ingredient = getIngredient(id) ?? app.customIngredients.find((c) => c.id === id);
  if (!ingredient) {
    return <EmptyState title="재료를 찾을 수 없어요" href="/ingredients" cta="재료 목록으로" />;
  }

  const { decision: d, nameOf } = view;
  const s = d.snapshot;
  const watching = app.watchlist.includes(id);
  const compare = s
    ? [
        { label: "전일", value: s.prevDay },
        { label: "1주 전", value: s.weekAgo },
        { label: "2주 전", value: s.twoWeeksAgo },
        { label: "1개월 전", value: s.monthAgo },
        { label: "1년 전", value: s.yearAgo },
        { label: "평년", value: s.normalYear },
      ]
    : [];

  return (
    <>
      <Link href="/ingredients" className="mb-3 inline-block text-sm font-semibold text-slate-500 hover:text-slate-800">
        ← 재료 시세
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {CATEGORY_LABEL[ingredient.category]}
            {" · "}
            {kamisPath(ingredient) ?? "KAMIS 미조사 품목"}
          </p>
          <h1 className="mt-0.5 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            {ingredient.name}
            <StatusBadge status={d.status} />
            {d.aboveNormal && <NormalBadge />}
          </h1>
          <div className="mt-1">
            <SourceNote date={s?.date ?? null} source={prices.source} fallback={prices.fallback} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddToListButton ingredientId={id} name={ingredient.name} source="ingredient_detail" variant="labeled" />
          <Toggle
            variant="outline"
            pressed={watching}
            onPressedChange={() => toggleWatch(id, ingredient.name, watching, "ingredient_detail")}
            aria-label={`${ingredient.name} 관심 재료`}
          >
            <StarIcon data-icon="inline-start" className="group-aria-pressed/toggle:fill-current" />
            {watching ? "관심 재료" : "관심 재료로 담기"}
          </Toggle>
        </div>
      </div>

      {!s ? (
        <EmptyState
          title="공식 시세 정보가 없는 재료예요"
          description="메뉴 구성과 대체 그룹에는 등록할 수 있어요. 추후 직접 입력한 구매가로 관리할 수 있도록 확장할 예정이에요."
        />
      ) : (
        <div className="space-y-6">
          <section className="card p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  오늘 {s.priceType === "retail" ? "소매" : "도매"}가 · {s.unit}
                </p>
                <p className="tabular text-4xl font-semibold text-slate-900">{formatWon(s.price)}</p>
                {formatUnitPrice(s.price, s.unit) && (
                  <p className="tabular mt-1 font-mono text-xs text-steel">{formatUnitPrice(s.price, s.unit)}</p>
                )}
              </div>
              <div className="text-right">
                <ChangeText value={d.change} status={d.status} className="text-2xl" />
                <p className="text-xs text-slate-400">1주 전 대비</p>
              </div>
            </div>
            {s.sizes && (
              <div className="mt-5">
                <SizePicker ingredientId={id} snapshot={s} variant="detail" />
              </div>
            )}
            <div className="mt-4">
              <PriceChart snapshot={s} color={CHART_COLOR[d.status ?? "flat"]} />
            </div>
          </section>

          <section>
            <SectionTitle>기간별 비교</SectionTitle>
            <div className="card overflow-hidden">
              <table className="w-full text-left text-[15px] sm:text-[17px]">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-4 py-3 sm:px-7 font-semibold">비교 시점</th>
                    <th className="px-4 py-3 sm:px-7 text-right font-semibold">가격</th>
                    <th className="px-4 py-3 sm:px-7 text-right font-semibold">오늘 대비</th>
                  </tr>
                </thead>
                <tbody className="tabular divide-y divide-slate-100">
                  {compare.map((c) => {
                    const diff = pctChange(s.price, c.value);
                    return (
                      <tr key={c.label}>
                        <td className="px-4 py-3 sm:px-7 font-semibold text-slate-700">{c.label}</td>
                        <td className="px-4 py-3 sm:px-7 text-right text-slate-700">{formatWon(c.value)}</td>
                        <td className={`px-4 py-3 sm:px-7 text-right font-semibold ${diff == null ? "text-slate-400" : diff > 0 ? "text-red-600" : diff < 0 ? "text-blue-600" : "text-slate-500"}`}>
                          {diff == null ? "-" : `${diff > 0 ? "▲" : diff < 0 ? "▼" : ""} ${formatPct(diff, 1)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <SectionTitle>오늘의 판단</SectionTitle>
            <div className="card p-5 sm:p-7">
              <ActionBadge action={d.action} />
              <p className="mt-3 text-[17px] leading-relaxed text-slate-700">{d.reason}</p>
              {d.candidates.length > 0 && (
                <p className="mt-2 text-sm text-violet-800">
                  추천 대체: {d.candidates.map((c) => `${nameOf(c.ingredientId)} ${formatPct(c.change)}`).join(" · ")}
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      <section className="mt-6">
        <SectionTitle count={d.usages.length}>이 재료를 쓰는 메뉴</SectionTitle>
        {d.usages.length === 0 ? (
          <p className="text-sm text-slate-500">아직 이 재료를 등록한 메뉴가 없어요.</p>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {d.usages.map((u, i) => (
              <li key={`${u.menuId}-${i}`}>
                <Link href={`/menus/${u.menuId}`} className="flex items-center justify-between px-5 py-4 hover:bg-canvas sm:px-7">
                  <span className="font-semibold text-slate-800">{u.menuName}</span>
                  <span className="flex items-center gap-2">
                    {u.groupName && <span className="text-sm text-slate-500">{u.groupName}</span>}
                    <RoleBadge role={u.role} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
