import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";
import room4 from "@/assets/room-4.jpg";
import room5 from "@/assets/room-5.jpg";

export type Room = { id: string; name: string; src: string };

export const ROOMS: Room[] = [
  { id: "bedroom", name: "Cozy Bedroom", src: room1 },
  { id: "workspace", name: "Calm Workspace", src: room2 },
  { id: "kitchen", name: "Sunny Kitchen", src: room3 },
  { id: "reading", name: "Reading Corner", src: room4 },
  { id: "studio", name: "Artist Studio", src: room5 },
];

export const TOTAL_ROUNDS = 5;
export const PREVIEW_SECONDS = 3;

/** Per-level difficulty: pen size as % of room width, time to find it, and opacity blend. */
export const LEVELS = [
  { size: 9, time: 30, opacity: 1, rotate: false },
  { size: 7, time: 25, opacity: 1, rotate: true },
  { size: 5.5, time: 20, opacity: 0.95, rotate: true },
  { size: 4.2, time: 15, opacity: 0.9, rotate: true },
  { size: 3.2, time: 12, opacity: 0.85, rotate: true },
] as const;

export const QUOTES: readonly [string, ...string[]] = [
  "Small steps every day add up to big journeys.",
  "Patience is not waiting — it's how you behave while you wait.",
  "Every expert was once a beginner who kept looking.",
  "Slow down. The details are where the magic hides.",
  "You didn't come this far to only come this far.",
  "Curiosity is the compass; keep exploring.",
  "Progress, not perfection.",
  "The calm mind sees what the hurried one misses.",
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}
