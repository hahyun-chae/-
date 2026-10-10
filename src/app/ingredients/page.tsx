import type { Metadata } from "next";
import { IngredientsView } from "@/components/ingredients/IngredientsView";

export const metadata: Metadata = { title: "관심 재료 시세 · 오늘 가격" };

export default function IngredientsPage() {
  return <IngredientsView />;
}
