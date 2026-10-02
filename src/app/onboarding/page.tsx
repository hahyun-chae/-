import type { Metadata } from "next";
import { OnboardingView } from "@/components/onboarding/OnboardingView";

export const metadata: Metadata = { title: "시작하기 · 원가핏" };

export default function OnboardingPage() {
  return <OnboardingView />;
}
