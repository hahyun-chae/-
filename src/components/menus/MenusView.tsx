"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useDecisions } from "@/store/use-decisions";
import { RoleBadge, StatusBadge } from "../ui/Badges";
import { EmptyState, LoadingBlock, PageHeader } from "../ui/common";

export function MenusView() {
  const data = useDecisions();
  if (!data) return <LoadingBlock />;
  const { app, decisions, nameOf } = data;
  const byId = new Map(decisions.map((d) => [d.ingredientId, d]));

  return (
    <>
      <PageHeader
        title="메뉴 재료 구성"
        description="메뉴별로 핵심·조정 가능·대체 가능 재료를 정해 두면, 가격이 오를 때 그 안에서만 추천해 드려요."
        action={
          <Link href="/menus/new" className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" />
            메뉴 추가
          </Link>
        }
      />

      {app.menus.length === 0 ? (
        <EmptyState
          title="등록된 메뉴가 없어요"
          description="템플릿을 고르면 1분 안에 등록할 수 있어요."
          href="/menus/new"
          cta="첫 메뉴 등록하기"
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {app.menus.map((m) => {
            const ids = [...m.ingredients.map((i) => i.ingredientId), ...m.substituteGroups.map((g) => g.currentIngredientId)];
            const risky = ids.filter((id) => ["surge", "up"].includes(byId.get(id)?.status ?? ""));
            return (
              <li key={m.id}>
                <Link href={`/menus/${m.id}`} className="card block p-4 transition-colors hover:border-white/25 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{m.name}</h2>
                      {m.price && <p className="tabular text-sm text-slate-500">{m.price.toLocaleString("ko-KR")}원</p>}
                    </div>
                    {risky.length > 0 ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        ▲ 오른 재료 {risky.length}
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">안정</span>
                    )}
                  </div>

                  <dl className="mt-3 space-y-2 text-sm">
                    {(["core", "adjustable"] as const).map((role) => {
                      const items = m.ingredients.filter((i) => i.role === role);
                      if (!items.length) return null;
                      return (
                        <div key={role} className="flex flex-wrap items-center gap-1.5">
                          <dt><RoleBadge role={role} /></dt>
                          {items.map((i) => (
                            <dd key={i.ingredientId} className="inline-flex items-center gap-1 text-slate-700">
                              {nameOf(i.ingredientId)}
                              {["surge", "up"].includes(byId.get(i.ingredientId)?.status ?? "") && <StatusBadge status={byId.get(i.ingredientId)!.status} size="sm" />}
                            </dd>
                          ))}
                        </div>
                      );
                    })}
                    {m.substituteGroups.map((g) => (
                      <div key={g.id} className="flex flex-wrap items-center gap-1.5">
                        <dt><RoleBadge role="substitute" /></dt>
                        <dd className="text-slate-700">
                          <b className="font-semibold">{g.name}</b> · {nameOf(g.currentIngredientId)}
                          {["surge", "up"].includes(byId.get(g.currentIngredientId)?.status ?? "") && (
                            <span className="ml-1"><StatusBadge status={byId.get(g.currentIngredientId)!.status} size="sm" /></span>
                          )}
                          <span className="text-slate-400"> ↔ {g.optionIds.map(nameOf).join(", ")}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
