import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUNDS, QUOTES, edgeKey, type ShapeRound } from "@/lib/shapes";
import pandaHug from "@/assets/panda-hug.png";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Connect the Dots — Gentle Shape Game" },
      {
        name: "description",
        content:
          "Slide from dot to dot to copy each shape. Five calm rounds designed for memory care, with points and a kind word at the end.",
      },
      { property: "og:title", content: "Play Connect the Dots — Gentle Shape Game" },
      {
        property: "og:description",
        content:
          "Slide from dot to dot to copy each shape. Five calm rounds designed for memory care, with points and a kind word at the end.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Play,
});

const FAVORITES_KEY = "momo-favorite-rounds";

type Favorite = { date: string; score: number; quote: string };

function ShapePreview({ round }: { round: ShapeRound }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-label={`Shape to copy: ${round.name}`}>
      {round.edges.map(([a, b]) => {
        const pa = round.points[a]!;
        const pb = round.points[b]!;
        return (
          <line
            key={edgeKey(a, b)}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Play() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [finished, setFinished] = useState(false);
  const [quote, setQuote] = useState<string>(QUOTES[0]!);
  const [saved, setSaved] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const round = ROUNDS[roundIndex]!;
  const complete = drawn.length === round.edges.length;

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const dotAt = useCallback(
    (pos: { x: number; y: number }) => {
      let best: number | null = null;
      let bestDist = 10;
      for (const point of round.points) {
        const d = Math.hypot(point.x - pos.x, point.y - pos.y);
        if (d < bestDist) {
          bestDist = d;
          best = point.id;
        }
      }
      return best;
    },
    [round],
  );

  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (complete) return;
    const pos = toLocal(e.clientX, e.clientY);
    if (!pos) return;
    const dot = dotAt(pos);
    if (dot === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setCurrent(dot);
    setCursor(pos);
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (current === null) return;
    const pos = toLocal(e.clientX, e.clientY);
    if (!pos) return;
    setCursor(pos);
    const dot = dotAt(pos);
    if (dot === null || dot === current) return;

    const key = edgeKey(current, dot);
    const isTarget = round.edges.some(([a, b]) => edgeKey(a, b) === key);
    if (isTarget) {
      setDrawn((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setCurrent(dot);
    } else {
      setMistakes((m) => m + 1);
      setCurrent(dot);
    }
  };

  const handleUp = () => {
    setCurrent(null);
    setCursor(null);
  };

  useEffect(() => {
    if (!complete) return;
    const roundScore = Math.max(5, 20 - mistakes * 2);
    const timer = window.setTimeout(() => {
      setScores((prev) => [...prev, roundScore]);
      if (roundIndex === ROUNDS.length - 1) {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]!);
        setFinished(true);
      } else {
        setRoundIndex((i) => i + 1);
        setDrawn([]);
        setMistakes(0);
      }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [complete, mistakes, roundIndex]);

  const total = scores.reduce((a, b) => a + b, 0);

  const restart = () => {
    setRoundIndex(0);
    setDrawn([]);
    setMistakes(0);
    setScores([]);
    setFinished(false);
    setSaved(false);
  };

  const addFavorite = () => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      const list: Favorite[] = raw ? JSON.parse(raw) : [];
      list.unshift({ date: new Date().toISOString(), score: total, quote });
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(list.slice(0, 20)));
      setSaved(true);
    } catch {
      setSaved(true);
    }
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
          <h1 className="mt-2 font-display text-4xl text-foreground">All five done!</h1>
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

      <header className="relative flex w-full max-w-xl items-center justify-between">
        <Link to="/" className="text-base text-muted-foreground underline-offset-4 hover:underline">
          Home
        </Link>
        <p className="font-display text-xl text-foreground">
          Round {roundIndex + 1} of {ROUNDS.length}
        </p>
      </header>

      <section className="relative mt-6 flex w-full max-w-xl flex-col items-center">
        <p className="text-lg text-muted-foreground">Make this shape</p>
        <div className="mt-3 h-28 w-28 rounded-3xl bg-card/80 p-4 text-accent shadow-[var(--shadow-soft)]">
          <ShapePreview round={round} />
        </div>

        <p className="mt-6 text-lg text-muted-foreground">Slide from dot to dot</p>

        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          role="application"
          aria-label={`Connect the dots to draw a ${round.name}`}
          className="mt-3 aspect-square w-full max-w-md touch-none rounded-[2rem] bg-card/80 shadow-[var(--shadow-soft)]"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        >
          {drawn.map((key) => {
            const [a, b] = key.split("-").map(Number);
            const pa = round.points.find((pt) => pt.id === a)!;
            const pb = round.points.find((pt) => pt.id === b)!;
            return (
              <line
                key={key}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                className="stroke-primary"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {current !== null && cursor && (
            <line
              x1={round.points.find((pt) => pt.id === current)!.x}
              y1={round.points.find((pt) => pt.id === current)!.y}
              x2={cursor.x}
              y2={cursor.y}
              className="stroke-accent"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}

          {round.points.map((pt) => (
            <circle
              key={pt.id}
              cx={pt.x}
              cy={pt.y}
              r={current === pt.id ? 4.6 : 3.4}
              className={current === pt.id ? "fill-primary" : "fill-foreground/70"}
            />
          ))}
        </svg>

        {complete && (
          <p className="mt-5 animate-float-cuddle font-display text-2xl text-primary">Lovely work!</p>
        )}
      </section>
    </main>
  );
}
