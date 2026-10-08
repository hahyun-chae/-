import type { ShoppingItem } from "./types";

/** 같은 재료(또는 직접 적은 같은 이름)가 이미 목록에 있는지 */
export function findItem(items: ShoppingItem[], ingredientId: string | undefined, name: string): ShoppingItem | undefined {
  return items.find((i) => (ingredientId ? i.ingredientId === ingredientId : !i.ingredientId && i.name === name));
}
