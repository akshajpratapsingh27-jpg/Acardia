import { createFileRoute } from "@tanstack/react-router";
import { useLocation } from "wouter";
import { Gamepad2, Users, Dumbbell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_SECTIONS = [
  {
    id: "games",
    title: "Games",
    blurb: "Fun brain teasers and memory puzzles",
    icon: Gamepad2,
    tone: "bg-sky/85 text-sky-foreground",
    to: "/play",
  },
  {
    id: "friends",
    title: "Play with Friends",
    blurb: "Connect and share activities together",
    icon: Users,
    tone: "bg-sun/85 text-sun-foreground",
    to: "/family",
  },
  {
    id: "exercise",
    title: "Exercise",
    blurb: "Gentle physical movements and stretches",
    icon: Dumbbell,
    tone: "bg-sage/85 text-sage-foreground",
    to: "/exercise",
  },
];

export default function ActivitiesPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-12">
      <button
        type="button"
        onClick={() => setLocation("/")}
        className="mb-8 flex items-center gap-2 self-start text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to Home
      </button>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Engagement & Wellness
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Activities
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Choose what you would like to explore right now.
        </p>
      </header>

      <div className="grid gap-4">
        {ACTIVITY_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                if (section.id === "exercise") {
                  window.location.href = "/exercise/index.html";
                } else {
                  setLocation(section.to);
                }
              }}
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-3xl p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                section.tone,
              )}
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card/85 shadow-soft transition-transform duration-300 group-hover:scale-105">
                <Icon className="size-7" strokeWidth={1.8} />
              </span>
              <span className="flex-1">
                <span className="block text-xl font-bold tracking-tight">{section.title}</span>
                <span className="block text-sm opacity-80">{section.blurb}</span>
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-card/70 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="size-5" />
              </span>
            </button>
          );
        })}
      </div>

    </main>
  );
}

export const Route = createFileRoute("/activities")({
  component: ActivitiesPage,
});
