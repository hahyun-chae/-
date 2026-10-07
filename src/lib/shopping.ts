import { shiftDate, todayKST } from "./format";
import type { ShoppingItem, ShoppingLists } from "./types";

// 사장님들은 영업이 끝난 밤에 다음 날 살 것을 적고, 아침에 그 목록을 보며 장을 본다.
// 오후 3시부터는 '내일 목록', 그 전에는 '오늘 목록'을 기본으로 연다.
const TOMORROW_FROM_HOUR = 15;

/** 지금 열면 기본으로 보여줄 목록의 날짜 (한국 시간) */
export function defaultListDate(now = Date.now()): string {
  const hourKST = new Date(now + 9 * 3600 * 1000).getUTCHours();
  const today = todayKST();
  return hourKST >= TOMORROW_FROM_HOUR ? shiftDate(today, 1) : today;
}

/** 목록 날짜를 "오늘" / "내일" / 날짜로 부른다 */
export function listDayLabel(date: string): string {
  const today = todayKST();
  if (date === today) return "오늘";
  if (date === shiftDate(today, 1)) return "내일";
  return date;
}

/** 주어진 날짜보다 앞선 날 중 항목이 있는 가장 최근 목록의 날짜 */
export function previousListDate(lists: ShoppingLists, date: string): string | null {
  const earlier = Object.keys(lists)
    .filter((d) => d < date && lists[d].length > 0)
    .sort();
  return earlier.at(-1) ?? null;
}

/** 2주보다 오래된 목록은 지운다 (기기 저장 공간 보호) */
export function pruneLists(lists: ShoppingLists, keepDays = 14): ShoppingLists {
  const cutoff = shiftDate(todayKST(), -keepDays);
  return Object.fromEntries(Object.entries(lists).filter(([d]) => d >= cutoff));
}

/** 같은 재료(또는 같은 이름)가 이미 목록에 있는지 */
export function findItem(items: ShoppingItem[], ingredientId: string | undefined, name: string): ShoppingItem | undefined {
  return items.find((i) => (ingredientId ? i.ingredientId === ingredientId : !i.ingredientId && i.name === name));
}
