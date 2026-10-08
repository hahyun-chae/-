"use client";

import { useEffect, useRef } from "react";
import { type AnalyticsEvents, track } from "./analytics";

/**
 * 화면이 열려 있는 동안 key마다 한 번만 이벤트를 남긴다 (예: 판단을 본 순간).
 * 개발 모드에서 effect가 두 번 실행돼도 같은 key는 한 번만 보낸다.
 */
export function useTrackOnce<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E] | null, key: string) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (!props || sent.current === key) return;
    sent.current = key;
    track(event, props);
    // props는 key가 바뀔 때만 다시 보낸다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
}

const SEARCH_IDLE_MS = 1500;

/**
 * 검색어 입력을 1.5초 멈추면 그 검색을 한 번 기록한다 (한 글자마다 보내지 않음).
 * 결과를 골라 바로 검색어가 지워지는 경우는 trackPick으로 따로 남긴다.
 */
export function useSearchTracking(query: string, resultCount: number, location: AnalyticsEvents["Ingredient Searched"]["location"]) {
  const last = useRef<string>("");
  const q = query.trim();
  useEffect(() => {
    if (!q || q === last.current) return;
    const timer = setTimeout(() => {
      last.current = q;
      track("Ingredient Searched", { query: q, result_count: resultCount, no_result: resultCount === 0, picked: false, location });
    }, SEARCH_IDLE_MS);
    return () => clearTimeout(timer);
  }, [q, resultCount, location]);

  return {
    trackPick(pickedQuery: string, count: number) {
      const pq = pickedQuery.trim();
      if (!pq) return;
      last.current = pq;
      track("Ingredient Searched", { query: pq, result_count: count, no_result: count === 0, picked: true, location });
    },
  };
}

const SCROLL_IDLE_MS = 400;

/**
 * 화면에 머무는 동안 스크롤 횟수(멈췄다 다시 굴린 횟수)와 가장 깊이 내려간 위치(%)를 세고,
 * 화면을 떠날 때(다른 탭으로 이동·창 닫기) 한 번 기록한다.
 */
export function useScrollTracking(getContext: () => Omit<AnalyticsEvents["Ingredients List Scrolled"], "scroll_count" | "max_depth_pct">) {
  const contextRef = useRef(getContext);
  useEffect(() => {
    contextRef.current = getContext;
  });

  useEffect(() => {
    let count = 0;
    let maxDepth = 0;
    let lastScrollAt = 0;
    let sent = false;

    const onScroll = () => {
      const now = Date.now();
      if (now - lastScrollAt > SCROLL_IDLE_MS) count += 1;
      lastScrollAt = now;
      const doc = document.documentElement;
      const depth = Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100);
      maxDepth = Math.max(maxDepth, Math.min(depth, 100));
    };
    const flush = () => {
      if (sent || count === 0) return;
      sent = true;
      track("Ingredients List Scrolled", { scroll_count: count, max_depth_pct: maxDepth, ...contextRef.current() });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
}
