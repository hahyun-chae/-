import type { Metadata } from "next";
import { IngredientsView } from "@/components/ingredients/IngredientsView";

export const metadata: Metadata = { title: "관심 재료 시세 · 원가핏" };

export default function IngredientsPage() {
  return <IngredientsView />;
}
