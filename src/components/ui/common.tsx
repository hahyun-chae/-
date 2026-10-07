import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDateShort } from "@/lib/format";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div>
        <h1 className="text-[32px] leading-[1.08] font-medium text-ink sm:text-[48px] sm:leading-[1.04]">{title}</h1>
        {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, count, hint }: { children: React.ReactNode; count?: number; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <h2 className="text-xl leading-none font-medium text-ink">{children}</h2>
      {count != null && <span className="font-mono text-xs font-semibold text-steel">{count}</span>}
      {hint && <span className="ml-auto text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function SourceNote({ date, source }: { date: string | null; source: "KAMIS" | "MOCK" }) {
  return (
    <span className="font-mono text-xs text-muted-foreground">
      {date ? `기준일 ${formatDateShort(date)}` : "기준일 없음"} ·{" "}
      {source === "KAMIS" ? "KAMIS 공식 시세" : <span className="font-semibold text-launch-orange">데모 시세 (KAMIS 키 미설정)</span>}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-7 py-14 text-center">
      <p className="text-xl font-medium text-ink">{title}</p>
      {description && <p className="mt-2 max-w-sm text-base text-muted-foreground">{description}</p>}
      {href && cta && (
        <Link href={href} className={buttonVariants({ className: "mt-6" })}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="불러오는 중">
      <div className="h-24 animate-pulse rounded-3xl bg-surface" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
    </div>
  );
}
