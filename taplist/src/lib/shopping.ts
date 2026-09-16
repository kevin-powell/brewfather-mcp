import data from "../data/shopping-list.json";

/*
  Shopping lists are written by Claude while planning a recipe (see the
  brew-shopping-list skill). One entry per planned brew; remove it once you've shopped.
*/

export interface ShoppingItem {
  /** Grain, Hops, Yeast, Water & salts, Other */
  category: string;
  name: string;
  /** What to buy, with units, e.g. "3.5 kg" or "2 packs" */
  buy: string;
  /** What the recipe calls for, e.g. "4.5 kg" */
  need?: string;
  /** What's already in inventory, e.g. "1 kg" */
  have?: string;
  note?: string;
}

export interface ShoppingList {
  /** Stable id, e.g. "oatmeal-stout-2026-09" */
  id: string;
  recipe: string;
  style?: string;
  batchSize?: string;
  /** ISO date, optional */
  brewDay?: string;
  /** ISO date the list was generated */
  createdAt: string;
  notes?: string;
  items: ShoppingItem[];
}

const CATEGORY_ORDER = ["Grain", "Hops", "Yeast", "Water & salts", "Other"];

export function getShoppingLists(): ShoppingList[] {
  return (data.lists as ShoppingList[]).toSorted((a, b) =>
    (a.brewDay ?? a.createdAt).localeCompare(b.brewDay ?? b.createdAt),
  );
}

export function groupItems(items: ShoppingItem[]) {
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const key = item.category || "Other";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const rank = (c: string) => (CATEGORY_ORDER.indexOf(c) + 1 || CATEGORY_ORDER.length + 1);
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}
