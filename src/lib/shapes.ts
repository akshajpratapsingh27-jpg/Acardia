export type Point = { id: number; x: number; y: number };
export type Edge = [number, number];

export type ShapeRound = {
  name: string;
  points: Point[];
  edges: Edge[];
};

const p = (id: number, x: number, y: number): Point => ({ id, x, y });

export const ROUNDS: ShapeRound[] = [
  {
    name: "Triangle",
    points: [p(0, 50, 15), p(1, 15, 82), p(2, 85, 82)],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  },
  {
    name: "Square",
    points: [p(0, 20, 20), p(1, 80, 20), p(2, 80, 80), p(3, 20, 80)],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
  },
  {
    name: "Pentagon",
    points: [p(0, 50, 12), p(1, 88, 40), p(2, 73, 85), p(3, 27, 85), p(4, 12, 40)],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  {
    name: "House",
    points: [p(0, 50, 10), p(1, 86, 40), p(2, 86, 88), p(3, 14, 88), p(4, 14, 40)],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [4, 1],
    ],
  },
  {
    name: "Star",
    points: [
      p(0, 50, 8),
      p(1, 61, 36),
      p(2, 92, 38),
      p(3, 67, 57),
      p(4, 77, 88),
      p(5, 50, 70),
      p(6, 23, 88),
      p(7, 33, 57),
      p(8, 8, 38),
      p(9, 39, 36),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 0],
    ],
  },
];

export const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export const QUOTES = [
  "Every line you drew today was a small victory. Well done.",
  "Slow hands, steady heart — you did beautifully.",
  "You showed up and you finished. That is real strength.",
  "One dot at a time, you made something whole.",
  "Your mind did lovely work today. Be proud of it.",
];
