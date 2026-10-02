import type { Metadata } from "next";
import { MenusView } from "@/components/menus/MenusView";

export const metadata: Metadata = { title: "메뉴 · 원가핏" };

export default function MenusPage() {
  return <MenusView />;
}
