"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PriceBoard, PriceFallback, PriceType } from "@/lib/types";
import { useAppState } from "./app-store";

interface PricesValue {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  fallback?: PriceFallback;
  date: string | null;
  loading: boolean;
}

interface Initial {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  fallback?: PriceFallback;
  priceType: PriceType;
  region: string;
}

const PricesContext = createContext<PricesValue | null>(null);

/** 재료별로 고른 용량의 시세로 바꿔 끼운다. 상태·추천도 고른 용량의 가격 흐름으로 계산된다 */
function applySizePrefs(board: PriceBoard, prefs: Record<string, string>): PriceBoard {
  const entries = Object.entries(prefs).flatMap(([id, kindCode]) => {
    const chosen = board[id]?.sizes?.find((s) => s.kindCode === kindCode);
    return chosen ? [[id, { ...chosen, sizes: board[id].sizes }] as const] : [];
  });
  return entries.length ? { ...board, ...Object.fromEntries(entries) } : board;
}

function latestDate(board: PriceBoard): string | null {
  const dates = Object.values(board).map((s) => s.date);
  return dates.length ? dates.sort().at(-1)! : null;
}

/**
 * 서버에서 받은 기본 시세(소매·전국)로 먼저 그리고,
 * 가게 설정의 기준(도매/지역)이 다르면 /api/prices로 다시 받아온다.
 * 서버에서 그린 시세가 데모 시세면(빌드 시점에 KAMIS 연결 실패 등) 같은 기준이라도 한 번 더 받아온다.
 */
export function PricesProvider({ initial, children }: { initial: Initial; children: React.ReactNode }) {
  const app = useAppState();
  const priceType = app?.settings.priceType ?? initial.priceType;
  const region = app?.settings.region ?? initial.region;
  const key = `${priceType}:${region}`;
  const initialKey = `${initial.priceType}:${initial.region}`;

  const [fetched, setFetched] = useState<{ key: string; board: PriceBoard; source: "KAMIS" | "MOCK"; fallback?: PriceFallback } | null>(null);
  const retryInitial = initial.source === "MOCK";

  useEffect(() => {
    if (key === initialKey && !retryInitial) return;
    let cancelled = false;
    fetch(`/api/prices?type=${priceType}&region=${region}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFetched({ key, board: data.board, source: data.source, fallback: data.fallback });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key, initialKey, retryInitial, priceType, region]);

  const current = fetched?.key === key ? fetched : key === initialKey ? initial : null;
  const rawBoard = current?.board ?? initial.board;
  const sizePrefs = app?.sizePrefs;
  const board = useMemo(() => applySizePrefs(rawBoard, sizePrefs ?? {}), [rawBoard, sizePrefs]);

  return (
    <PricesContext.Provider
      value={{
        board,
        source: current?.source ?? initial.source,
        fallback: current ? current.fallback : initial.fallback,
        date: latestDate(board),
        loading: current === null,
      }}
    >
      {children}
    </PricesContext.Provider>
  );
}

export function usePrices(): PricesValue {
  const v = useContext(PricesContext);
  if (!v) throw new Error("usePrices must be used inside PricesProvider");
  return v;
}
