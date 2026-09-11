import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DISHES, ROUNDS, QUOTES, shuffle, type Dish } from "@/data/dishes";
import { DishCard } from "@/components/DishCard";
import { addFavourites, getFavourites, toggleFavourite } from "@/lib/favourites";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Marketplace — Find the Dish You Saw" },
      {
        name: "description",
        content:
          "Five gentle rounds: look at a Northeast Indian dish, then find it again in the market stall. No timers to fear, no wrong turns.",
      },
      { property: "og:title", content: "Play Marketplace — Find the Dish You Saw" },
      {
        property: "og:description",
        content: "Five gentle rounds of remembering Northeast Indian dishes.",
      },
    ],
  }),
  component: Play,
});

type Phase = "show" | "choose" | "round-done" | "finished";

function buildRound(index: number) {
  const cfg = ROUNDS[index]!;
  const pool = shuffle(DISHES);
  const targets = pool.slice(0, cfg.targets);
  const distractors = pool.slice(cfg.targets, cfg.options);
  return { cfg, targets, options: shuffle([...targets, ...distractors]) };
}

function Play() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<ReturnType<typeof buildRound> | null>(null);
  const [phase, setPhase] = useState<Phase>("show");
  const [secondsLeft, setSecondsLeft] = useState(ROUNDS[0]!.seconds);
  const [found, setFound] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [seen, setSeen] = useState<Dish[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]!, [roundIndex]);

  useEffect(() => {
    setFavourites(getFavourites());
    setRound((r) => r ?? buildRound(0));
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    if (secondsLeft <= 0) {
      setPhase("choose");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  function startRound(index: number) {
    const next = buildRound(index);
    setRoundIndex(index);
    setRound(next);
    setSecondsLeft(next.cfg.seconds);
    setFound([]);
    setWrongId(null);
    setPhase("show");
  }

  function pick(dish: Dish) {
    if (!round || found.includes(dish.id)) return;
    const isTarget = round.targets.some((t) => t.id === dish.id);
    if (!isTarget) {
      setWrongId(dish.id);
      setTimeout(() => setWrongId(null), 1100);
      return;
    }
    const nextFound = [...found, dish.id];
    setFound(nextFound);
    setWrongId(null);
    if (round && nextFound.length === round.targets.length) {
      setSeen((prev) => [...prev, ...round.targets]);
      setTimeout(() => setPhase(roundIndex === ROUNDS.length - 1 ? "finished" : "round-done"), 700);
    }
  }

  const progress = `Round ${roundIndex + 1} of ${ROUNDS.length}`;

  if (!round) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="text-lg text-muted-foreground">Setting up the market…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-base font-semibold text-muted-foreground underline">
          Home
        </Link>
        <div className="flex gap-1.5">
          {ROUNDS.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-8 rounded-full ${i <= roundIndex ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </header>

      {phase === "show" && (
        <section className="mt-8 text-center animate-gentle-pop">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {progress}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {round.targets.length === 1 ? "Look at this dish" : "Look at these dishes"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Take your time. You will find {round.targets.length === 1 ? "it" : "them"} again next.
          </p>
          <div
            className={`mx-auto mt-6 grid max-w-xl gap-4 ${
              round.targets.length === 1 ? "grid-cols-1 max-w-xs" : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {round.targets.map((d) => (
              <DishCard key={d.id} dish={d} size="lg" />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase("choose")}
            className="mt-7 rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground"
          >
            I'm ready ({secondsLeft})
          </button>
        </section>
      )}

      {(phase === "choose" || phase === "round-done") && (
        <section className="mt-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {progress}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {round.targets.length === 1
              ? "Which dish did you just see?"
              : `Find the ${round.targets.length} dishes you just saw`}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {wrongId ? "Not that one — try another. You're doing fine." : "Tap a dish when you're ready."}
          </p>

          <div
            className={`mt-6 grid gap-4 ${
              round.options.length <= 4
                ? "grid-cols-2"
                : round.options.length <= 6
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            }`}
          >
            {round.options.map((d) => (
              <DishCard
                key={d.id}
                dish={d}
                onClick={() => pick(d)}
                disabled={phase === "round-done"}
                state={
                  found.includes(d.id)
                    ? "correct"
                    : wrongId === d.id
                      ? "wrong"
                      : phase === "round-done"
                        ? "dim"
                        : "idle"
                }
              />
            ))}
          </div>

          {phase === "round-done" && (
            <div className="mt-8 rounded-3xl card-soft p-6 animate-gentle-pop">
              <p className="text-2xl font-bold">Lovely. You remembered.</p>
              <p className="mt-1 text-muted-foreground">{quote}</p>
              <button
                type="button"
                onClick={() => startRound(roundIndex + 1)}
                className="mt-5 rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground"
              >
                Next round
              </button>
            </div>
          )}
        </section>
      )}

      {phase === "finished" && (
        <section className="mt-10 text-center animate-gentle-pop">
          <h1 className="text-4xl font-bold">All five rounds done</h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">{quote}</p>

          <h2 className="mt-10 text-xl font-bold">The dishes you met today</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {seen.map((d, i) => (
              <div key={`${d.id}-${i}`} className="relative">
                <DishCard dish={d} />
                <button
                  type="button"
                  aria-label={`Add ${d.name} to favourites`}
                  onClick={() => setFavourites(toggleFavourite(d.id))}
                  className="absolute right-2 top-2 rounded-full bg-card/90 px-3 py-1.5 text-lg leading-none shadow"
                >
                  {favourites.includes(d.id) ? "♥" : "♡"}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setFavourites(addFavourites(seen.map((d) => d.id)))}
              className="rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-foreground"
            >
              Add all to favourites
            </button>
            <button
              type="button"
              onClick={() => {
                setSeen([]);
                startRound(0);
              }}
              className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground"
            >
              Play again
            </button>
            <Link
              to="/favourites"
              className="rounded-full border-2 border-border px-8 py-4 text-lg font-bold text-foreground"
            >
              See favourites
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
