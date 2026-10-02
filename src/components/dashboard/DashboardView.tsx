"use client";

import Link from "next/link";
import { formatDateShort } from "@/lib/format";
import { compareForDisplay } from "@/lib/status";
import { useDecisions } from "@/store/use-decisions";
import { PriceRow } from "../ingredients/PriceRow";
import { EmptyState, LoadingBlock, PageHeader, SectionTitle, SourceNote } from "../ui/common";
import { DecisionCard } from "./DecisionCard";
import { DecisionSummary } from "./DecisionSummary";

export function DashboardView() {
  const data = useDecisions();
  // 온보딩 확인은 AppShell에서 공통으로 처리
  if (!data) return <LoadingBlock />;

  const { app, prices, decisions, nameOf } = data;
  const attention = decisions.filter((d) => ["substitute", "adjust", "caution"].includes(d.action));
  const opportunities = decisions.filter((d) => d.action === "opportunity");
  const responseKey = (id: string) => `${prices.date}:${id}`;

  return (
    <>
      <PageHeader
        title={prices.date ? `${formatDateShort(prices.date)} 오늘의 판단` : "오늘의 판단"}
        description={<SourceNote date={prices.date} source={prices.source} />}
        action={
          <Link href="/ingredients" className="btn-secondary">
            + 관심 재료
          </Link>
        }
      />

      {decisions.length === 0 ? (
        <EmptyState
          title="아직 관심 재료가 없어요"
          description="자주 쓰는 식재료를 등록하면 오늘 시세와 구매 판단을 보여드려요."
          href="/ingredients"
          cta="관심 재료 등록하기"
        />
      ) : (
        <div className="space-y-12 sm:space-y-16">
          <DecisionSummary decisions={decisions} />

          <section>
            <SectionTitle count={attention.length} hint="위험한 순서">
              먼저 확인할 재료
            </SectionTitle>
            {attention.length === 0 ? (
              <div className="card px-7 py-8 text-center text-[17px] text-muted">
                크게 오른 재료가 없어요. 오늘은 평소대로 장을 보셔도 좋아요.
              </div>
            ) : (
              <div className="space-y-4">
                {attention.map((d) => (
                  <DecisionCard
                    key={d.ingredientId}
                    decision={d}
                    nameOf={nameOf}
                    responseKey={responseKey(d.ingredientId)}
                    response={app.responses[responseKey(d.ingredientId)]}
                  />
                ))}
              </div>
            )}
            {app.menus.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                메뉴와 대체 가능한 재료를 등록하면 대체 추천을 받을 수 있어요.{" "}
                <Link href="/menus/new" className="font-semibold text-brand-700 underline">
                  메뉴 등록하기
                </Link>
              </p>
            )}
          </section>

          {opportunities.length > 0 && (
            <section>
              <SectionTitle count={opportunities.length}>구매 기회</SectionTitle>
              <ul className="card divide-y divide-slate-100 overflow-hidden">
                {opportunities.map((d) => (
                  <PriceRow key={d.ingredientId} decision={d} name={nameOf(d.ingredientId)} />
                ))}
              </ul>
            </section>
          )}

          <section>
            <SectionTitle count={decisions.length}>전체 관심 재료</SectionTitle>
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {[...decisions].sort(compareForDisplay).map((d) => (
                  <PriceRow key={d.ingredientId} decision={d} name={nameOf(d.ingredientId)} />
                ))}
            </ul>
          </section>

          <p className="text-center text-xs text-slate-400">
            공식 도·소매 시세 기준이에요. 실제 구매가는 매장·거래처마다 다를 수 있어요.
          </p>
        </div>
      )}
    </>
  );
}
