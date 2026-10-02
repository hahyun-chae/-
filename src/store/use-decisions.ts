"use client";

import { useMemo } from "react";
import { buildDecisions, trackedIngredientIds } from "@/lib/recommend";
import { makeNameOf, useAppState } from "./app-store";
import { usePrices } from "./prices-context";

export function useDecisions() {
  const app = useAppState();
  const prices = usePrices();

  return useMemo(() => {
    if (!app) return null;
    const nameOf = makeNameOf(app.customIngredients);
    const ids = trackedIngredientIds(app.watchlist, app.menus);
    const decisions = buildDecisions(ids, app.menus, prices.board, app.settings.thresholds, nameOf);
    return { app, prices, nameOf, decisions };
  }, [app, prices]);
}
