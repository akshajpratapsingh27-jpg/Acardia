import type { TuneId } from "./natureSounds";
import rainImg from "@/assets/rain.jpg";
import waterfallImg from "@/assets/waterfall.jpg";
import leavesImg from "@/assets/leaves.jpg";
import firefliesImg from "@/assets/fireflies.jpg";
import oceanImg from "@/assets/ocean.jpg";
import campfireImg from "@/assets/campfire.jpg";
import birdsImg from "@/assets/birds.jpg";
import streamImg from "@/assets/stream.jpg";
import thunderImg from "@/assets/thunder.jpg";

export type Tune = {
  id: TuneId;
  /** Only used for alt text and screen readers - never shown as a label. */
  name: string;
  image: string;
};

export const TUNES: Tune[] = [
  { id: "rain", name: "Rainfall on the window", image: rainImg },
  { id: "waterfall", name: "A waterfall over rocks", image: waterfallImg },
  { id: "leaves", name: "Wind in the leaves", image: leavesImg },
  { id: "fireflies", name: "Fireflies and crickets at night", image: firefliesImg },
  { id: "ocean", name: "Ocean waves on the beach", image: oceanImg },
  { id: "campfire", name: "A crackling campfire", image: campfireImg },
  { id: "birds", name: "Little birds singing in the morning", image: birdsImg },
  { id: "stream", name: "A babbling forest stream", image: streamImg },
  { id: "thunder", name: "A gentle far away thunderstorm", image: thunderImg },
];

export const TUNE_BY_ID = Object.fromEntries(
  TUNES.map((t) => [t.id, t]),
) as Record<TuneId, Tune>;

/** Two choices for round 1, growing to four by round 5. */
export const CHOICES_PER_ROUND = [2, 2, 3, 3, 4];
export const TOTAL_ROUNDS = CHOICES_PER_ROUND.length;

export const QUOTES = [
  "Every sound you remember is a little piece of sunshine.",
  "You listened with your whole heart today. That is enough.",
  "Nature always sings back to those who listen.",
  "Slow and gentle wins every time.",
  "What a lovely walk through the woods we just had.",
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

export type Round = { answer: Tune; options: Tune[] };

export function buildRounds(): Round[] {
  const answers = shuffle(TUNES).slice(0, TOTAL_ROUNDS);
  return answers.map((answer, index) => {
    const distractors = shuffle(TUNES.filter((t) => t.id !== answer.id)).slice(
      0,
      (CHOICES_PER_ROUND[index] ?? 2) - 1,
    );
    return { answer, options: shuffle([answer, ...distractors]) };
  });
}
