"use client";

import Link from "next/link";
import { formatWon } from "@/lib/format";
import type { Decision } from "@/lib/recommend";
import type { UserResponse } from "@/lib/types";
import { actions } from "@/store/app-store";
import { ActionBadge, ChangeText, NormalBadge, RoleBadge, StatusBadge } from "../ui/Badges";

const RESPONSES: { value: UserResponse; label: string }[] = [
  { value: "applied", label: "적용" },
  { value: "deferred", label: "보류" },
  { value: "ignored", label: "무시" },
];

export function DecisionCard({
  decision: d,
  nameOf,
  responseKey,
  response,
}: {
  decision: Decision;
  nameOf: (id: string) => string;
  responseKey: string;
  response?: UserResponse;
}) {
  const showResponses = d.action === "substitute" || d.action === "adjust";

  return (
    <article className={`card p-5 sm:p-7 ${response === "ignored" ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <ActionBadge action={d.action} />
        {d.aboveNormal && <NormalBadge />}
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <Link href={`/ingredients/${d.ingredientId}`} className="flex items-center gap-2 hover:underline">
          <h3 className="text-[24px] leading-tight font-semibold text-ink">{nameOf(d.ingredientId)}</h3>
          <StatusBadge status={d.status} />
        </Link>
        <div className="text-right">
          <ChangeText value={d.change} status={d.status} className="text-xl" />
          <span className="ml-1.5 text-xs text-slate-400">1주 전 대비</span>
        </div>
      </div>
      {d.snapshot && (
        <p className="tabular mt-1 text-sm text-slate-500">
          오늘 <b className="text-slate-800">{formatWon(d.snapshot.price)}</b> / {d.snapshot.unit}
          <span className="mx-1.5 text-slate-300">|</span>1주 전 {formatWon(d.snapshot.weekAgo)}
        </p>
      )}

      {d.usages.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="font-semibold text-slate-500">영향 메뉴</span>
          {d.usages.map((u, i) => (
            <span key={`${u.menuId}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-canvas py-1 pr-1.5 pl-3">
              <span className="font-semibold text-slate-800">{u.menuName}</span>
              <RoleBadge role={u.role} />
            </span>
          ))}
        </div>
      )}

      {d.action === "substitute" && d.candidates.length > 0 && (
        <div className="mt-4 rounded-2xl bg-violet-50 p-4">
          <p className="mb-2 text-sm font-semibold text-violet-900">추천 대체 재료 <span className="font-normal text-violet-700">· 사장님이 허용한 재료 중에서</span></p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {d.candidates.map((c, i) => (
              <li key={c.ingredientId} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    <span className="mr-1 text-xs text-violet-600">{i + 1}</span>
                    {nameOf(c.ingredientId)}
                  </p>
                  <p className="tabular text-xs text-slate-500">{formatWon(c.snapshot.price)} / {c.snapshot.unit}</p>
                </div>
                <ChangeText value={c.change} status={c.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 rounded-2xl bg-canvas px-5 py-4 text-[17px] leading-relaxed text-slate-700">
        <span className="mr-1.5 text-xs font-semibold text-slate-400">추천 이유</span>
        {d.reason}
      </p>

      {showResponses && (
        <div className="mt-3 flex gap-2" role="group" aria-label="추천에 대한 응답">
          {RESPONSES.map((r) => {
            const selected = response === r.value;
            return (
              <button
                key={r.value}
                type="button"
                aria-pressed={selected}
                onClick={() => actions.respond(responseKey, selected ? null : r.value)}
                className={`btn flex-1 sm:flex-none ${
                  selected
                    ? r.value === "applied"
                      ? "bg-brand-600 text-white"
                      : "bg-ink text-white"
                    : "text-ink shadow-[0_0_0_1px_var(--color-steel)] hover:bg-canvas"
                }`}
              >
                {selected && "✓ "}
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
