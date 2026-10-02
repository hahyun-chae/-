import { formatPct } from "./format";
import { josa } from "./hangul";
import { STATUS_RANK, classify, isAboveNormal, weekChange } from "./status";
import type {
  Menu,
  PriceBoard,
  PriceSnapshot,
  PriceStatus,
  RecommendedAction,
  Thresholds,
} from "./types";

export type UsageRole = "core" | "adjustable" | "substitute";

export interface MenuUsage {
  menuId: string;
  menuName: string;
  role: UsageRole;
  groupId?: string;
  groupName?: string;
}

export interface Candidate {
  ingredientId: string;
  snapshot: PriceSnapshot;
  status: PriceStatus;
  change: number | null;
}

export interface Decision {
  ingredientId: string;
  snapshot?: PriceSnapshot;
  status: PriceStatus | null; // null = 시세 정보 없음
  change: number | null;
  aboveNormal: boolean;
  action: RecommendedAction;
  usages: MenuUsage[];
  /** 대체 검토일 때만. 사용자가 등록한 대체 재료 안에서만 뽑는다. */
  candidates: Candidate[];
  reason: string;
}

export const ACTION_META: Record<RecommendedAction, { label: string; short: string }> = {
  substitute: { label: "대체 검토", short: "대체" },
  adjust: { label: "양 조절 검토", short: "양 조절" },
  caution: { label: "필요량만 구매", short: "주의" },
  opportunity: { label: "구매 기회", short: "기회" },
  keep: { label: "그대로 구매", short: "유지" },
};

const ACTION_PRIORITY: Record<RecommendedAction, number> = {
  substitute: 4,
  adjust: 3,
  caution: 2,
  opportunity: 1,
  keep: 0,
};

type NameOf = (id: string) => string;

export function findUsages(ingredientId: string, menus: Menu[]): MenuUsage[] {
  const usages: MenuUsage[] = [];
  for (const m of menus) {
    for (const mi of m.ingredients) {
      if (mi.ingredientId === ingredientId) {
        usages.push({ menuId: m.id, menuName: m.name, role: mi.role });
      }
    }
    for (const g of m.substituteGroups) {
      if (g.currentIngredientId === ingredientId) {
        usages.push({ menuId: m.id, menuName: m.name, role: "substitute", groupId: g.id, groupName: g.name });
      }
    }
  }
  return usages;
}

/** 대체 그룹에 등록된 후보 중 원래 재료보다 가격 상태가 나은 것만, 등락률이 낮은 순으로 최대 3개 */
function pickCandidates(
  ingredientId: string,
  baseStatus: PriceStatus,
  usages: MenuUsage[],
  menus: Menu[],
  board: PriceBoard,
  t: Thresholds,
): Candidate[] {
  const optionIds = new Set<string>();
  for (const u of usages) {
    if (u.role !== "substitute") continue;
    const group = menus.find((m) => m.id === u.menuId)?.substituteGroups.find((g) => g.id === u.groupId);
    group?.optionIds.forEach((id) => id !== ingredientId && optionIds.add(id));
  }

  const candidates: Candidate[] = [];
  for (const id of optionIds) {
    const snap = board[id];
    if (!snap) continue;
    const change = weekChange(snap);
    const status = classify(change, t);
    if (STATUS_RANK[status] >= STATUS_RANK[baseStatus]) continue;
    candidates.push({ ingredientId: id, snapshot: snap, status, change });
  }
  return candidates
    .sort((a, b) => (a.change ?? 0) - (b.change ?? 0))
    .slice(0, 3);
}

function decideAction(status: PriceStatus, usages: MenuUsage[]): RecommendedAction {
  if (status === "down" || status === "plunge") return "opportunity";
  if (status === "flat") return "keep";
  if (usages.some((u) => u.role === "substitute")) return "substitute";
  if (status === "surge" && usages.some((u) => u.role === "adjustable")) return "adjust";
  return "caution";
}

function joinNames(names: string[]): string {
  const unique = [...new Set(names)];
  if (unique.length <= 2) return unique.join(", ");
  return `${unique.slice(0, 2).join(", ")} 외 ${unique.length - 2}개`;
}

const pct = (v: number | null) => `${Math.abs(Math.round(v ?? 0))}%`;

/** 규칙 기반으로 계산한 결과를 사장님이 읽기 쉬운 문장으로 바꾼다. 실제 수치만 사용한다. */
export function buildReason(d: Omit<Decision, "reason">, nameOf: NameOf): string {
  const name = nameOf(d.ingredientId);
  const menus = joinNames(d.usages.map((u) => u.menuName));
  switch (d.action) {
    case "substitute": {
      if (d.candidates.length === 0) {
        return `${josa(name, "이", "가")} 1주 새 ${pct(d.change)} 올랐지만, 등록하신 대체 재료도 함께 올랐어요. 필요한 양만 구매하세요.`;
      }
      const groupName = d.usages.find((u) => u.role === "substitute")?.groupName ?? "대체 재료";
      const cands = d.candidates
        .slice(0, 2)
        .map((c) => `${nameOf(c.ingredientId)}(${formatPct(c.change)})`);
      return `${josa(name, "이", "가")} 1주 새 ${pct(d.change)} 올랐어요. 등록하신 ${groupName} 중에서는 ${cands.join(", ")} 쪽이 더 저렴해요.`;
    }
    case "adjust":
      return `${josa(name, "이", "가")} 1주 새 ${pct(d.change)} 올랐어요. ${menus}에서 사용량을 조금 줄이고 다른 재료 비중을 늘려 보세요.`;
    case "caution": {
      const coreMenus = d.usages.filter((u) => u.role === "core").map((u) => u.menuName);
      if (coreMenus.length > 0) {
        return `${joinNames(coreMenus)}의 핵심 재료라 빼기 어려워요. 1주 새 ${pct(d.change)} 올랐으니 필요한 양만 사고 추이를 지켜보세요.`;
      }
      if (d.usages.length > 0) {
        return `1주 새 ${pct(d.change)} 올랐어요. ${menus}에서 조정 가능한 재료라, 더 오르면 양을 줄이는 것도 고려해 보세요.`;
      }
      return `1주 새 ${pct(d.change)} 올랐어요. 필요한 양만 구매하세요.`;
    }
    case "opportunity":
      return `1주 새 ${pct(d.change)} 내렸어요. 보관이 가능하면 조금 넉넉히 사 두는 것도 방법이에요.`;
    case "keep":
      return "가격 변동이 크지 않아요. 평소대로 구매하세요.";
  }
}

export function buildDecisions(
  ingredientIds: string[],
  menus: Menu[],
  board: PriceBoard,
  t: Thresholds,
  nameOf: NameOf,
): Decision[] {
  const decisions = ingredientIds.map((id): Decision => {
    const snapshot = board[id];
    const usages = findUsages(id, menus);
    if (!snapshot) {
      return { ingredientId: id, status: null, change: null, aboveNormal: false, action: "keep", usages, candidates: [], reason: "공식 시세 정보가 없는 재료예요." };
    }
    const change = weekChange(snapshot);
    const status = classify(change, t);
    const action = decideAction(status, usages);
    const candidates = action === "substitute" ? pickCandidates(id, status, usages, menus, board, t) : [];
    const base = { ingredientId: id, snapshot, status, change, aboveNormal: isAboveNormal(snapshot, t), action, usages, candidates };
    return { ...base, reason: buildReason(base, nameOf) };
  });

  // 위험한 판단부터, 같은 판단 안에서는 변동 폭이 큰 순
  return decisions.sort(
    (a, b) =>
      ACTION_PRIORITY[b.action] - ACTION_PRIORITY[a.action] ||
      Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0),
  );
}

/** 대시보드에서 판단 대상이 되는 재료: 관심 재료 + 메뉴의 핵심/조정/현재 사용 재료 */
export function trackedIngredientIds(watchlist: string[], menus: Menu[]): string[] {
  const ids = new Set(watchlist);
  for (const m of menus) {
    m.ingredients.forEach((mi) => ids.add(mi.ingredientId));
    m.substituteGroups.forEach((g) => ids.add(g.currentIngredientId));
  }
  return [...ids];
}
