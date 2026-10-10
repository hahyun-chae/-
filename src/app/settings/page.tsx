import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "설정 · 오늘 가격" };

export default function SettingsPage() {
  return <SettingsView />;
}
