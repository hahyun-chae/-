"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ingredientName } from "@/lib/catalog";
import { BUSINESS_TYPES, MENU_TEMPLATES, WATCH_PRESETS } from "@/lib/templates";
import type { BusinessType } from "@/lib/types";
import { actions, makeNameOf, useAppState } from "@/store/app-store";
import { IngredientPicker } from "../ingredients/IngredientPicker";
import { Logo } from "../layout/AppShell";
import { RoleBadge } from "../ui/Badges";
import { instantiateTemplate } from "../menus/MenuEditor";

const STEPS = ["업종 선택", "관심 재료", "대표 메뉴"];

export function OnboardingView() {
  const router = useRouter();
  const app = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [templateIds, setTemplateIds] = useState<string[]>([]);

  const nameOf = makeNameOf(app?.customIngredients ?? []);
  const templates = businessType ? MENU_TEMPLATES[businessType] : [];

  const chooseBusiness = (b: BusinessType) => {
    setBusinessType(b);
    setWatch(WATCH_PRESETS[b]);
    setTemplateIds(MENU_TEMPLATES[b].slice(0, 1).map((t) => t.templateId));
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const finish = (withMenus: boolean) => {
    const menus = withMenus ? templates.filter((t) => templateIds.includes(t.templateId)).map(instantiateTemplate) : [];
    actions.completeOnboarding({ name: name.trim(), businessType: businessType ?? "etc" }, watch, menus);
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
        <section>
          <p className="text-sm font-semibold text-brand-700">1 / 3</p>
          <h1 className="mt-1 text-2xl font-semibold leading-snug text-slate-900">
            오늘 장 보기 전 1분,
            <br />
            우리 가게 기준으로 판단해 드릴게요
          </h1>
          <p className="mt-2 text-[17px] text-slate-500">어떤 메뉴를 주로 파시나요? 업종에 맞는 재료와 메뉴 템플릿을 준비해 드려요.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {BUSINESS_TYPES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => chooseBusiness(b.id)}
                aria-pressed={businessType === b.id}
                className={`card p-4 text-left transition ${businessType === b.id ? "ring-2 ring-brand-600" : "hover:border-slate-300"}`}
              >
                <p className="text-base font-semibold text-slate-900">{b.label}</p>
                <p className="text-sm text-slate-500">{b.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="label" htmlFor="ob-name">가게 이름 (선택)</label>
            <input id="ob-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 행복한 비빔밥" />
          </div>

          <button type="button" className="btn-primary mt-8 w-full" disabled={!businessType} onClick={() => setStep(1)}>
            다음
          </button>
        </section>
      )}

      {step === 1 && (
        <section>
          <p className="text-sm font-semibold text-brand-700">2 / 3</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">자주 쓰는 재료를 골라 주세요</h1>
          <p className="mt-2 text-[17px] text-slate-500">이 재료들의 오늘 시세와 변동을 매일 보여드려요. 나중에 언제든 바꿀 수 있어요.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[...new Set([...(businessType ? WATCH_PRESETS[businessType] : []), ...watch])].map((id) => {
              const on = watch.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setWatch(toggle(watch, id))}
                  className={`min-h-11 rounded-full px-4 text-[17px] font-semibold ring-1 ring-inset ${
                    on ? "bg-ink text-white ring-ink" : "bg-white text-slate-600 ring-slate-300"
                  }`}
                >
                  {on ? "✓ " : "+ "}
                  {nameOf(id)}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <IngredientPicker onPick={(id) => setWatch((w) => [...new Set([...w, id])])} exclude={watch} custom={app?.customIngredients} placeholder="다른 재료 검색해서 추가" />
          </div>

          <div className="mt-8 flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(0)}>이전</button>
            <button type="button" className="btn-primary flex-1" disabled={watch.length === 0} onClick={() => (templates.length ? setStep(2) : finish(false))}>
              {watch.length}개 선택 · 다음
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <p className="text-sm font-semibold text-brand-700">3 / 3</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">대표 메뉴를 등록할까요?</h1>
          <p className="mt-2 text-[17px] text-slate-500">
            메뉴별로 <b>바꿔 써도 되는 재료</b>를 정해 두면, 가격이 올랐을 때 그 안에서만 대체 재료를 추천해 드려요.
          </p>

          <div className="mt-6 space-y-2">
            {templates.map((t) => {
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
            <button type="button" className="btn-primary flex-1" onClick={() => finish(true)}>
              시작하기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
