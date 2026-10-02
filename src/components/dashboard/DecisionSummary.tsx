import type { Decision } from "@/lib/recommend";

export function DecisionSummary({ decisions }: { decisions: Decision[] }) {
  const count = (pred: (d: Decision) => boolean) => decisions.filter(pred).length;
  const substitute = count((d) => d.action === "substitute");
  const adjust = count((d) => d.action === "adjust");
  const caution = count((d) => d.action === "caution");
  const keep = count((d) => d.action === "keep" || d.action === "opportunity");
  const opportunity = count((d) => d.action === "opportunity");

  const tiles = [
    { label: "대체 검토", short: "대체 검토", value: substitute, sub: "허용한 대체 재료 안에서", num: "text-violet-700", dot: "bg-violet-600" },
    { label: "양 조절 · 주의", short: "조절·주의", value: adjust + caution, sub: `양 조절 ${adjust} · 필요량만 ${caution}`, num: "text-orange-600", dot: "bg-orange-500" },
    { label: "그대로 구매", short: "그대로 구매", value: keep, sub: opportunity ? `이 중 구매 기회 ${opportunity}` : "변동 적음", num: "text-green-700", dot: "bg-green-600" },
  ];

  return (
    <section aria-label="오늘의 판단 요약" className="grid grid-cols-3 gap-2.5 sm:gap-5">
      {tiles.map((t) => (
        <div key={t.label} className="card px-4 py-4 sm:px-7 sm:py-6">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink sm:text-[17px]">
            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} />
            <span className="whitespace-nowrap sm:hidden">{t.short}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </p>
          <p className={`tabular mt-2 text-[32px] leading-none font-semibold tracking-[-0.015em] sm:text-[48px] ${t.num}`}>
            {t.value}
            <span className="ml-0.5 text-base font-normal text-muted-foreground sm:text-[17px]">개</span>
          </p>
          <p className="mt-2 hidden text-sm text-muted-foreground sm:block">{t.sub}</p>
        </div>
      ))}
    </section>
  );
}
