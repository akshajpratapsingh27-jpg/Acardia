import momos from "@/assets/dish-momos.jpg";
import thukpa from "@/assets/dish-thukpa.jpg";
import masorTenga from "@/assets/dish-masor-tenga.jpg";
import jadoh from "@/assets/dish-jadoh.jpg";
import pitha from "@/assets/dish-pitha.jpg";
import chakhao from "@/assets/dish-chakhao.jpg";
import smokedPork from "@/assets/dish-smoked-pork.jpg";
import eromba from "@/assets/dish-eromba.jpg";
import assamTea from "@/assets/dish-assam-tea.jpg";
import bambooRice from "@/assets/dish-bamboo-rice.jpg";

export type DishId =
  | "momos"
  | "thukpa"
  | "masor-tenga"
  | "jadoh"
  | "pitha"
  | "chakhao"
  | "smoked-pork"
  | "eromba"
  | "assam-tea"
  | "bamboo-rice";

export type Dish = {
  id: DishId;
  name: string;
  place: string;
  image: string;
};

export const DISHES: Dish[] = [
  { id: "momos", name: "Momos", place: "Sikkim", image: momos },
  { id: "thukpa", name: "Thukpa", place: "Arunachal", image: thukpa },
  { id: "masor-tenga", name: "Masor Tenga", place: "Assam", image: masorTenga },
  { id: "jadoh", name: "Jadoh", place: "Meghalaya", image: jadoh },
  { id: "pitha", name: "Pitha", place: "Assam", image: pitha },
  { id: "chakhao", name: "Chak-hao Kheer", place: "Manipur", image: chakhao },
  { id: "smoked-pork", name: "Smoked Pork", place: "Nagaland", image: smokedPork },
  { id: "eromba", name: "Eromba", place: "Manipur", image: eromba },
  { id: "assam-tea", name: "Assam Tea", place: "Assam", image: assamTea },
  { id: "bamboo-rice", name: "Bamboo Rice", place: "Tripura", image: bambooRice },
];

export const DISH_BY_ID = Object.fromEntries(
  DISHES.map((d) => [d.id, d]),
) as Record<DishId, Dish>;

export const TOTAL_ROUNDS = 5;

/** Difficulty grows gently: more dishes to remember, more choices, less time. */
const LEVELS = [
  { show: 1, options: 3, seconds: 6 },
  { show: 1, options: 4, seconds: 6 },
  { show: 2, options: 5, seconds: 7 },
  { show: 2, options: 6, seconds: 6 },
  { show: 3, options: 8, seconds: 7 },
];

export const ROUNDS = LEVELS.map((level) => ({ ...level }));

export type Round = {
  targets: Dish[];
  options: Dish[];
  seconds: number;
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function buildRounds(): Round[] {
  return LEVELS.map((level) => {
    const pool = shuffle(DISHES);
    const targets = pool.slice(0, level.show);
    const fillers = pool.slice(level.show, level.options);
    return {
      targets,
      options: shuffle([...targets, ...fillers]),
      seconds: level.seconds,
    };
  });
}

export const QUOTES = [
  "Every memory you share makes the table warmer.",
  "You did beautifully today. Taste, look, and smile.",
  "Slow and gentle wins every time.",
  "Good food and good company never grow old.",
  "Your memories are a feast worth celebrating.",
];
