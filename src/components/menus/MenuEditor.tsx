"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { MENU_TEMPLATES, type MenuTemplate } from "@/lib/templates";
import type { Ingredient, IngredientRole, Menu, SubstituteGroup } from "@/lib/types";
import { actions, makeNameOf, newId } from "@/store/app-store";
import { IngredientPicker } from "../ingredients/IngredientPicker";

export function instantiateTemplate(t: MenuTemplate): Menu {
  return {
    id: newId("menu"),
    name: t.name,
    ingredients: t.ingredients.map((i) => ({ ...i })),
    substituteGroups: t.substituteGroups.map((g) => ({ ...g, id: newId("group"), optionIds: [...g.optionIds] })),
  };
}

/** 등록한 재료 칩: shadcn Badge + 빼기 버튼 */
function Chips({ ids, nameOf, onRemove, tone }: { ids: string[]; nameOf: (id: string) => string; onRemove: (id: string) => void; tone: string }) {
  if (ids.length === 0) return null;
  return (
    <ul className="mb-2.5 flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id}>
          <Badge className={`h-8 gap-0.5 py-0 pr-0.5 pl-3 text-sm font-semibold ${tone}`}>
            {nameOf(id)}
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-current hover:bg-black/10 hover:text-current"
              onClick={() => onRemove(id)}
              aria-label={`${nameOf(id)} 빼기`}
            >
              <XIcon />
            </Button>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-0.5 mb-3 text-sm text-slate-500">{desc}</p>
      {children}
    </section>
  );
}

export function MenuEditor({
  initial,
  custom,
  isNew,
}: {
  initial: Menu;
  custom: Ingredient[];
  isNew: boolean;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu>(initial);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameOf = makeNameOf(custom);

  const usedIds = [
    ...menu.ingredients.map((i) => i.ingredientId),
    ...menu.substituteGroups.flatMap((g) => [g.currentIngredientId, ...g.optionIds]),
  ].filter(Boolean);

  const idsByRole = (role: IngredientRole) => menu.ingredients.filter((i) => i.role === role).map((i) => i.ingredientId);
  const addIngredient = (id: string, role: IngredientRole) =>
    setMenu((m) => ({ ...m, ingredients: [...m.ingredients, { ingredientId: id, role }] }));
  const removeIngredient = (id: string) =>
    setMenu((m) => ({ ...m, ingredients: m.ingredients.filter((i) => i.ingredientId !== id) }));

  const updateGroup = (gid: string, patch: Partial<SubstituteGroup>) =>
    setMenu((m) => ({ ...m, substituteGroups: m.substituteGroups.map((g) => (g.id === gid ? { ...g, ...patch } : g)) }));
  const addGroup = () =>
    setMenu((m) => ({
      ...m,
      substituteGroups: [...m.substituteGroups, { id: newId("group"), name: "", currentIngredientId: "", optionIds: [] }],
    }));

  const save = () => {
    if (!menu.name.trim()) return setError("메뉴 이름을 입력해 주세요.");
    const groups = menu.substituteGroups.filter((g) => g.currentIngredientId || g.optionIds.length);
    for (const g of groups) {
      if (!g.currentIngredientId) return setError(`'${g.name || "대체 그룹"}'에 지금 쓰는 재료를 골라 주세요.`);
      if (g.optionIds.length === 0) return setError(`'${g.name || nameOf(g.currentIngredientId)}'에 대체 가능한 재료를 1개 이상 등록해 주세요.`);
    }
    actions.saveMenu({
      ...menu,
      name: menu.name.trim(),
      substituteGroups: groups.map((g) => ({ ...g, name: g.name.trim() || `${nameOf(g.currentIngredientId)} 대체` })),
    });
    track("Menu Saved", {
      is_new: isNew,
      core_count: menu.ingredients.filter((i) => i.role === "core").length,
      adjustable_count: menu.ingredients.filter((i) => i.role === "adjustable").length,
      substitute_group_count: groups.length,
      has_price: menu.price != null,
    });
    router.push("/menus");
  };

  return (
    <div className="space-y-4">
      {isNew && (
        <section className="rounded-3xl bg-white p-5 sm:p-7">
          <p className="text-sm font-semibold text-ink">템플릿으로 빠르게 시작하기</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {MENU_TEMPLATES.map((t) => (
              <Button
                key={t.templateId}
                variant="outline"
                size="sm"
                onClick={() => {
                  setMenu({ ...instantiateTemplate(t), id: menu.id });
                  track("Menu Template Applied", { template_id: t.templateId, template_name: t.name });
                }}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      <Section title="기본 정보" desc="정확한 레시피나 그램 수는 필요 없어요.">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <div>
            <label className="label" htmlFor="menu-name">메뉴 이름</label>
            <input id="menu-name" className="input" value={menu.name} placeholder="예: 비빔밥" onChange={(e) => setMenu({ ...menu, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="menu-price">판매가 (선택)</label>
            <input
              id="menu-price"
              className="input tabular"
              inputMode="numeric"
              placeholder="9000"
              value={menu.price ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setMenu({ ...menu, price: v ? Number(v) : undefined });
              }}
            />
          </div>
        </div>
      </Section>

      <Section title="핵심 재료" desc="메뉴의 정체성을 결정해서 빼거나 바꾸기 어려운 재료예요.">
        <Chips ids={idsByRole("core")} nameOf={nameOf} onRemove={removeIngredient} tone="bg-slate-800 text-white" />
        <IngredientPicker onPick={(id) => addIngredient(id, "core")} exclude={usedIds} custom={custom} placeholder="핵심 재료 추가" />
      </Section>

      <Section title="조정 가능한 재료" desc="가격에 따라 양을 늘리거나 줄일 수 있는 재료예요.">
        <Chips ids={idsByRole("adjustable")} nameOf={nameOf} onRemove={removeIngredient} tone="bg-orange-100 text-orange-900" />
        <IngredientPicker onPick={(id) => addIngredient(id, "adjustable")} exclude={usedIds} custom={custom} placeholder="조정 가능한 재료 추가" />
      </Section>

      <Section title="대체 가능한 재료 그룹" desc="서로 바꿔 써도 되는 재료 묶음이에요. 대체 추천은 여기 등록한 재료 안에서만 나와요.">
        <div className="space-y-3">
          {menu.substituteGroups.map((g) => (
            <div key={g.id} className="rounded-2xl bg-canvas p-4 sm:p-5">
              <div className="flex gap-2">
                <input
                  className="input"
                  value={g.name}
                  placeholder="그룹 이름 (예: 나물류)"
                  onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                  aria-label="그룹 이름"
                />
                <Button
                  variant="ghost"
                  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setMenu((m) => ({ ...m, substituteGroups: m.substituteGroups.filter((x) => x.id !== g.id) }))}
                >
                  삭제
                </Button>
              </div>

              <p className="mt-3 mb-1.5 text-sm font-semibold text-slate-700">지금 쓰는 재료</p>
              {g.currentIngredientId ? (
                <Chips ids={[g.currentIngredientId]} nameOf={nameOf} onRemove={() => updateGroup(g.id, { currentIngredientId: "" })} tone="bg-violet-600 text-white" />
              ) : (
                <IngredientPicker onPick={(id) => updateGroup(g.id, { currentIngredientId: id })} exclude={usedIds} custom={custom} placeholder="예: 시금치" />
              )}

              <p className="mt-3 mb-1.5 text-sm font-semibold text-slate-700">대신 써도 되는 재료</p>
              <Chips
                ids={g.optionIds}
                nameOf={nameOf}
                onRemove={(id) => updateGroup(g.id, { optionIds: g.optionIds.filter((o) => o !== id) })}
                tone="bg-violet-100 text-violet-900"
              />
              <IngredientPicker
                onPick={(id) => updateGroup(g.id, { optionIds: [...g.optionIds, id] })}
                exclude={[g.currentIngredientId, ...g.optionIds]}
                custom={custom}
                placeholder="예: 취나물, 근대"
              />
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed" onClick={addGroup}>
            <PlusIcon data-icon="inline-start" />
            대체 그룹 추가
          </Button>
        </div>
      </Section>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-16 z-10 -mx-4 flex gap-2 border-t border-slate-200 bg-canvas/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 lg:bottom-0">
        {!isNew &&
          (confirmDelete ? (
            <Button
              variant="destructive" className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                actions.deleteMenu(menu.id);
                track("Menu Deleted", { menu_id: menu.id });
                router.push("/menus");
              }}
            >
              정말 삭제
            </Button>
          ) : (
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}>
              메뉴 삭제
            </Button>
          ))}
        <Button variant="outline" className="ml-auto" onClick={() => router.back()}>
          취소
        </Button>
        <Button onClick={save}>저장</Button>
      </div>
    </div>
  );
}
