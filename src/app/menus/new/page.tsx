import type { Metadata } from "next";
import { MenuEditPage } from "@/components/menus/MenuEditPage";

export const metadata: Metadata = { title: "새 메뉴 등록 · 원가핏" };

export default function NewMenuPage() {
  return <MenuEditPage />;
}
