import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import momo from "@/assets/momo.png";
import pen from "@/assets/pen.png";
import { LEVELS, PREVIEW_SECONDS, QUOTES, ROOMS, TOTAL_ROUNDS, shuffle, type Room } from "./rooms";

type Phase = "start" | "intro" | "preview" | "hunt" | "found" | "missed" | "end";
type Miss = { id: number; x: number; y: number };

const FAV_KEY = "lets-explore:favorite";

function randomPenSpot() {
  return {
    x: 8 + Math.random() * 84,
    y: 12 + Math.random() * 78,
    angle: Math.random() * 360,
  };
}

export function LetsExploreGame() {
  const [phase, setPhase] = useState<Phase>("start");
  const [order, setOrder] = useState<Room[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundGain, setRoundGain] = useState(0);
  const [pos, setPos] = useState(randomPenSpot);
  const [countdown, setCountdown] = useState(PREVIEW_SECONDS);
  const [timeLeft, setTimeLeft] = useState(0);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [shake, setShake] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);
  const roomRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[Math.min(round, LEVELS.length - 1)] ?? LEVELS[0];
  const room = order[round];

  useEffect(() => {
    setFavorite(localStorage.getItem(FAV_KEY) === "1");
  }, []);

  // Preload room art so rounds switch instantly.
  useEffect(() => {
    ROOMS.forEach((r) => {
      const img = new Image();
      img.src = r.src;
    });
  }, []);

  const startRound = useCallback((index: number) => {
    setRound(index);
    setPos(randomPenSpot());
    setMisses([]);
    setWrongClicks(0);
    setCountdown(PREVIEW_SECONDS);
    setPhase("intro");
  }, []);

  const startGame = () => {
    setOrder(shuffle(ROOMS));
    setScore(0);
    startRound(0);
  };

  // Wait for the new room art to be fully loaded before the peek countdown.
  useEffect(() => {
    if (phase !== "intro") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const begin = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        setCountdown(PREVIEW_SECONDS);
        setPhase("preview");
      }, 700);
    };
    const src = order[round]?.src;
    if (!src) {
      begin();
    } else {
      const img = new Image();
      img.onload = begin;
      img.onerror = begin;
      img.src = src;
      if (img.complete) begin();
    }
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, round, order]);

  // Preview countdown → hunt
  useEffect(() => {
    if (phase !== "preview") return;
    if (countdown <= 0) {
      setTimeLeft(level.time);
      setPhase("hunt");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, level.time]);


  // Hunt timer
  useEffect(() => {
    if (phase !== "hunt") return;
    if (timeLeft <= 0) {
      setRoundGain(0);
      setPhase("missed");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const handleRoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "hunt" || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    const penPx = (level.size / 100) * rect.width;
    const dx = ((cx - pos.x) / 100) * rect.width;
    const dy = ((cy - pos.y) / 100) * rect.height;
    const dist = Math.hypot(dx, dy);

    if (dist <= penPx * 0.6 + 8) {
      const gain = Math.max(10, 100 + timeLeft * 4 - wrongClicks * 8);
      setRoundGain(gain);
      setScore((s) => s + gain);
      setPhase("found");
    } else {
      setWrongClicks((w) => w + 1);
      setMisses((m) => [...m, { id: Date.now(), x: cx, y: cy }]);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const next = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? QUOTES[0]);
      setPhase("end");
    } else {
      startRound(round + 1);
    }
  };

  const toggleFavorite = () => {
    const nv = !favorite;
    setFavorite(nv);
    localStorage.setItem(FAV_KEY, nv ? "1" : "0");
  };

  const maxScore = useMemo(
    () => LEVELS.slice(0, TOTAL_ROUNDS).reduce((a, l) => a + 100 + l.time * 4, 0),
    [],
  );
  const stars = Math.min(5, Math.max(1, Math.round((score / maxScore) * 5)));

  if (phase === "start") {
    return (
      <main className="bg-warm flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <img
          src={momo}
          alt="Little Momo the red panda holding a card with a pen"
          width={1024}
          height={1024}
          className="animate-float w-[min(72vw,380px)] drop-shadow-xl"
        />
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Let&apos;s Explore
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Take it slow. Little Momo is holding the puzzle for you.
        </p>
        <button
          onClick={startGame}
          className="shadow-button mt-8 rounded-full bg-primary px-12 py-4 text-xl font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          Start playing
        </button>
      </main>
    );
  }

  if (phase === "end") {
    return (
      <main className="bg-warm flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <img
          src={momo}
          alt="Little Momo the red panda"
          width={1024}
          height={1024}
          className="animate-pop w-[min(56vw,260px)] drop-shadow-xl"
        />
        <p className="mt-4 text-sm font-bold tracking-widest text-muted-foreground uppercase">
          Adventure complete
        </p>
        <h1 className="mt-1 text-5xl font-extrabold text-foreground">{score} pts</h1>
        <div className="mt-2 text-2xl text-primary" aria-label={`${stars} of 5 stars`}>
          {"★".repeat(stars)}
          <span className="text-border">{"★".repeat(5 - stars)}</span>
        </div>
        <blockquote className="mt-6 max-w-md text-lg text-muted-foreground italic">
          “{quote}”
        </blockquote>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={startGame}
            className="shadow-button rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Play again
          </button>
          <button
            onClick={toggleFavorite}
            aria-pressed={favorite}
            className="rounded-full border-2 border-primary bg-card px-8 py-4 text-lg font-bold text-primary transition-transform hover:scale-105 active:scale-95"
          >
            {favorite ? "♥ Added to favorites" : "♡ Add to favorites"}
          </button>
        </div>
      </main>
    );
  }

  // Playing phases
  const showPen = phase === "preview" || phase === "found" || phase === "missed";
  const roundOver = phase === "found" || phase === "missed";

  return (
    <main className="bg-warm flex min-h-screen flex-col items-center px-4 py-6">
      <header className="mb-4 flex w-full max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={momo} alt="" width={1024} height={1024} className="h-12 w-12 object-contain" />
          <div className="text-left">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Round {round + 1} / {TOTAL_ROUNDS}
            </p>
            <p className="font-bold text-foreground">{room?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Score</p>
            <p className="text-xl font-extrabold text-foreground">{score}</p>
          </div>
          {phase === "hunt" && (
            <div
              className={`rounded-full px-4 py-2 text-lg font-extrabold tabular-nums ${
                timeLeft <= 5 ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
              }`}
            >
              {timeLeft}s
            </div>
          )}
        </div>
      </header>

      <div
        ref={roomRef}
        onClick={handleRoomClick}
        className={`shadow-soft relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-3xl border-4 border-card select-none ${
          phase === "hunt" ? "cursor-crosshair" : ""
        } ${shake ? "animate-shake" : ""}`}
      >
        {room && (
          <img
            src={room.src}
            alt={room.name}
            width={1280}
            height={960}
            draggable={false}
            className="h-full w-full object-cover"
          />
        )}

        {phase === "preview" && (
          <>
            <span
              className="animate-halo pointer-events-none absolute rounded-full border-4 border-primary bg-primary/15"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${Math.max(level.size, 10) * 2.2}%`,
                aspectRatio: "1 / 1",
              }}
            />
            <span
              className="pointer-events-none absolute rounded-full border-4 border-primary"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${Math.max(level.size, 10) * 1.5}%`,
                aspectRatio: "1 / 1",
                transform: "translate(-50%,-50%)",
                boxShadow: "0 0 0 9999px rgba(20,16,12,0.35)",
              }}
            />
          </>
        )}

        {showPen && (
          <img
            src={pen}
            alt="hidden pen"
            width={512}
            height={512}
            draggable={false}
            className={`pointer-events-none absolute ${roundOver ? "animate-pop" : ""}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${phase === "preview" ? Math.max(level.size, 10) : level.size}%`,
              opacity: phase === "preview" ? 1 : level.opacity,
              filter: phase === "preview" ? "drop-shadow(0 0 10px rgba(255,255,255,0.95))" : undefined,
              transform: `translate(-50%, -50%) rotate(${level.rotate ? pos.angle : 0}deg)`,
            }}
          />
        )}

        {roundOver && (
          <span
            className="pointer-events-none absolute h-16 w-16 rounded-full border-4 border-primary"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }}
          />
        )}

        {misses.map((m) => (
          <span
            key={m.id}
            className="animate-ping-once pointer-events-none absolute h-10 w-10 rounded-full border-4 border-destructive"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          />
        ))}

      </div>

      <div className="mt-4 w-full max-w-4xl">
        {phase === "intro" && (
          <div className="animate-pop rounded-3xl bg-card px-6 py-4 text-center shadow-soft">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Room {round + 1}
            </p>
            <p className="text-xl font-extrabold text-foreground">{room?.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Getting the room ready…</p>
          </div>
        )}

        {phase === "preview" && (
          <div className="animate-pop rounded-3xl bg-card px-6 py-4 text-center shadow-soft">
            <p className="text-lg font-bold text-foreground">
              Here's the pen — remember it! {countdown}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Look closely — the pen disappears in a moment.
            </p>
          </div>
        )}

        {phase === "hunt" && (
          <p className="text-center text-sm text-muted-foreground">Tap where the pen was hiding.</p>
        )}

        {roundOver && (
          <div className="animate-pop rounded-3xl bg-card px-6 py-4 text-center shadow-soft">
            <p className="text-2xl font-extrabold text-foreground">
              {phase === "found" ? "You found it!" : "Time's up!"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {phase === "found" ? `+${roundGain} points` : "The pen was hiding right there."}
            </p>
            <button
              onClick={next}
              className="shadow-button mt-4 rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              {round + 1 >= TOTAL_ROUNDS ? "See results" : "Next room"}
            </button>
            <p className="mt-2 text-sm text-muted-foreground">
              Level {round + 1} of {TOTAL_ROUNDS}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
