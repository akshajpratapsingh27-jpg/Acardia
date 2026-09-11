import { createFileRoute } from "@tanstack/react-router";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Play, RotateCcw, Star, Volume2 } from "lucide-react";
import momo from "@/assets/momo.png";
import {
  buildRounds,
  QUOTES,
  TOTAL_ROUNDS,
  TUNE_BY_ID,
  type Round,
} from "@/lib/tunes";
import {
  playChime,
  playTune,
  primeAudio,
  stopTune,
  type TuneId,
} from "@/lib/natureSounds";

export const Route = createFileRoute("/play2")({
  head: () => ({
    meta: [
      { title: "Tune With Me - A Gentle Nature Sound Game" },
      {
        name: "description",
        content:
          "Tune With Me is a calm, picture-based listening game. Hear rain, waterfalls, leaves and more, then tap the picture that matches the sound.",
      },
      { property: "og:title", content: "Tune With Me - A Gentle Nature Sound Game" },
      {
        property: "og:description",
        content:
          "A soothing five-round nature listening game designed for calm, joyful play.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen = "intro" | "play" | "done";
type Phase = "listen" | "choose" | "feedback";

const FAV_KEY = "tune-with-me-favorites";

export default function Index() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("listen");
  const [picked, setPicked] = useState<TuneId | null>(null);
  const [score, setScore] = useState(0);
  const [favorites, setFavorites] = useState<TuneId[]>([]);
  const [quote, setQuote] = useState(QUOTES[0]!);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw) as TuneId[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      stopTune(0.2);
    },
    [],
  );

  const round = rounds[index];

  const start = () => {
    primeAudio();
    setRounds(buildRounds());
    setIndex(0);
    setScore(0);
    setPicked(null);
    setPhase("listen");
    setScreen("play");
  };

  const listen = () => {
    if (!round) return;
    primeAudio();
    playTune(round.answer.id);
    setPhase("listen");
    const t = window.setTimeout(() => {
      stopTune(1.2);
      setPhase("choose");
    }, 7000);
    timers.current.push(t);
  };

  const choose = (id: TuneId) => {
    if (!round || phase === "feedback") return;
    stopTune(0.3);
    setPicked(id);
    setPhase("feedback");
    const correct = id === round.answer.id;
    if (correct) setScore((s) => s + 20);
    playChime(correct);
    const t = window.setTimeout(() => {
      if (index + 1 >= TOTAL_ROUNDS) {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]!);
        setScreen("done");
      } else {
        setIndex((i) => i + 1);
        setPicked(null);
        setPhase("listen");
      }
    }, 2200);
    timers.current.push(t);
  };

  const toggleFavorite = (id: TuneId) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        {screen === "intro" && <Intro onStart={start} />}

        {screen === "play" && round && (
          <section className="flex flex-col items-center gap-8">
            <Progress index={index} />

            <img
              src={momo}
              alt="Momo the red panda"
              width={1024}
              height={1024}
              className="h-40 w-40 object-contain drop-shadow-sm sm:h-48 sm:w-48"
            />

            {phase === "listen" ? (
              <button
                type="button"
                onClick={listen}
                aria-label="Play the sound"
                className="flex h-40 w-40 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95"
              >
                <Volume2 className="h-20 w-20" strokeWidth={1.75} />
              </button>
            ) : (
              <SoundWave />
            )}

            <div
              className={`grid w-full gap-5 ${
                round.options.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {round.options.map((option) => {
                const isAnswer = option.id === round.answer.id;
                const isPicked = option.id === picked;
                const reveal = phase === "feedback";
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    disabled={phase === "listen"}
                    aria-label={option.name}
                    className={`overflow-hidden rounded-3xl border-4 bg-card shadow-md transition-all disabled:opacity-45 ${
                      reveal && isAnswer
                        ? "border-success scale-105"
                        : reveal && isPicked
                          ? "border-destructive opacity-70"
                          : "border-border hover:-translate-y-1 hover:border-primary"
                    }`}
                  >
                    <img
                      src={option.image}
                      alt={option.name}
                      width={768}
                      height={768}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {screen === "done" && (
          <Results
            score={score}
            quote={quote}
            rounds={rounds}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onPlayAgain={start}
          />
        )}
      </div>
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <img
        src={momo}
        alt="Momo the red panda holding a card of music notes"
        width={1024}
        height={1024}
        className="h-64 w-64 object-contain drop-shadow-sm sm:h-80 sm:w-80"
      />
      <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
        Tune With Me
      </h1>
      <p className="max-w-md text-xl text-muted-foreground">
        Take it slow. Little Momo will play a sound from nature just for you.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-2xl font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95"
      >
        <Play className="h-7 w-7" fill="currentColor" />
        Start playing
      </button>
    </section>
  );
}

function Progress({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Round ${index + 1} of ${TOTAL_ROUNDS}`}>
      {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
        <span
          key={i}
          className={`h-5 w-5 rounded-full transition-colors ${
            i < index
              ? "bg-success"
              : i === index
                ? "bg-primary scale-125"
                : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function SoundWave() {
  return (
    <div className="flex h-40 items-end gap-2" aria-hidden="true">
      {[0.5, 0.8, 1, 0.7, 0.9, 0.6, 0.85].map((h, i) => (
        <span
          key={i}
          className="w-4 rounded-full bg-primary/50"
          style={{
            height: `${h * 90}px`,
            animation: `tune-wave 1.6s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Results({
  score,
  quote,
  rounds,
  favorites,
  onToggleFavorite,
  onPlayAgain,
}: {
  score: number;
  quote: string;
  rounds: Round[];
  favorites: TuneId[];
  onToggleFavorite: (id: TuneId) => void;
  onPlayAgain: () => void;
}) {
  const stars = Math.max(1, Math.round(score / 40));
  const heard = Array.from(new Set(rounds.map((r) => r.answer.id)));

  return (
    <section className="flex flex-col items-center gap-7 text-center">
      <img
        src={momo}
        alt="Momo the red panda cheering"
        width={1024}
        height={1024}
        className="h-56 w-56 object-contain drop-shadow-sm"
      />

      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-10 w-10 ${
              i < stars ? "text-primary" : "text-border"
            }`}
            fill="currentColor"
          />
        ))}
      </div>

      <p className="text-6xl font-bold text-primary">{score}</p>

      <p className="max-w-md text-2xl leading-relaxed text-foreground">
        {quote}
      </p>

      <div className="w-full rounded-3xl bg-card p-5 shadow-md">
        <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-semibold text-foreground">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          Add to favorites
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {heard.map((id) => {
            const tune = TUNE_BY_ID[id];
            const fav = favorites.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onToggleFavorite(id);
                  playTune(id);
                  window.setTimeout(() => stopTune(1), 6000);
                }}
                aria-label={`Add ${tune.name} to favorites`}
                className="relative overflow-hidden rounded-2xl border-4 border-border transition-transform hover:scale-105"
              >
                <img
                  src={tune.image}
                  alt={tune.name}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                />
                <span className="absolute right-1 top-1 rounded-full bg-card/90 p-1.5">
                  <Heart
                    className={`h-5 w-5 ${fav ? "text-primary" : "text-muted-foreground"}`}
                    fill={fav ? "currentColor" : "none"}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-2xl font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <RotateCcw className="h-7 w-7" />
        Play again
      </button>
    </section>
  );
}
