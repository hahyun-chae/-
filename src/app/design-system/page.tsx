import type { Metadata } from "next";
import { DesignSystemView } from "@/components/design-system/DesignSystemView";

export const metadata: Metadata = { title: "디자인 시스템 · 오늘 가격" };

export default function DesignSystemPage() {
  return <DesignSystemView />;
}
