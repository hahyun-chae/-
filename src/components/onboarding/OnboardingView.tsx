"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { CATEGORY_LABEL, INGREDIENTS, ingredientName } from "@/lib/catalog";
import { BUSINESS_TYPES, MENU_TEMPLATES } from "@/lib/templates";
import type { IngredientCategory } from "@/lib/types";
import { actions, makeNameOf, useAppState } from "@/store/app-store";
import { IngredientPicker } from "../ingredients/IngredientPicker";
import { Logo } from "../layout/AppShell";
import { RoleBadge } from "../ui/Badges";
import { instantiateTemplate } from "../menus/MenuEditor";

const STEPS = ["상호명", "관심 재료", "대표 메뉴"];

const CATEGORY_ORDER: IngredientCategory[] = ["leafy", "vegetable", "namul", "mushroom", "grain", "fruit", "meat", "seafood", "etc"];

/** 업종 구분 없이 전체 메뉴 템플릿 (같은 이름은 하나만) */
const ALL_TEMPLATES = BUSINESS_TYPES.flatMap((b) => MENU_TEMPLATES[b.id]).filter(
  (t, i, arr) => arr.findIndex((x) => x.templateId === t.templateId) === i,
);

function StepLabel({ n }: { n: number }) {
  return <p className="text-sm font-semibold text-brand-700">{n} / 3</p>;
}

export function OnboardingView() {
  const router = useRouter();
  const app = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [watch, setWatch] = useState<string[]>([]);
  const [templateIds, setTemplateIds] = useState<string[]>([]);

  const custom = app?.customIngredients ?? [];
  const nameOf = makeNameOf(custom);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  // 직접 추가한 재료는 '기타'에 함께 보여준다
  const groups = CATEGORY_ORDER.map((c) => ({
    category: c,
    ids: [
      ...INGREDIENTS.filter((i) => i.category === c).map((i) => i.id),
      ...(c === "etc" ? custom.filter((i) => watch.includes(i.id)).map((i) => i.id) : []),
    ],
  })).filter((g) => g.ids.length > 0);

  const finish = (withMenus: boolean) => {
    const menus = withMenus ? ALL_TEMPLATES.filter((t) => templateIds.includes(t.templateId)).map(instantiateTemplate) : [];
    actions.completeOnboarding({ name: name.trim() }, watch, menus);
    track("Onboarding Step Completed", { step: 3, step_name: "대표 메뉴" });
    track("Onboarding Completed", {
      watch_count: watch.length,
      custom_ingredient_count: watch.filter((id) => custom.some((c) => c.id === id)).length,
      menu_count: menus.length,
      menus_skipped: menus.length === 0,
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

          <button type="submit" className="btn-primary mt-8 w-full" disabled={!name.trim()}>
            다음
          </button>
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

          <div className="mt-6 space-y-6">
            {groups.map((g) => (
              <section key={g.category} aria-label={CATEGORY_LABEL[g.category]}>
                <h2 className="mb-2.5 text-sm font-semibold text-muted">{CATEGORY_LABEL[g.category]}</h2>
                <div className="flex flex-wrap gap-2">
                  {g.ids.map((id) => {
                    const on = watch.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setWatch(toggle(watch, id))}
                        className={`min-h-11 rounded-full px-4 text-[17px] ring-1 ring-inset transition-colors ${
                          on ? "bg-ink font-semibold text-white ring-ink" : "bg-white text-ink ring-hairline hover:bg-canvas"
                        }`}
                      >
                        {on && "✓ "}
                        {nameOf(id)}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* 재료 목록이 길어서 이동 버튼은 하단에 고정 */}
          <div className="sticky bottom-0 -mx-4 mt-8 flex gap-2 bg-canvas/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:-mx-6 sm:px-6">
            <button type="button" className="btn-secondary" onClick={() => setStep(0)}>이전</button>
            <button type="button" className="btn-primary flex-1" disabled={watch.length === 0}
              onClick={() => {
                track("Onboarding Step Completed", { step: 2, step_name: "관심 재료" });
                setStep(2);
              }}
            >
              {watch.length > 0 ? `${watch.length}개 선택 · 다음` : "재료를 1개 이상 골라 주세요"}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <StepLabel n={3} />
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">대표 메뉴를 등록할까요?</h1>
          <p className="mt-2 text-[17px] text-slate-500">
            메뉴별로 <b>바꿔 써도 되는 재료</b>를 정해 두면, 가격이 올랐을 때 그 안에서만 대체 재료를 추천해 드려요.
          </p>

          <div className="mt-6 space-y-2">
            {ALL_TEMPLATES.map((t) => {
              const on = templateIds.includes(t.templateId);
              return (
                <button
                  key={t.templateId}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTemplateIds(toggle(templateIds, t.templateId))}
                  className={`card block w-full p-4 text-left ${on ? "ring-2 ring-brand-600" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">{t.name}</p>
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-sm ${on ? "bg-brand-600 text-white" : "ring-1 ring-steel"}`}>{on && "✓"}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p className="flex flex-wrap items-center gap-1.5">
                      <RoleBadge role="core" />
                      {t.ingredients.filter((i) => i.role === "core").map((i) => ingredientName(i.ingredientId)).join(", ")}
                    </p>
                    {t.substituteGroups.map((g) => (
                      <p key={g.id} className="flex flex-wrap items-center gap-1.5">
                        <RoleBadge role="substitute" />
                        {g.name}: {ingredientName(g.currentIngredientId)} ↔ {g.optionIds.map(ingredientName).join(", ")}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-slate-500">등록 후 메뉴 화면에서 재료를 자유롭게 고칠 수 있어요.</p>

          <div className="mt-8 flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>이전</button>
            <button type="button" className="btn-ghost" onClick={() => finish(false)}>건너뛰기</button>
            <button type="button" className="btn-primary flex-1" onClick={() => finish(templateIds.length > 0)}>
              {templateIds.length > 0 ? `${templateIds.length}개 등록하고 시작` : "시작하기"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
