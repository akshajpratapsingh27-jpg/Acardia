const KEY = "flip-the-cards-favourites";

export function getFestivalFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFestivalFavourite(id: string): string[] {
  const current = getFestivalFavourites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function addFestivalFavourites(ids: string[]): string[] {
  const next = Array.from(new Set([...getFestivalFavourites(), ...ids]));
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
