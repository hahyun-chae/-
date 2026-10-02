import type { PriceStatus, RecommendedAction } from "@/lib/types";

// Tailwind가 클래스를 찾을 수 있도록 전체 클래스명을 그대로 적는다.
export const STATUS_TONE: Record<PriceStatus, { text: string; badge: string; bar: string }> = {
  surge: { text: "text-red-600", badge: "bg-red-50 text-red-700 ring-red-200", bar: "bg-red-500" },
  up: { text: "text-orange-600", badge: "bg-orange-50 text-orange-700 ring-orange-200", bar: "bg-orange-400" },
  flat: { text: "text-slate-500", badge: "bg-slate-100 text-slate-600 ring-slate-200", bar: "bg-slate-300" },
  down: { text: "text-blue-600", badge: "bg-blue-50 text-blue-700 ring-blue-200", bar: "bg-blue-400" },
  plunge: { text: "text-blue-800", badge: "bg-blue-100 text-blue-800 ring-blue-300", bar: "bg-blue-600" },
};

export const ACTION_TONE: Record<RecommendedAction, { badge: string; icon: string }> = {
  substitute: { badge: "bg-violet-600 text-white", icon: "⇄" },
  adjust: { badge: "bg-orange-500 text-white", icon: "−" },
  caution: { badge: "bg-red-600 text-white", icon: "!" },
  opportunity: { badge: "bg-green-600 text-white", icon: "↓" },
  keep: { badge: "bg-slate-500 text-white", icon: "✓" },
};
