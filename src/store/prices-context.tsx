"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PriceBoard, PriceType } from "@/lib/types";
import { useAppState } from "./app-store";

interface PricesValue {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  date: string | null;
  loading: boolean;
}

interface Initial {
  board: PriceBoard;
  source: "KAMIS" | "MOCK";
  priceType: PriceType;
  region: string;
}

const PricesContext = createContext<PricesValue | null>(null);

function latestDate(board: PriceBoard): string | null {
  const dates = Object.values(board).map((s) => s.date);
  return dates.length ? dates.sort().at(-1)! : null;
}

/**
 * 서버에서 받은 기본 시세(소매·전국)로 먼저 그리고,
 * 가게 설정의 기준(도매/지역)이 다르면 /api/prices로 다시 받아온다.
 */
export function PricesProvider({ initial, children }: { initial: Initial; children: React.ReactNode }) {
  const app = useAppState();
  const priceType = app?.settings.priceType ?? initial.priceType;
  const region = app?.settings.region ?? initial.region;
  const key = `${priceType}:${region}`;
  const initialKey = `${initial.priceType}:${initial.region}`;

  const [fetched, setFetched] = useState<{ key: string; board: PriceBoard; source: "KAMIS" | "MOCK" } | null>(null);

  useEffect(() => {
    if (key === initialKey) return;
    let cancelled = false;
    fetch(`/api/prices?type=${priceType}&region=${region}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFetched({ key, board: data.board, source: data.source });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key, initialKey, priceType, region]);

  const current = key === initialKey ? initial : fetched?.key === key ? fetched : null;
  const board = current?.board ?? initial.board;

  return (
    <PricesContext.Provider
      value={{
        board,
        source: current?.source ?? initial.source,
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
