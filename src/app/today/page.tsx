import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "오늘의 판단 · 오늘 가격" };

export default function TodayPage() {
  return <DashboardView />;
}
