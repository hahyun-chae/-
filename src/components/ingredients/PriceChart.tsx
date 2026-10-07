"use client";

import { useEffect, useRef, useState } from "react";
import { formatWon } from "@/lib/format";
import type { PriceSnapshot } from "@/lib/types";

/** 그래프를 담는 상자의 실제 폭(px). 처음 그릴 때는 기본값 */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * 비교 시점(1개월 전 → 오늘) 가격 추이 + 평년 기준선.
 * viewBox를 실제 폭에 맞춰 글자가 화면 크기와 상관없이 12px로 보이게 한다.
 */
export function PriceChart({ snapshot, color }: { snapshot: PriceSnapshot; color: string }) {
  const [ref, W] = useWidth<HTMLDivElement>(640);
  const points = [
    { label: "1개월 전", value: snapshot.monthAgo },
    { label: "2주 전", value: snapshot.twoWeeksAgo },
    { label: "1주 전", value: snapshot.weekAgo },
    { label: "전일", value: snapshot.prevDay },
    { label: "오늘", value: snapshot.price },
  ].filter((p): p is { label: string; value: number } => p.value != null);

  const H = W < 480 ? 180 : 220;
  // 양 끝 점의 가격 숫자가 잘리지 않도록 좌우 여백을 둔다
  const pad = { l: 8, r: 8, t: 28, b: 28 };
  const values = [...points.map((p) => p.value), ...(snapshot.normalYear ? [snapshot.normalYear] : [])];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || max * 0.1 || 1;
  const lo = min - span * 0.25;
  const hi = max + span * 0.25;

  const x = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / Math.max(points.length - 1, 1);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full" role="img" aria-label="최근 1개월 가격 추이">
        {snapshot.normalYear && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(snapshot.normalYear)} y2={y(snapshot.normalYear)} stroke="#71717a" strokeDasharray="5 5" />
            <text x={W - pad.r} y={y(snapshot.normalYear) - 6} textAnchor="end" className="fill-slate-500 text-[12px]">
              평년 {formatWon(snapshot.normalYear)}
            </text>
          </g>
        )}
        <path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const last = i === points.length - 1;
          return (
            <g key={p.label}>
              <circle cx={x(i)} cy={y(p.value)} r={last ? 6 : 4} fill={last ? color : "#020617"} stroke={color} strokeWidth={2.5} />
              <text
                x={x(i)}
                y={y(p.value) - 12}
                textAnchor={i === 0 ? "start" : last ? "end" : "middle"}
                className={`tabular text-[12px] ${last ? "fill-slate-900 font-semibold" : "fill-slate-500"}`}
              >
                {p.value.toLocaleString("ko-KR")}
              </text>
              <text x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : last ? "end" : "middle"} className="fill-slate-500 text-[12px]">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
