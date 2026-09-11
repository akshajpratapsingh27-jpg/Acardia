import { createFileRoute } from "@tanstack/react-router";
import { Link } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dishes, quotes, shuffle, type Dish } from "@/data/dishes1";
import MomoPanda from "@/assets/momo-basket.png";
import { ArrowLeft, Play as PlayIcon } from "lucide-react";

export const Route = createFileRoute("/play5")({
  head: () => ({
    meta: [
      { title: "Play Market Place Dishes" },
      {
        name: "description",
        content:
          "Five rounds of Northeast Indian dishes: watch them, then pick the ones you saw as the levels grow.",
      },
      { property: "og:title", content: "Play Market Place Dishes" },
      {
        property: "og:description",
        content: "Watch the dishes, then pick the right ones across five growing rounds.",
      },
    ],
  }),
  component: Play5Container,
});

const TOTAL_ROUNDS = 5;
const FAV_KEY = "market-place-favorites";

type Phase = "memorise" | "choose" | "feedback" | "done";

type RoundSetup = { targets: Dish[]; options: Dish[]; showMs: number };

function buildRound(round: number): RoundSetup {
  const targetCount = round; 
  const pool = shuffle(dishes);
  const targets = pool.slice(0, targetCount);
  const decoys = pool.slice(targetCount, targetCount + Math.min(3 + round, 8));
  return {
    targets,
    options: shuffle([...targets, ...decoys]),
    showMs: Math.max(1800, 4200 - (round - 1) * 500),
  };
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-warm)]" aria-hidden />

      <header className="absolute top-8 left-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-base font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>
      </header>

      <section className="relative flex flex-col items-center gap-6 text-center max-w-md">
        <img
          src={MomoPanda}
          alt="Momo the red panda"
          width={1024}
          height={1024}
          className="h-64 w-64 object-contain drop-shadow-sm sm:h-80 sm:w-80"
        />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Market Place
        </h1>
        <p className="text-lg text-muted-foreground">
          Take it slow. Watch the dishes, then pick the right ones across five growing rounds.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-xl font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <PlayIcon className="h-6 w-6" fill="currentColor" />
          Start playing
        </button>
      </section>
    </main>
  );
}

function PlayPage() {
  const [round, setRound] = useState(1);
  const [setup, setSetup] = useState<RoundSetup>(() => buildRound(1));
  const [phase, setPhase] = useState<Phase>("memorise");
  const [picked, setPicked] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (phase !== "memorise") return;
    const t = setTimeout(() => setPhase("choose"), setup.showMs);
    return () => clearTimeout(t);
  }, [phase, setup]);

  const targetIds = useMemo(() => setup.targets.map((d) => d.id), [setup]);

  const togglePick = (id: string) => {
    if (phase !== "choose") return;
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= targetIds.length) return prev;
      return [...prev, id];
    });
  };

  const submit = () => {
    const correct = picked.filter((p) => targetIds.includes(p)).length;
    setScore((s) => s + correct);
    setPhase("feedback");
  };

  const next = () => {
    if (round >= TOTAL_ROUNDS) {
      setPhase("done");
      return;
    }
    const nextRound = round + 1;
    setRound(nextRound);
    setSetup(buildRound(nextRound));
    setPicked([]);
    setPhase("memorise");
  };

  const restart = useCallback(() => {
    setRound(1);
    setSetup(buildRound(1));
    setPicked([]);
    setScore(0);
    setSaved(false);
    setPhase("memorise");
  }, []);

  const addToFavorites = () => {
    const ids = Array.from(new Set([...favorites, ...targetIds]));
    setFavorites(ids);
    setSaved(true);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  const totalPossible = (TOTAL_ROUNDS * (TOTAL_ROUNDS + 1)) / 2;
  const quote = quotes[score % quotes.length];

  if (phase === "done") {
    const favDishes = dishes.filter((d) => favorites.includes(d.id));
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-14 text-center">
        <h1 className="text-4xl font-extrabold text-foreground">Basket packed!</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          You remembered {score} of {totalPossible} dishes.
        </p>
        <p className="mt-6 rounded-2xl bg-card px-6 py-5 text-lg italic text-foreground shadow-[var(--shadow-soft)]">
          “{quote}”
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Play again
          </button>
          <button
            onClick={addToFavorites}
            className="rounded-full border border-border bg-card px-8 py-3 font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {saved ? "Added to favorites" : "Add to favorites"}
          </button>
          <Link
            to="/play"
            className="rounded-full px-8 py-3 font-semibold text-muted-foreground hover:text-foreground"
          >
            Back to Games
          </Link>
        </div>
        {favDishes.length > 0 && (
          <div className="mt-10 w-full">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Your favorites
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {favDishes.map((d) => (
                <DishCard key={d.id} dish={d} />
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10">
      <header className="flex items-center justify-between text-sm text-muted-foreground">
        <Link to="/play" className="hover:text-foreground">
          ← Back to Games
        </Link>
        <span>
          Round {round} of {TOTAL_ROUNDS} · Level {round}
        </span>
        <span>Score {score}</span>
      </header>

      {phase === "memorise" && (
        <section className="mt-10 text-center">
          <h1 className="text-2xl font-bold text-foreground">Remember these dishes</h1>
          <p className="mt-1 text-sm text-muted-foreground">They disappear in a moment…</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {setup.targets.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
        </section>
      )}

      {(phase === "choose" || phase === "feedback") && (
        <section className="mt-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {phase === "choose"
                ? `Pick the ${targetIds.length} dish${targetIds.length > 1 ? "es" : ""} you saw`
                : "Here's how you did"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {phase === "choose"
                ? `${picked.length}/${targetIds.length} selected`
                : `${picked.filter((p) => targetIds.includes(p)).length} correct this round`}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {setup.options.map((d) => {
              const isPicked = picked.includes(d.id);
              const isTarget = targetIds.includes(d.id);
              const state =
                phase === "feedback"
                  ? isTarget
                    ? "correct"
                    : isPicked
                      ? "wrong"
                      : "idle"
                  : isPicked
                    ? "picked"
                    : "idle";
              return (
                <button key={d.id} onClick={() => togglePick(d.id)} className="text-left">
                  <DishCard dish={d} state={state} />
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            {phase === "choose" ? (
              <button
                onClick={submit}
                disabled={picked.length !== targetIds.length}
                className="rounded-full bg-primary px-10 py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
              >
                Check
              </button>
            ) : (
              <button
                onClick={next}
                className="rounded-full bg-primary px-10 py-3 font-semibold text-primary-foreground"
              >
                {round >= TOTAL_ROUNDS ? "See results" : "Next round"}
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function DishCard({
  dish,
  state = "idle",
}: {
  dish: Dish;
  state?: "idle" | "picked" | "correct" | "wrong";
}) {
  const ring =
    state === "picked"
      ? "ring-2 ring-primary"
      : state === "correct"
        ? "ring-2 ring-[var(--success)]"
        : state === "wrong"
          ? "ring-2 ring-destructive"
          : "ring-1 ring-border";
  return (
    <figure
      className={`overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)] ${ring} transition-transform hover:scale-[1.02]`}
    >
      <img
        src={dish.image}
        alt={dish.name}
        loading="lazy"
        width={512}
        height={512}
        className="aspect-square w-full object-cover"
      />
      <figcaption className="px-2 py-1.5 text-[10px] lowercase tracking-wide text-muted-foreground">
        {dish.name.toLowerCase()} · {dish.origin.toLowerCase()}
      </figcaption>
    </figure>
  );
}

export default function Play5Container() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPlaying) {
    return <Intro onStart={() => setIsPlaying(true)} />;
  }

  return <PlayPage />;
}