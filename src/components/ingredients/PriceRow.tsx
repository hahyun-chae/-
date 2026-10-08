import Link from "next/link";
import { formatUnitPrice, formatWon } from "@/lib/format";
import type { Decision } from "@/lib/recommend";
import { ChangeText, NormalBadge, StatusBadge } from "../ui/Badges";
import { AddToListButton } from "../shopping/AddToListButton";
import { SizePicker } from "./SizePicker";

/**
 * 재료 한 줄 요약: 이름 · 상태 · 오늘 가격 · 1주 전 대비 · 장보기 담기.
 * 용량이 여럿이면 줄 안에서 바로 바꿀 수 있다
 */
export function PriceRow({
  decision: d,
  name,
  trailing,
  showSizes = true,
}: {
  decision: Decision;
  name: string;
  trailing?: React.ReactNode;
  /** 용량 칩 표시 여부 */
  showSizes?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-4 sm:px-7">
      <div className="min-w-0 flex-1">
        <Link href={`/ingredients/${d.ingredientId}`} className="block">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-900">{name}</span>
            <StatusBadge status={d.status} size="sm" />
            {d.aboveNormal && <NormalBadge />}
          </div>
          <p className="tabular mt-0.5 text-sm text-slate-500">
            {d.snapshot ? (
              <>
                <span className="whitespace-nowrap">
                  <b className="font-semibold text-slate-700">{formatWon(d.snapshot.price)}</b> / {d.snapshot.unit}
                </span>
                {d.snapshot.sizes && formatUnitPrice(d.snapshot.price, d.snapshot.unit) && (
                  <>
                  {" "}
                  <span className="font-mono text-xs whitespace-nowrap text-steel">· {formatUnitPrice(d.snapshot.price, d.snapshot.unit)}</span>
                </>
                )}
              </>
            ) : (
              "공식 시세 정보 없음"
            )}
          </p>
        </Link>
        {/* 링크 안에 버튼을 넣을 수 없어 링크 밖에 둔다 */}
        {showSizes && d.snapshot && <SizePicker ingredientId={d.ingredientId} snapshot={d.snapshot} variant="compact" />}
      </div>
      <div className="text-right">
        <ChangeText value={d.change} status={d.status} className="text-base" />
        <p className="text-[11px] text-slate-400">1주 전 대비</p>
      </div>
      <AddToListButton ingredientId={d.ingredientId} name={name} source="price_row" />
      {trailing}
    </li>
  );
}
