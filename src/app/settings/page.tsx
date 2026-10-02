import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "설정 · 원가핏" };

export default function SettingsPage() {
  return <SettingsView />;
}
