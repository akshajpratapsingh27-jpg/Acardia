const KEY = "marketplace-favourites";

export function getFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavourite(id: string): string[] {
  const current = getFavourites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function addFavourites(ids: string[]): string[] {
  const next = Array.from(new Set([...getFavourites(), ...ids]));
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
