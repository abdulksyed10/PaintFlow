export const PRODUCT_COMPARE_STORAGE_KEY = "paintflow:product-compare";
export const PRODUCT_SHORTLIST_STORAGE_KEY = "paintflow:product-shortlist";
export const SHADE_COMPARE_STORAGE_KEY = "paintflow:shade-compare";

function readJsonArray(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, values: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(values));
}

export function readStoredIds(key: string) {
  return readJsonArray(key);
}

export function writeStoredIds(key: string, values: string[]) {
  writeJsonArray(key, values);
}

export function toggleStoredId(values: string[], id: string) {
  return values.includes(id) ? values.filter((entry) => entry !== id) : [...values, id];
}

export function containsStoredId(values: string[], id: string) {
  return values.includes(id);
}
