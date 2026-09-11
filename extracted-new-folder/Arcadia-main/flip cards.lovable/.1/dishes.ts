import jadoh from "@/assets/dish-jadoh.jpg";
import momo from "@/assets/dish-momo.jpg";
import thukpa from "@/assets/dish-thukpa.jpg";
import masorTenga from "@/assets/dish-masor-tenga.jpg";
import eromba from "@/assets/dish-eromba.jpg";
import axonePork from "@/assets/dish-axone-pork.jpg";
import bambooShoot from "@/assets/dish-bamboo-shoot.jpg";
import chakHao from "@/assets/dish-chak-hao.jpg";
import pitha from "@/assets/dish-pitha.jpg";
import pukhlein from "@/assets/dish-pukhlein.jpg";
import zan from "@/assets/dish-zan.jpg";
import tungrymbai from "@/assets/dish-tungrymbai.jpg";

export type Dish = {
  id: string;
  name: string;
  place: string;
  image: string;
};

export const DISHES: Dish[] = [
  { id: "jadoh", name: "Jadoh", place: "Meghalaya", image: jadoh },
  { id: "momo", name: "Momo", place: "Sikkim", image: momo },
  { id: "thukpa", name: "Thukpa", place: "Arunachal", image: thukpa },
  { id: "masor-tenga", name: "Masor Tenga", place: "Assam", image: masorTenga },
  { id: "eromba", name: "Eromba", place: "Manipur", image: eromba },
  { id: "axone-pork", name: "Pork with Axone", place: "Nagaland", image: axonePork },
  { id: "bamboo-shoot", name: "Bamboo Shoot Curry", place: "Tripura", image: bambooShoot },
  { id: "chak-hao", name: "Chak Hao Kheer", place: "Manipur", image: chakHao },
  { id: "pitha", name: "Pitha", place: "Assam", image: pitha },
  { id: "pukhlein", name: "Pukhlein", place: "Meghalaya", image: pukhlein },
  { id: "zan", name: "Zan", place: "Arunachal", image: zan },
  { id: "tungrymbai", name: "Tungrymbai", place: "Meghalaya", image: tungrymbai },
];

/** Round settings: gentle start, slowly more to remember and choose from. */
export const ROUNDS = [
  { targets: 1, options: 4, seconds: 8 },
  { targets: 1, options: 6, seconds: 8 },
  { targets: 2, options: 6, seconds: 10 },
  { targets: 2, options: 9, seconds: 12 },
  { targets: 3, options: 12, seconds: 14 },
];

export const QUOTES = [
  "Every dish you remembered is a memory that came home to you.",
  "Slowly, gently, you did it. That is more than enough today.",
  "Your mind is like a warm kitchen — full of things worth keeping.",
  "You took your time, and that is exactly the right speed.",
];

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}
