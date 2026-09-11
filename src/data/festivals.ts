import bihu from "@/assets/fest-bihu.jpg";
import hornbill from "@/assets/fest-hornbill.jpg";
import kharchi from "@/assets/fest-kharchi.jpg";
import losar from "@/assets/fest-losar.jpg";
import wangala from "@/assets/fest-wangala.jpg";
import yaoshang from "@/assets/fest-yaoshang.jpg";

export type Festival = {
  id: string;
  name: string;
  image: string;
};

export const FESTIVALS: Festival[] = [
  { id: "bihu", name: "Bihu", image: bihu },
  { id: "hornbill", name: "Hornbill Festival", image: hornbill },
  { id: "kharchi", name: "Kharchi", image: kharchi },
  { id: "losar", name: "Losar", image: losar },
  { id: "wangala", name: "Wangala", image: wangala },
  { id: "yaoshang", name: "Yaoshang", image: yaoshang },
];

export const GAME_SECONDS = 60;

export const FESTIVAL_QUOTES = [
  "A gentle memory is still a lovely memory.",
  "You matched those festivals beautifully.",
  "Small, steady steps make lovely wins.",
  "Every card you turned brought a little joy.",
  "The rhythm of memory can be calm and bright.",
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
