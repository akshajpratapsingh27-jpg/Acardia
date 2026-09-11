import masorTenga from "@/assets/dish-masor-tenga.jpg";
import jadoh from "@/assets/dish-jadoh.jpg";
import momo from "@/assets/dish-momo.jpg";
import thukpa from "@/assets/dish-thukpa.jpg";
import axone from "@/assets/dish-axone.jpg";
import chakhao from "@/assets/dish-chakhao.jpg";
import pitha from "@/assets/dish-pitha.jpg";
import eromba from "@/assets/dish-eromba.jpg";
import dohkhleh from "@/assets/dish-dohkhleh.jpg";
import bamboo from "@/assets/dish-bamboo.jpg";
import zan from "@/assets/dish-zan.jpg";
import bai from "@/assets/dish-bai.jpg";
import chakhwi from "@/assets/dish-chakhwi.jpg";

export type Dish = {
  id: string;
  name: string;
  origin: string;
  image: string;
};

export const dishes: Dish[] = [
  { id: "masor-tenga", name: "Masor Tenga", origin: "Assam", image: masorTenga },
  { id: "jadoh", name: "Jadoh", origin: "Meghalaya", image: jadoh },
  { id: "momo", name: "Momo", origin: "Sikkim", image: momo },
  { id: "thukpa", name: "Thukpa", origin: "Arunachal Pradesh", image: thukpa },
  { id: "axone", name: "Axone Pork", origin: "Nagaland", image: axone },
  { id: "chakhao", name: "Chak-hao Kheer", origin: "Manipur", image: chakhao },
  { id: "pitha", name: "Til Pitha", origin: "Assam", image: pitha },
  { id: "eromba", name: "Eromba", origin: "Manipur", image: eromba },
  { id: "dohkhleh", name: "Doh Khleh", origin: "Meghalaya", image: dohkhleh },
  { id: "bamboo", name: "Bamboo Shoot Curry", origin: "Nagaland", image: bamboo },
  { id: "zan", name: "Zan", origin: "Arunachal Pradesh", image: zan },
  { id: "bai", name: "Bai", origin: "Mizoram", image: bai },
  { id: "chakhwi", name: "Chakhwi", origin: "Tripura", image: chakhwi },
];

export const quotes = [
  "Every dish you remember keeps a story alive.",
  "Slow taste, sharp memory — you did beautifully.",
  "Little steps, big flavours. Come back tomorrow.",
  "You carried a whole market home in your memory.",
];

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}
