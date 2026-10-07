"use client";

import { useId, useMemo, useState } from "react";
import { CATEGORY_LABEL, INGREDIENTS } from "@/lib/catalog";
import { matchesKorean } from "@/lib/hangul";
import type { Ingredient } from "@/lib/types";
import { actions } from "@/store/app-store";
import { track } from "@/lib/analytics";

/** 재료 검색(초성 검색 지원). 목록에 없는 재료는 '시세 미연동 재료'로 직접 추가할 수 있다. */
export function IngredientPicker({
  onPick,
  exclude = [],
  custom = [],
  placeholder = "재료 검색 (예: 시금치, ㅅㄱㅊ)",
  allowCustom = true,
  autoFocus,
  source = "menu_editor",
}: {
  onPick: (id: string) => void;
  exclude?: string[];
  custom?: Ingredient[];
  placeholder?: string;
  allowCustom?: boolean;
  autoFocus?: boolean;
  /** 직접 추가 이벤트에 기록할 위치 */
  source?: "onboarding" | "menu_editor";
}) {
  const [query, setQuery] = useState("");
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return [...INGREDIENTS, ...custom]
      .filter((i) => !exclude.includes(i.id))
      .filter((i) => [i.name, ...i.aliases, ...(i.kamis ? [i.kamis.itemName] : [])].some((n) => matchesKorean(q, n)))
      .slice(0, 8);
  }, [query, exclude, custom]);

  const exact = [...INGREDIENTS, ...custom].some((i) => i.name === query.trim());

  const pick = (id: string) => {
    onPick(id);
    setQuery("");
  };

  return (
    <div className="relative">
      <input
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-controls={listId}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            e.preventDefault();
            pick(results[0].id);
          }
        }}
      />
      {query.trim() && (
        <ul id={listId} className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-2xl border border-hairline bg-popover py-2 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]">
          {results.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => pick(i.id)}
                className="flex w-full items-center justify-between px-5 py-2.5 text-left hover:bg-slate-50"
              >
                <span className="font-semibold text-slate-800">{i.name}</span>
                <span className="text-xs text-slate-400">
                  {CATEGORY_LABEL[i.category]} · {i.unit}
                </span>
              </button>
            </li>
          ))}
          {allowCustom && !exact && (
            <li>
              <button
                type="button"
                onClick={() => {
                  track("Custom Ingredient Added", { ingredient_name: query.trim(), source });
                  pick(actions.addCustomIngredient(query.trim()));
                }}
                className="flex w-full items-center gap-2 px-5 py-2.5 text-left text-brand-700 hover:bg-brand-50"
              >
                <span className="font-semibold">+ &lsquo;{query.trim()}&rsquo; 직접 추가</span>
                <span className="text-xs text-slate-400">시세 미연동 재료</span>
              </button>
            </li>
          )}
          {!allowCustom && results.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-slate-500">검색 결과가 없어요</li>
          )}
        </ul>
      )}
    </div>
  );
}
