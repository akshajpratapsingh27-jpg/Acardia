export type UserRole = "patient" | "caregiver";

const ROLE_KEY = "smritisetu.role";
const NAME_KEY = "smritisetu.name";

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ROLE_KEY);
  return value === "patient" || value === "caregiver" ? value : null;
}

export function getStoredName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function storeProfile(role: UserRole, name: string) {
  window.localStorage.setItem(ROLE_KEY, role);
  window.localStorage.setItem(NAME_KEY, name.trim());
}

export function clearProfile() {
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem(NAME_KEY);
}