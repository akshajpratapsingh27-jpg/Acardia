import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Heart, RotateCcw, Star } from "lucide-react";
import momo from "@/assets/momo.png";
import {
  buildRounds,
  DISH_BY_ID,
  QUOTES,
  TOTAL_ROUNDS,
  type Dish,
  type DishId,
  type Round,
} from "@/lib/dishes";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace - A Gentle Northeast Food Memory Game" },
      {
        name: "description",
        content:
          "Marketplace is a calm picture memory game. Look at Northeast Indian dishes, then find them again in the market stall.",
      },
      { property: "og:title", content: "Marketplace - A Gentle Food Memory Game" },
      {
        property: "og:description",
        content:
          "Five soothing rounds of picture matching with momos, thukpa, pitha and more Northeast Indian dishes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketplace,
});

type Screen = "intro" | "show" | "pick" | "done";

const FAV_KEY = "marketplace-favorites";

function DishCard({
  dish,
  size = "md",
  state = "idle",
  onClick,
}: {
  dish: Dish;
  size?: "sm" | "md" | "lg";
  state?: "idle" | "correct" | "wrong" | "chosen";
  onClick?: () => void;
}) {
  const ring =
    state === "correct"
      ? "ring-4 ring-[oklch(0.62_0.14_150)]"
      : state === "wrong"
        ? "ring-4 ring-destructive/70 opacity-60"
        : state === "chosen"
          ? "ring-4 ring-primary"
          : "ring-1 ring-border";

  const box =
    size === "lg" ? "w-56 sm:w-72" : size === "sm" ? "w-28 sm:w-32" : "w-36 sm:w-44";

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`group ${box} overflow-hidden rounded-3xl bg-card shadow-sm transition-transform ${ring} ${
        onClick ? "hover:scale-[1.03] active:scale-95" : ""
      }`}
      aria-label={dish.name}
    >
      <img
        src={dish.image}
        alt={dish.name}
        width={768}
        height={768}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
      <p className="px-2 pb-2 pt-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
        {dish.name}
      </p>
    </Tag>
  );
}

function Marketplace() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<DishId[]>([]);
  const [reveal, setReveal] = useState(false);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState<DishId[]>([]);
  const [favorites, setFavorites] = useState<DishId[]>([]);
  const [quote, setQuote] = useState(QUOTES[0]!);
  const [left, setLeft] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw) as DishId[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const round = rounds[index];

  const beginRound = (list: Round[], i: number) => {
    const r = list[i]!;
    setPicked([]);
    setReveal(false);
    setLeft(r.seconds);
    setScreen("show");
    const tick = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          setScreen("pick");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    timers.current.push(tick);
  };

  const start = () => {
    const list = buildRounds();
    setRounds(list);
    setIndex(0);
    setScore(0);
    setSeen([]);
    beginRound(list, 0);
  };

  const choose = (id: DishId) => {
    if (!round || reveal) return;
    const next = picked.includes(id)
      ? picked.filter((p) => p !== id)
      : [...picked, id];
    setPicked(next);
    if (next.length === round.targets.length) {
      setReveal(true);
      const ids = round.targets.map((t) => t.id);
      const hits = next.filter((p) => ids.includes(p)).length;
      setScore((s) => s + hits * 20);
      setSeen((s) => [...new Set([...s, ...ids])]);
      const t = window.setTimeout(() => {
        if (index + 1 >= TOTAL_ROUNDS) {
          setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]!);
          setScreen("done");
        } else {
          setIndex(index + 1);
          beginRound(rounds, index + 1);
        }
      }, 2400);
      timers.current.push(t);
    }
  };

  const toggleFavorite = (id: DishId) => {
    setFavorites((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {screen === "intro" && (
          <>
            <img
              src={momo}
              alt="Momo the red panda holding a basket"
              width={420}
              height={420}
              className="w-64 sm:w-80"
            />
            <h1 className="mt-2 text-5xl font-bold text-foreground sm:text-6xl">
              Marketplace
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Take it slow. Little Momo is holding the basket for you.
            </p>
            <button
              onClick={start}
              className="mt-8 rounded-full bg-primary px-12 py-5 text-xl font-semibold text-primary-foreground shadow-md transition hover:brightness-105 active:scale-95"
            >
              Start playing
            </button>
          </>
        )}

        {(screen === "show" || screen === "pick") && round && (
          <>
            <div className="mb-6 flex items-center gap-2">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${
                    i <= index ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {screen === "show" ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-5">
                  {round.targets.map((d) => (
                    <DishCard key={d.id} dish={d} size="lg" />
                  ))}
                </div>
                <div
                  className="mt-8 h-3 w-56 overflow-hidden rounded-full bg-muted"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${(left / round.seconds) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                  {round.targets.map((_, i) => (
                    <span
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        picked[i]
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-dashed border-muted-foreground/40"
                      }`}
                    >
                      {picked[i] ? <Check className="h-5 w-5" /> : null}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {round.options.map((d) => {
                    const isTarget = round.targets.some((t) => t.id === d.id);
                    const isPicked = picked.includes(d.id);
                    const state = reveal
                      ? isTarget
                        ? "correct"
                        : isPicked
                          ? "wrong"
                          : "idle"
                      : isPicked
                        ? "chosen"
                        : "idle";
                    return (
                      <DishCard
                        key={d.id}
                        dish={d}
                        state={state}
                        onClick={() => choose(d.id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {screen === "done" && (
          <>
            <img
              src={momo}
              alt="Momo the red panda cheering"
              width={420}
              height={420}
              className="w-44 sm:w-56"
            />
            <div className="mt-2 flex gap-1" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-8 w-8 ${
                    i < Math.round(score / 60)
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-6xl font-bold text-foreground">{score}</p>
            <p className="text-lg text-muted-foreground">points</p>

            <p className="mt-6 max-w-md text-xl italic text-foreground/80">
              “{quote}”
            </p>

            <section className="mt-10 w-full">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-foreground">
                <Heart className="h-6 w-6 fill-primary text-primary" />
                Add to favorites
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap a dish you loved today.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                {seen.map((id) => {
                  const dish = DISH_BY_ID[id];
                  const fav = favorites.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleFavorite(id)}
                      aria-pressed={fav}
                      aria-label={`Add ${dish.name} to favorites`}
                      className={`relative w-32 overflow-hidden rounded-3xl bg-card shadow-sm transition active:scale-95 ${
                        fav ? "ring-4 ring-primary" : "ring-1 ring-border"
                      }`}
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        width={768}
                        height={768}
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                      <p className="px-2 pb-2 pt-1 text-[0.6rem] text-muted-foreground">
                        {dish.name}
                      </p>
                      <Heart
                        className={`absolute right-2 top-2 h-6 w-6 ${
                          fav
                            ? "fill-primary text-primary"
                            : "text-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              onClick={start}
              className="mt-10 flex items-center gap-3 rounded-full bg-primary px-12 py-5 text-xl font-semibold text-primary-foreground shadow-md transition hover:brightness-105 active:scale-95"
            >
              <RotateCcw className="h-6 w-6" />
              Play again
            </button>
          </>
        )}
      </div>
    </main>
  );
}
