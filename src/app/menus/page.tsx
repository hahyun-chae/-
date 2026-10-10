import type { Metadata } from "next";
import { MenusView } from "@/components/menus/MenusView";

export const metadata: Metadata = { title: "메뉴 · 오늘 가격" };

export default function MenusPage() {
  return <MenusView />;
}
