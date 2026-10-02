import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "오늘의 판단 · 원가핏" };

export default function TodayPage() {
  return <DashboardView />;
}
