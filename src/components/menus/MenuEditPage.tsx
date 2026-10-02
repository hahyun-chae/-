"use client";

import Link from "next/link";
import { useState } from "react";
import type { Menu } from "@/lib/types";
import { newId, useAppState } from "@/store/app-store";
import { EmptyState, LoadingBlock, PageHeader } from "../ui/common";
import { MenuEditor } from "./MenuEditor";

function blankMenu(): Menu {
  return { id: newId("menu"), name: "", ingredients: [], substituteGroups: [] };
}

/** menuId가 없으면 새 메뉴 등록 */
export function MenuEditPage({ menuId }: { menuId?: string }) {
  const app = useAppState();
  const [blank] = useState(blankMenu);

  if (!app) return <LoadingBlock />;

  const existing = menuId ? app.menus.find((m) => m.id === menuId) : undefined;
  if (menuId && !existing) {
    return <EmptyState title="메뉴를 찾을 수 없어요" href="/menus" cta="메뉴 목록으로" />;
  }

  return (
    <>
      <Link href="/menus" className="mb-3 inline-block text-sm font-semibold text-slate-500 hover:text-slate-800">
        ← 메뉴 목록
      </Link>
      <PageHeader title={existing ? `${existing.name} 편집` : "새 메뉴 등록"} />
      <MenuEditor
        key={existing?.id ?? blank.id}
        initial={existing ?? blank}
        custom={app.customIngredients}
        businessType={app.settings.businessType}
        isNew={!existing}
      />
    </>
  );
}
