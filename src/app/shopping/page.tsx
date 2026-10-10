import type { Metadata } from "next";
import { ShoppingView } from "@/components/shopping/ShoppingView";

export const metadata: Metadata = { title: "장보기 · 오늘 가격" };

export default function ShoppingPage() {
  return <ShoppingView />;
}
