"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { DEFAULT_THRESHOLDS } from "@/lib/status";
import { BUSINESS_TYPES, REGIONS } from "@/lib/templates";
import type { Thresholds } from "@/lib/types";
import { actions, useAppState } from "@/store/app-store";
import { usePrices } from "@/store/prices-context";
import { LoadingBlock, PageHeader } from "../ui/common";

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-full px-5 text-[15px] ring-1 ring-inset ${
            value === o.value ? "bg-ink text-white ring-ink" : "bg-transparent text-ink ring-steel hover:bg-canvas"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const THRESHOLD_FIELDS: { key: keyof Thresholds; label: string; desc: string }[] = [
  { key: "up", label: "상승·하락 기준", desc: "1주 전보다 이만큼 오르거나 내리면 상승·하락으로 봐요." },
  { key: "surge", label: "급등·급락 기준", desc: "1주 전보다 이만큼 오르거나 내리면 급등·급락으로 봐요." },
  { key: "aboveNormal", label: "평년보다 비쌈 기준", desc: "평년 가격보다 이만큼 비싸면 표시해요." },
];

export function SettingsView() {
  const app = useAppState();
  const prices = usePrices();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!app) return <LoadingBlock />;
  const s = app.settings;

  return (
    <>
      <PageHeader title="설정" description="변경 내용은 바로 저장돼요." />

      <div className="space-y-4">
        <section className="card space-y-4 p-5 sm:p-7">
          <h2 className="text-base font-semibold">가게 정보</h2>
          <div>
            <label className="label" htmlFor="store-name">가게 이름</label>
            <input id="store-name" className="input" value={s.name} placeholder="예: 행복한 비빔밥" onChange={(e) => actions.updateSettings({ name: e.target.value })} />
          </div>
          <div>
            <p className="label">업종</p>
            <Segmented
              label="업종"
              value={s.businessType}
              options={BUSINESS_TYPES.map((b) => ({ value: b.id, label: b.label }))}
              onChange={(v) => {
                actions.updateSettings({ businessType: v });
                track("Settings Changed", { setting: "business_type", value: v });
              }}
            />
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-7">
          <h2 className="text-base font-semibold">시세 기준</h2>
          <div>
            <p className="label">가격 기준</p>
            <Segmented
              label="가격 기준"
              value={s.priceType}
              options={[
                { value: "retail", label: "소매가" },
                { value: "wholesale", label: "도매가" },
              ]}
              onChange={(v) => {
                actions.updateSettings({ priceType: v });
                track("Settings Changed", { setting: "price_type", value: v });
              }}
            />
            <p className="mt-1.5 text-sm text-slate-500">시장·마트에서 직접 사면 소매가, 도매시장·거래처 발주라면 도매가가 더 가까워요.</p>
          </div>
          <div>
            <label className="label" htmlFor="region">지역</label>
            <select id="region" className="input" value={s.region} onChange={(e) => {
                actions.updateSettings({ region: e.target.value });
                track("Settings Changed", { setting: "region", value: REGIONS.find((r) => r.code === e.target.value)?.label ?? e.target.value });
              }}>
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>
          {prices.loading && <p className="text-sm text-slate-500">새 기준으로 시세를 불러오는 중…</p>}
        </section>

        <section className="card space-y-4 p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">판단 기준값</h2>
            <button type="button" className="text-sm font-semibold text-brand-700" onClick={() => {
                actions.updateSettings({ thresholds: DEFAULT_THRESHOLDS });
                track("Settings Changed", { setting: "thresholds_reset", value: true });
              }}>
              기본값으로
            </button>
          </div>
          {THRESHOLD_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label" htmlFor={`t-${f.key}`}>{f.label}</label>
              <div className="flex items-center gap-2">
                <input
                  id={`t-${f.key}`}
                  type="number"
                  min={1}
                  max={100}
                  className="input tabular max-w-28"
                  value={s.thresholds[f.key]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v) && v > 0) actions.updateSettings({ thresholds: { ...s.thresholds, [f.key]: v } });
                  }}
                  // 입력 중 매 글자가 아니라 입력을 마쳤을 때 한 번만 기록
                  onBlur={() => track("Settings Changed", { setting: `threshold_${f.key}`, value: s.thresholds[f.key] })}
                />
                <span className="font-semibold text-slate-600">%</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
          {s.thresholds.surge <= s.thresholds.up && (
            <p className="text-sm font-semibold text-red-600">급등 기준은 상승 기준보다 커야 해요.</p>
          )}
        </section>

        <section className="card p-5 sm:p-7">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-ink"
              checked={s.autoWatchMenuIngredients}
              onChange={(e) => {
                actions.updateSettings({ autoWatchMenuIngredients: e.target.checked });
                track("Settings Changed", { setting: "auto_watch_menu_ingredients", value: e.target.checked });
              }}
            />
            <span>
              <span className="block font-semibold text-slate-900">메뉴 재료를 관심 재료에 자동 추가</span>
              <span className="text-sm text-slate-500">메뉴를 저장할 때 핵심·조정 가능·현재 사용 재료를 관심 재료로 등록해요.</span>
            </span>
          </label>
        </section>

        <section className="card p-5 sm:p-7">
          <h2 className="text-base font-semibold">데이터</h2>
          <p className="mt-1 text-sm text-slate-500">가게 정보, 관심 재료, 메뉴는 이 브라우저에만 저장돼요.</p>
          <div className="mt-3 flex gap-2">
            {confirmReset ? (
              <>
                <button
                  type="button"
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    track("Data Reset", {});
                    actions.reset();
                    router.push("/onboarding");
                  }}
                >
                  모두 지우고 처음부터
                </button>
                <button type="button" className="btn-secondary" onClick={() => setConfirmReset(false)}>
                  취소
                </button>
              </>
            ) : (
              <button type="button" className="btn-secondary text-red-600" onClick={() => setConfirmReset(true)}>
                데이터 초기화
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
