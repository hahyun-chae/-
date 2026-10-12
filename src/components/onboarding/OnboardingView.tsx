"use client";

import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { track } from "@/lib/analytics";
import { CATEGORY_LABEL, CATEGORY_ORDER, INGREDIENTS } from "@/lib/catalog";
import type { IngredientCategory } from "@/lib/types";
import { actions, makeNameOf, useAppState } from "@/store/app-store";
import { IngredientPicker } from "../ingredients/IngredientPicker";
import { Logo } from "../layout/AppShell";

const STEPS = ["상호명", "관심 재료"];

function StepLabel({ n }: { n: number }) {
  return <p className="text-sm font-semibold text-brand-700">{n} / {STEPS.length}</p>;
}

export function OnboardingView() {
  const router = useRouter();
  const app = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [watch, setWatch] = useState<string[]>([]);
  const [tab, setTab] = useState<IngredientCategory>(CATEGORY_ORDER[0]);

  const custom = app?.customIngredients ?? [];
  const nameOf = makeNameOf(custom);

  // 대표 재료와 KAMIS 전체 품종을 분류별로 보여준다. 직접 추가한 재료는 '기타'에 함께 보여준다
  const groups = CATEGORY_ORDER.map((c) => ({
    category: c,
    ids: [
      ...INGREDIENTS.filter((i) => i.category === c).map((i) => i.id),
      ...(c === "etc" ? custom.filter((i) => watch.includes(i.id)).map((i) => i.id) : []),
    ],
  })).filter((g) => g.ids.length > 0);

  const finish = () => {
    actions.completeOnboarding({ name: name.trim() }, watch, []);
    track("Onboarding Step Completed", { step: 2, step_name: "관심 재료" });
    track("Onboarding Completed", {
      watch_count: watch.length,
      custom_ingredient_count: watch.filter((id) => custom.some((c) => c.id === id)).length,
    });
    router.push("/ingredients");
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <ol className="flex gap-1.5" aria-label="진행 단계">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-brand-600" : "bg-slate-200"}`}>
              <span className="sr-only">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {step === 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            track("Onboarding Step Completed", { step: 1, step_name: "상호명" });
            setStep(1);
          }}
        >
          <StepLabel n={1} />
          <h1 className="mt-1 text-2xl font-semibold leading-snug text-slate-900">
            오늘 장 보기 전 1분,
            <br />
            우리 가게 기준으로 판단해 드릴게요
          </h1>
          <p className="mt-2 text-[17px] text-slate-500">먼저 가게 이름을 알려 주세요.</p>

          <div className="mt-8">
            <label className="label" htmlFor="ob-name">상호명</label>
            <input
              id="ob-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 행복한 비빔밥"
              autoFocus
              maxLength={40}
            />
          </div>

          <Button type="submit" className="mt-8 w-full" disabled={!name.trim()}>
            다음
          </Button>
        </form>
      )}

      {step === 1 && (
        <section>
          <StepLabel n={2} />
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">자주 쓰는 재료를 골라 주세요</h1>
          <p className="mt-2 text-[17px] text-slate-500">고른 재료는 재료 시세 화면 맨 위에 모여요. 나중에 언제든 바꿀 수 있어요.</p>

          <div className="mt-6">
            <IngredientPicker
              onPick={(id) => setWatch((w) => [...new Set([...w, id])])}
              exclude={watch}
              custom={custom}
              placeholder="재료 검색 (예: 시금치, ㅅㄱㅊ)"
              source="onboarding"
            />
          </div>

          {/* 분류 탭으로 전환한다. 탭마다 고른 개수를 보여줘 다른 분류에서 고른 재료도 놓치지 않게 한다 */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as IngredientCategory)} className="mt-4">
            {/* 양 끝 탭(곡물·기타)이 잘리지 않게 좌우 여백을 두고, 끝을 흐리게 하는 효과는 쓰지 않는다 */}
            <TabsList
              aria-label="재료 분류"
              className="w-full justify-start gap-1 overflow-x-auto rounded-lg bg-control/70 px-2 py-1 [scrollbar-width:none]"
            >
              {groups.map((g) => {
                const picked = g.ids.filter((id) => watch.includes(id)).length;
                return (
                  <TabsTrigger key={g.category} value={g.category} className="flex-none rounded-md px-4 text-[15px] data-active:font-semibold">
                    {CATEGORY_LABEL[g.category]}
                    {picked > 0 && <span className="text-brand-700">{picked}</span>}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {groups.map((g) => (
              <TabsContent key={g.category} value={g.category} className="mt-4">
                {/* 분류별 다중 선택. 그룹의 선택값을 전체 선택 목록(watch)에 합친다 */}
                <ToggleGroup
                  multiple
                  variant="outline"
                  aria-label={CATEGORY_LABEL[g.category]}
                  className="w-full flex-wrap"
                  value={g.ids.filter((id) => watch.includes(id))}
                  onValueChange={(next) => setWatch((w) => [...w.filter((id) => !g.ids.includes(id)), ...next])}
                >
                  {g.ids.map((id) => (
                    <ToggleGroupItem key={id} value={id} className="text-[17px]">
                      {watch.includes(id) && <CheckIcon data-icon="inline-start" />}
                      {nameOf(id)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </TabsContent>
            ))}
          </Tabs>

          {/* 재료 목록이 길어서 이동 버튼은 하단에 고정 */}
          <div className="sticky bottom-0 -mx-4 mt-8 flex gap-2 bg-canvas/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:-mx-6 sm:px-6">
            <Button variant="outline" onClick={() => setStep(0)}>
              이전
            </Button>
            <Button
              className="flex-1"
              disabled={watch.length === 0}
              onClick={finish}
            >
              {watch.length > 0 ? `${watch.length}개 선택 · 시작하기` : "재료를 1개 이상 골라 주세요"}
            </Button>
          </div>
        </section>
      )}

    </div>
  );
}
