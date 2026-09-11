import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FESTIVALS,
  FESTIVAL_QUOTES,
  GAME_SECONDS,
  shuffle,
  type Festival,
} from "@/data/festivals";
import { addFestivalFavourites, getFestivalFavourites, toggleFestivalFavourite } from "@/lib/fav-festivals";

export const Route = createFileRoute("/flip")({
  head: () => ({
    meta: [
      { title: "Play Flip the Cards — Northeast Festivals" },
      {
        name: "description",
        content:
          "Turn over two cards at a time and match every Northeast Indian festival before the five minutes run out.",
      },
      { property: "og:title", content: "Play Flip the Cards — Northeast Festivals" },
      {
        property: "og:description",
        content: "A gentle one-minute memory match with the festivals of Northeast India.",
      },
    ],
  }),
  component: FlipGame,
});

type Card = { key: string; festival: Festival };

// 3 rounds: 2 pairs (4 cards), 4 pairs (8 cards), 6 pairs (12 cards)
const ROUND_PAIRS = [2, 4, 6];

function buildDeck(pairs: number): Card[] {
  return shuffle(
    FESTIVALS.slice(0, pairs).flatMap((f) => [
      { key: `${f.id}-a`, festival: f },
      { key: `${f.id}-b`, festival: f },
    ]),
  );
}

function FlipGame() {
  const [round, setRound] = useState(0);
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(ROUND_PAIRS[0]!));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(GAME_SECONDS);
  const [roundDone, setRoundDone] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pairs = ROUND_PAIRS[round]!;
  const roundComplete = matched.length === pairs;
  const isLastRound = round === ROUND_PAIRS.length - 1;
  const won = roundComplete && isLastRound;
  const lost = seconds === 0 && !won;
  const over = won || lost;

  useEffect(() => setFavs(getFestivalFavourites()), []);

  useEffect(() => {
    if (over || roundDone) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [over, roundDone]);

  useEffect(() => {
    if (roundComplete && !isLastRound) setRoundDone(true);
  }, [roundComplete, isLastRound]);

  const quote = useMemo(
    () => FESTIVAL_QUOTES[Math.floor(Math.random() * FESTIVAL_QUOTES.length)],
    [over],
  );

  const restart = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setRound(0);
    setDeck(buildDeck(ROUND_PAIRS[0]!));
    setFlipped([]);
    setMatched([]);
    setSeconds(GAME_SECONDS);
    setRoundDone(false);
  }, []);

  const nextRound = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    const next = round + 1;
    setRound(next);
    setDeck(buildDeck(ROUND_PAIRS[next]!));
    setFlipped([]);
    setMatched([]);
    setRoundDone(false);
  }, [round]);

  function onFlip(card: Card) {
    if (over || roundDone || flipped.length === 2) return;
    if (flipped.includes(card.key) || matched.includes(card.festival.id)) return;

    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    const picked = next.map((k) => deck.find((c) => c.key === k)!);
    const a = picked[0]!;
    const b = picked[1]!;
    if (a.festival.id === b.festival.id) {
      timeout.current = setTimeout(() => {
        setMatched((m) => [...m, a.festival.id]);
        setFlipped([]);
      }, 550);
    } else {
      timeout.current = setTimeout(() => setFlipped([]), 1100);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-base font-semibold text-muted-foreground underline">
          Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {ROUND_PAIRS.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-8 rounded-full ${i <= round ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          <p className="rounded-full bg-card px-5 py-2 text-lg font-bold shadow-sm">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </p>
        </div>
      </div>

      {!over && (
        <p className="mt-4 text-center text-lg text-muted-foreground">
          Round {round + 1} of {ROUND_PAIRS.length} — turn over two cards and find the {pairs} pairs.
          Take your time.
        </p>
      )}

      {over ? (
        <section className="mt-8 text-center">
          <h1 className="text-4xl font-bold">
            {won ? "You matched them all!" : "Time gently ran out"}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">{quote}</p>

          <h2 className="mt-10 text-2xl font-bold">Keep a festival you loved</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FESTIVALS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFavs(toggleFestivalFavourite(f.id))}
                className={`overflow-hidden rounded-3xl bg-card text-left shadow-sm transition-transform hover:scale-[1.03] ${
                  favs.includes(f.id) ? "ring-4 ring-primary" : ""
                }`}
              >
                <img
                  src={f.image}
                  alt={f.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="aspect-square w-full object-cover"
                />
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {favs.includes(f.id) ? "♥ " : ""}
                  {f.name}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setFavs(addFestivalFavourites(FESTIVALS.map((f) => f.id)))}
              className="rounded-full bg-secondary px-10 py-3 text-lg font-bold text-secondary-foreground"
            >
              Add all to favourites
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-full bg-primary px-12 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              Play again
            </button>
            <Link
              to="/festival-favourites"
              className="text-base font-semibold text-muted-foreground underline"
            >
              My favourite festivals
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div
            className={`mx-auto mt-6 grid gap-3 ${
              deck.length <= 4
                ? "max-w-md grid-cols-2"
                : deck.length <= 8
                  ? "max-w-xl grid-cols-3 sm:grid-cols-4"
                  : "grid-cols-3 sm:grid-cols-4"
            }`}
          >
            {deck.map((card) => {
            const isMatched = matched.includes(card.festival.id);
            const isOpen = isMatched || flipped.includes(card.key);
            return (
              <button
                key={card.key}
                type="button"
                aria-label={isOpen ? card.festival.name : "Hidden card"}
                onClick={() => onFlip(card)}
                className={`aspect-square overflow-hidden rounded-3xl shadow-sm transition-all duration-300 ${
                  isOpen ? "bg-card" : "bg-secondary hover:scale-[1.03]"
                } ${isMatched ? "ring-4 ring-primary" : ""}`}
              >
                {isOpen ? (
                  <span className="flex h-full w-full flex-col">
                    <img
                      src={card.festival.image}
                      alt={card.festival.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="w-full flex-1 object-cover"
                    />
                    <span className="px-1 py-1 text-[0.6rem] font-semibold text-muted-foreground">
                      {card.festival.name}
                    </span>
                  </span>
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl">
                    ✿
                  </span>
                )}
              </button>
            );
            })}
          </div>

          {roundDone && (
            <div className="mx-auto mt-8 max-w-md rounded-3xl card-soft p-6 text-center animate-gentle-pop">
              <p className="text-2xl font-bold">Round {round + 1} complete!</p>
              <p className="mt-1 text-muted-foreground">
                Lovely matching. Next round has {ROUND_PAIRS[round + 1]! * 2} cards.
              </p>
              <button
                type="button"
                onClick={nextRound}
                className="mt-5 rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground"
              >
                Next round
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
