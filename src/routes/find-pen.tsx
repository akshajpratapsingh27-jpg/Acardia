import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ROOMS, QUOTES, type Room, type Shape } from "@/lib/rooms";
import pandaHug from "@/assets/panda-hug.png";

export const Route = createFileRoute("/find-pen")({
  head: () => ({
    meta: [
      { title: "Find the Pen — Cosy Room Memory Game" },
      {
        name: "description",
        content:
          "Watch a pen hide in a cosy room for three seconds, then find it from memory. Five rooms, gentle scoring and a kind word at the end.",
      },
      { property: "og:title", content: "Find the Pen — Cosy Room Memory Game" },
      {
        property: "og:description",
        content:
          "Watch a pen hide in a cosy room for three seconds, then find it from memory. Five rooms, gentle scoring and a kind word at the end.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindPen,
});

const FAVORITES_KEY = "momo-favorite-pen-hunts";
const PEEK_MS = 3000;
const HIT_RADIUS = 7;

type Favorite = { date: string; score: number; quote: string };
type Phase = "peek" | "hunt" | "found";

function ShapeNode({ s }: { s: Shape }) {
  if (s.t === "rect") {
    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r ?? 0.6} fill={s.fill} />;
  }
  if (s.t === "circle") {
    return <circle cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />;
  }
  if (s.t === "poly") {
    return <polygon points={s.points} fill={s.fill} />;
  }
  return (
    <line
      x1={s.x1}
      y1={s.y1}
      x2={s.x2}
      y2={s.y2}
      stroke={s.stroke}
      strokeWidth={s.w ?? 0.6}
      strokeLinecap="round"
    />
  );
}

function Pen({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-5} y={-0.9} width={8} height={1.8} rx={0.9} fill="#2f6fd0" />
      <rect x={2.6} y={-0.9} width={1.6} height={1.8} fill="#d8dee8" />
      <polygon points="4.2,-0.9 6.4,0 4.2,0.9" fill="#f0d9a8" />
      <polygon points="6,-0.35 6.6,0 6,0.35" fill="#22314a" />
      <rect x={-4.4} y={-1.6} width={1.2} height={1.4} rx={0.5} fill="#c8d4e6" />
    </g>
  );
}

function RoomScene({
  room,
  showPen,
  interactive,
  onGuess,
  marks,
}: {
  room: Room;
  showPen: boolean;
  interactive: boolean;
  onGuess: (x: number, y: number) => void;
  marks: { x: number; y: number }[];
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    onGuess(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 70);
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 70"
      role="img"
      aria-label={`${room.name}${showPen ? " with the pen visible" : ""}`}
      onClick={handleClick}
      className={`w-full rounded-[2rem] shadow-[var(--shadow-soft)] ${
        interactive ? "cursor-crosshair" : ""
      }`}
    >
      <rect x={0} y={0} width={100} height={70} fill={room.wall} />
      <rect x={0} y={0} width={100} height={56} fill={room.wall2} />
      <rect x={0} y={56} width={100} height={14} fill={room.floor} />
      {room.shapes.map((s, i) => (
        <ShapeNode key={i} s={s} />
      ))}
      {showPen && <Pen x={room.pen.x} y={room.pen.y} rot={room.pen.rot} />}
      {showPen && (
        <circle
          cx={room.pen.x}
          cy={room.pen.y}
          r={9}
          fill="none"
          stroke="#fff3c4"
          strokeWidth={0.7}
          opacity={0.65}
        />
      )}
      {marks.map((m, i) => (
        <g key={i} opacity={0.7}>
          <line
            x1={m.x - 2}
            y1={m.y - 2}
            x2={m.x + 2}
            y2={m.y + 2}
            stroke="#ffffff"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <line
            x1={m.x + 2}
            y1={m.y - 2}
            x2={m.x - 2}
            y2={m.y + 2}
            stroke="#ffffff"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

function FindPen() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("peek");
  const [misses, setMisses] = useState<{ x: number; y: number }[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [quote, setQuote] = useState<string>(QUOTES[0]!);
  const [saved, setSaved] = useState(false);

  const room = ROOMS[roundIndex]!;

  useEffect(() => {
    if (phase !== "peek") return;
    const t = window.setTimeout(() => setPhase("hunt"), PEEK_MS);
    return () => window.clearTimeout(t);
  }, [phase, roundIndex]);

  const handleGuess = (x: number, y: number) => {
    if (phase !== "hunt") return;
    const hit = Math.hypot(x - room.pen.x, y - room.pen.y) <= HIT_RADIUS;
    if (!hit) {
      setMisses((m) => [...m, { x, y }]);
      return;
    }
    const score = Math.max(5, 20 - misses.length * 3);
    setPhase("found");
    window.setTimeout(() => {
      setScores((prev) => [...prev, score]);
      if (roundIndex === ROOMS.length - 1) {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]!);
        setFinished(true);
      } else {
        setRoundIndex((i) => i + 1);
        setMisses([]);
        setPhase("peek");
      }
    }, 1400);
  };

  const total = scores.reduce((a, b) => a + b, 0);

  const restart = () => {
    setRoundIndex(0);
    setMisses([]);
    setScores([]);
    setPhase("peek");
    setFinished(false);
    setSaved(false);
  };

  const addFavorite = () => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      const list: Favorite[] = raw ? JSON.parse(raw) : [];
      list.unshift({ date: new Date().toISOString(), score: total, quote });
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(list.slice(0, 20)));
    } catch {
      /* storage unavailable — still acknowledge */
    }
    setSaved(true);
  };

  if (finished) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-warm)]" aria-hidden />
        <section className="relative flex w-full max-w-md flex-col items-center text-center">
          <img
            src={pandaHug}
            alt="Red panda hugging the puzzle tile"
            width={1024}
            height={1024}
            loading="lazy"
            className="w-48 animate-float-cuddle drop-shadow-[var(--shadow-soft)]"
          />
          <h1 className="mt-2 font-display text-4xl text-foreground">All five rooms searched!</h1>
          <p className="mt-4 font-display text-6xl text-primary">{total}</p>
          <p className="text-sm text-muted-foreground">points</p>
          <p className="mt-6 rounded-3xl bg-card/70 px-6 py-5 text-lg leading-relaxed text-foreground shadow-[var(--shadow-soft)]">
            {quote}
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            <button
              onClick={addFavorite}
              disabled={saved}
              className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-60"
            >
              {saved ? "Saved to favourites" : "Add to favourites"}
            </button>
            <button
              onClick={restart}
              className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Play again
            </button>
            <Link to="/" className="py-2 text-base text-muted-foreground underline-offset-4 hover:underline">
              Back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center px-5 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-warm)]" aria-hidden />

      <header className="relative flex w-full max-w-2xl items-center justify-between">
        <Link to="/" className="text-base text-muted-foreground underline-offset-4 hover:underline">
          Home
        </Link>
        <p className="font-display text-xl text-foreground">
          Room {roundIndex + 1} of {ROOMS.length}
        </p>
      </header>

      <section className="relative mt-5 flex w-full max-w-2xl flex-col items-center">
        <div className="flex items-center gap-3">
          <img
            src={pandaHug}
            alt="Little Momo the red panda, watching the room with you"
            width={1024}
            height={1024}
            className="w-20 animate-float-cuddle drop-shadow-[var(--shadow-soft)]"
          />
          <p className="max-w-xs text-left text-lg text-muted-foreground">
            {phase === "peek"
              ? "Look closely — the pen is showing for a moment."
              : phase === "found"
                ? "You found it! Lovely spotting."
                : "Where was the pen? Tap the spot."}
          </p>
        </div>

        <p className="mt-4 font-display text-2xl text-foreground">{room.name}</p>

        <div className="mt-3 w-full">
          <RoomScene
            room={room}
            showPen={phase !== "hunt"}
            interactive={phase === "hunt"}
            onGuess={handleGuess}
            marks={misses}
          />
        </div>

        <p className="mt-4 h-6 text-base text-muted-foreground">
          {phase === "hunt" && misses.length > 0 ? "Not quite — take another look." : ""}
        </p>
      </section>
    </main>
  );
}
