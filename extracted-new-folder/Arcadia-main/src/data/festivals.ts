import bihu from "@/assets/fest-bihu.jpg";
import hornbill from "@/assets/fest-hornbill.jpg";
import losar from "@/assets/fest-losar.jpg";
import wangala from "@/assets/fest-wangala.jpg";
import yaoshang from "@/assets/fest-yaoshang.jpg";
import kharchi from "@/assets/fest-kharchi.jpg";

export type Festival = {
  id: string;
  name: string;
  place: string;
  image: string;
};

export const FESTIVALS: Festival[] = [
  { id: "bihu", name: "Bihu", place: "Assam", image: bihu },
  { id: "hornbill", name: "Hornbill", place: "Nagaland", image: hornbill },
  { id: "losar", name: "Losar", place: "Sikkim", image: losar },
  { id: "wangala", name: "Wangala", place: "Meghalaya", image: wangala },
  { id: "yaoshang", name: "Yaoshang", place: "Manipur", image: yaoshang },
  { id: "kharchi", name: "Kharchi Puja", place: "Tripura", image: kharchi },
];

export const GAME_SECONDS = 300;

export const FESTIVAL_QUOTES = [
  "Every card you turned brought a festival back to life.",
  "You took your time, and that is exactly the right speed.",
  "Memories are like festivals — they return, year after year.",
  "Well done today. Joy does not need to be hurried.",
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
