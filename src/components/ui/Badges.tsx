import { formatPct } from "@/lib/format";
import { ACTION_META } from "@/lib/recommend";
import { STATUS_META } from "@/lib/status";
import type { PriceStatus, RecommendedAction } from "@/lib/types";
import { ACTION_TONE, STATUS_TONE } from "./tone";

export function StatusBadge({ status, size = "md" }: { status: PriceStatus | null; size?: "sm" | "md" }) {
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-[13px]";
  if (!status) {
    return <span className={`inline-flex items-center rounded-full bg-canvas font-semibold text-muted-foreground ${sizeCls}`}>시세 없음</span>;
  }
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset ${STATUS_TONE[status].badge} ${sizeCls}`}>
      <span aria-hidden className="text-[0.8em] tracking-tighter">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

export function ChangeText({
  value,
  status,
  className = "",
}: {
  value: number | null;
  status: PriceStatus | null;
  className?: string;
}) {
  if (value == null || !status) return <span className={`text-slate-400 ${className}`}>-</span>;
  const icon = value > 0 ? "▲" : value < 0 ? "▼" : "";
  return (
    <span className={`tabular font-semibold ${STATUS_TONE[status].text} ${className}`}>
      <span aria-hidden className="mr-0.5 text-[0.75em]">{icon}</span>
      {formatPct(value, 1)}
    </span>
  );
}

export function ActionBadge({ action }: { action: RecommendedAction }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold ${ACTION_TONE[action].badge}`}>
      <span aria-hidden>{ACTION_TONE[action].icon}</span>
      {ACTION_META[action].label}
    </span>
  );
}

export function NormalBadge() {
  return (
    <span className="text-xs font-semibold text-launch-orange">
      평년보다 비쌈
    </span>
  );
}

const ROLE_LABEL = { core: "핵심", adjustable: "조정 가능", substitute: "대체 그룹" } as const;
const ROLE_TONE = {
  core: "bg-ink text-canvas",
  adjustable: "bg-orange-100 text-orange-800",
  substitute: "bg-violet-100 text-violet-800",
} as const;

export function RoleBadge({ role }: { role: keyof typeof ROLE_LABEL }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_TONE[role]}`}>{ROLE_LABEL[role]}</span>;
}
