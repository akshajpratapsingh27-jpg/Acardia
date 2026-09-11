import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import "../styles.css";
import {
  Users,
  MessageCircle,
  Sun,
  Music4,
  ArrowRight,
  Settings,
  Home,
  Sparkles,
  Heart,
  Bot,
  Calendar,
  FileText,
} from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/role";
import logo from "@/assets/ssetu.png";
import { useCareData } from "@/state/care-context";

type Dest =
  | "/family"
  | "/talk"
  | "/my-day"
  | "/play"
  | "/activities"
  | "/memory"
  | "/chatbot"
  | "/sos"
  | "/settings";

const PATIENT_TILES: { title: string; blurb: string; icon: typeof Users; tone: string; to: Dest }[] = [
  {
    title: "Family",
    blurb: "See your loved ones",
    icon: Users,
    tone: "bg-sun/75 text-sun-foreground",
    to: "/family",
  },
  {
    title: "Talk to me",
    blurb: "Let's have a conversation",
    icon: MessageCircle,
    tone: "bg-sage/80 text-sage-foreground",
    to: "/chatbot",
  },
  {
    title: "My Day",
    blurb: "See what is happening today",
    icon: Sun,
    tone: "bg-peach/85 text-peach-foreground",
    to: "/my-day",
  },
  {
    title: "Let's Play",
    blurb: "Fun games for your mind",
    icon: Music4,
    tone: "bg-sky/85 text-sky-foreground",
    to: "/play",
  },
];

const CAREGIVER_TILES: { title: string; blurb: string; icon: typeof Users; tone: string; to: Dest }[] = [
  {
    title: "Loved One's Schedule",
    blurb: "View and manage daily tasks",
    icon: Calendar,
    tone: "bg-sage/75 text-sage-foreground",
    to: "/my-day",
  },
  {
    title: "Memory & Photos",
    blurb: "Add special moments and milestones",
    icon: Heart,
    tone: "bg-sun/75 text-sun-foreground",
    to: "/memory",
  },
  {
    title: "Family Network",
    blurb: "Connect with other family members",
    icon: Users,
    tone: "bg-peach/85 text-peach-foreground",
    to: "/family",
  },
  {
    title: "Activity Logs",
    blurb: "Check engagement and well-being",
    icon: FileText,
    tone: "bg-sky/85 text-sky-foreground",
    to: "/activities",
  },
];

const NAV: { label: string; icon: typeof Home; to: Dest | "/" }[] = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Activities", icon: Sparkles, to: "/activities" },
  { label: "Memory", icon: Heart, to: "/memory" },
  { label: "Chatbot", icon: Bot, to: "/chatbot" },
];

const SPLASH = [
  "hsl(20 88% 60% / 0.9)",
  "hsl(45 92% 62% / 0.85)",
  "hsl(150 34% 58% / 0.8)",
  "hsl(200 62% 62% / 0.75)",
];

type Reach = {
  to: Dest;
  origin: { x: number; y: number };
  target: { x: number; y: number };
  angle: number;
  length: number;
  lean: number;
  cover: number;
  phase: "start" | "reach" | "tap" | "splash";
};

export function HomeScreen({ name, role }: { name: string; role: UserRole; onReset?: () => void }) {
  const [, setLocation] = useLocation();
  const { triggerSOS } = useCareData();
  const mascotRef = useRef<HTMLDivElement>(null);
  const [reach, setReach] = useState<Reach | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (reach?.phase !== "start") return;
    const id = window.requestAnimationFrame(() =>
      setReach((f) => (f && f.phase === "start" ? { ...f, phase: "reach" } : f)),
    );
    return () => window.cancelAnimationFrame(id);
  }, [reach?.phase]);

  const go = useCallback(
    (event: React.MouseEvent<HTMLElement>, to: Dest) => {
      if (reach) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const box = mascotRef.current?.getBoundingClientRect();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!box || reduced) {
        setLocation(to);
        return;
      }

      const target = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const origin = { x: box.left + box.width * 0.3, y: box.top + box.height * 0.34 };
      const dx = target.x - origin.x;
      const dy = target.y - origin.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const length = Math.max(60, Math.hypot(dx, dy) - 10);
      const cover = Math.hypot(window.innerWidth, window.innerHeight) * 2.4;

      setReach({
        to,
        origin,
        target,
        angle,
        length,
        lean: Math.max(-8, Math.min(8, dx / 60)),
        cover,
        phase: "start",
      });

      timers.current.push(
        window.setTimeout(() => setReach((f) => (f ? { ...f, phase: "tap" } : f)), 20),
        window.setTimeout(() => setReach((f) => (f ? { ...f, phase: "splash" } : f)), 220),
        window.setTimeout(() => setLocation(to), 1000),
      );
    },
    [reach, setLocation],
  );

  const flight = reach;
  const isCaregiver = String(role) === "caregiver";
  const tilesToDisplay = isCaregiver ? CAREGIVER_TILES : PATIENT_TILES;

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="SmritiSetu"
              width={48}
              height={48}
              className="size-12 rounded-full ring-1 ring-border/70"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight tracking-tight">SmritiSetu</p>
              <p className="text-xs text-muted-foreground">
                {isCaregiver ? "Caregiver Portal" : "Bridging memories"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                triggerSOS();
                go(e, "/sos");
              }}
              className="flex items-center gap-2 rounded-full bg-foreground py-2 pl-2 pr-4 text-sm font-semibold text-background shadow-lift transition-transform hover:scale-[1.02]"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-sos text-[11px] font-bold text-sos-foreground">
                SOS
              </span>
              I need help
            </button>
            <button
              type="button"
              onClick={(e) => go(e, "/settings")}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5">
        <section className="flex flex-col-reverse items-center gap-4 pt-8 text-center sm:flex-row sm:gap-6 sm:text-left">
          <div className="flex-1">
            <p
              className="animate-rise text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
              style={{ animationDelay: "60ms" }}
            >
              Good to see you
            </p>
            <h1
              className="animate-rise mt-2 text-4xl font-light tracking-tight sm:text-5xl"
              style={{ animationDelay: "100ms" }}
            >
              Hello, <span className="font-bold">{name}</span>
            </h1>
            <p
              className="animate-rise mt-2 text-base text-muted-foreground"
              style={{ animationDelay: "140ms" }}
            >
              {isCaregiver
                ? "Here is an overview of your loved one's schedule and daily updates."
                : "What would you like to do today?"}
            </p>
          </div>
          <div ref={mascotRef} className="animate-rise shrink-0">
            <div
              className={cn(reach && "animate-panda-lean")}
              style={{ ["--lean" as string]: `${reach?.lean ?? 0}deg` }}
            >
              <Mascot size={160} />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {tilesToDisplay.map((tile, index) => {
            const Icon = tile.icon;
            const picked = flight?.to === tile.to;
            return (
              <button
                key={tile.title}
                type="button"
                onClick={(e) => go(e, tile.to)}
                className={cn(
                  "group animate-rise relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                  tile.tone,
                  picked && "scale-[0.97] shadow-lift ring-4 ring-foreground/15",
                )}
                style={{ animationDelay: `${180 + index * 60}ms` }}
              >
                <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-card/40 transition-transform duration-500 group-hover:scale-125" />
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card/85 shadow-soft transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-6" strokeWidth={1.8} />
                </span>
                <span className="relative flex-1">
                  <span className="block text-lg font-bold tracking-tight">{tile.title}</span>
                  <span className="block text-sm opacity-75">{tile.blurb}</span>
                </span>
                <span className="relative flex size-9 items-center justify-center rounded-full bg-card/70 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="size-4" />
                </span>
              </button>
            );
          })}
        </section>

        <section
          className="animate-rise mt-5 flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-soft"
          style={{ animationDelay: "440ms" }}
        >
          <span className="flex size-11 shrink-0 animate-bob items-center justify-center rounded-full bg-sun/80 text-sun-foreground">
            <Sun className="size-5" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Today's little reminder
            </p>
            <p className="mt-1 text-base">Take your time. There is no hurry.</p>
          </div>
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-5 z-20 px-5">
        <div className="mx-auto flex w-full max-w-md items-center gap-1 rounded-full bg-foreground/95 p-2 shadow-lift backdrop-blur">
          {NAV.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;
            const picked = flight?.to === item.to;
            return (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  if (item.to === "/") return;
                  go(e, item.to);
                }}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-all",
                  active
                    ? "bg-sun text-sun-foreground"
                    : "text-background/70 hover:text-background",
                  picked && "scale-95 bg-background/20 text-background",
                )}
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {reach?.phase === "splash" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-40"
          style={{ transform: `translate3d(${reach.target.x}px, ${reach.target.y}px, 0)` }}
        >
          {SPLASH.map((color, i) => (
            <span
              key={color}
              className="absolute rounded-full"
              style={{
                left: -(130 + i * 65),
                top: -(130 + i * 65),
                width: 260 + i * 130,
                height: 260 + i * 130,
                background: color,
                filter: "blur(1px)",
                transform: "scale(0)",
                animation: `splash-pop ${1100 + i * 180}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms both`,
              }}
            />
          ))}
          <span
            className="absolute rounded-full bg-background"
            style={{
              left: -reach.cover / 2,
              top: -reach.cover / 2,
              width: reach.cover,
              height: reach.cover,
              transform: "scale(0)",
              animation: "splash-cover 1100ms cubic-bezier(0.5, 0, 0.3, 1) 220ms both",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}