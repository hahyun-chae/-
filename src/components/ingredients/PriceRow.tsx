import Link from "next/link";
import { formatWon } from "@/lib/format";
import type { Decision } from "@/lib/recommend";
import { ChangeText, NormalBadge, StatusBadge } from "../ui/Badges";

/** 재료 한 줄 요약: 이름 · 상태 · 오늘 가격 · 1주 전 대비 */
export function PriceRow({
  decision: d,
  name,
  trailing,
}: {
  decision: Decision;
  name: string;
  trailing?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-4 sm:px-7">
      <Link href={`/ingredients/${d.ingredientId}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-900">{name}</span>
          <StatusBadge status={d.status} size="sm" />
          {d.aboveNormal && <NormalBadge />}
        </div>
        <p className="tabular mt-0.5 text-sm text-slate-500">
          {d.snapshot ? (
            <>
              <b className="font-semibold text-slate-700">{formatWon(d.snapshot.price)}</b> / {d.snapshot.unit}
              {d.snapshot.sizes && <span className="text-steel"> · 다른 용량 {d.snapshot.sizes.length - 1}개</span>}
            </>
          ) : (
            "공식 시세 정보 없음"
          )}
        </p>
      </Link>
      <div className="text-right">
        <ChangeText value={d.change} status={d.status} className="text-base" />
        <p className="text-[11px] text-slate-400">1주 전 대비</p>
      </div>
      {trailing}
    </li>
  );
}
