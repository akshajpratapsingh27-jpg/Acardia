import { createFileRoute } from "@tanstack/react-router";
import { useLocation, Link } from "wouter";
import { Gamepad2, ArrowLeft, ArrowRight } from "lucide-react";

const GAME_OPTIONS = [
  { title: "Flip The Cards", blurb: "Match pairs of traditional cultural dances", route: "/play3" },
  { title: "Tune With Me", blurb: "Explore nature sounds", route: "/play2" },
  { title: "Connect The Dots", blurb: "Make shapes by completing the dots!", route: "/play4" },
  { title: "MarketPlace", blurb: "Remember it!", route: "/play5" },
  { title: "Let's Explore!", blurb: "Remember the hiding spot!", route: "/play6" },
];

export default function GamesMenuPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 self-start text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Home
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Games Collection</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Choose a game from the options below.
        </p>
      </header>

      <div className="grid gap-4">
        {GAME_OPTIONS.map((game, index) => (
          <button
            key={game.title}
            type="button"
            onClick={() => {
              if (game.route) {
                window.location.href = game.route;
              } else {
                alert(`Opening ${game.title}...`);
              }
            }}
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky/20 text-sky-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
              <Gamepad2 className="size-7" strokeWidth={1.8} />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{index + 1}</span>
                <span className="text-xl font-bold tracking-tight">{game.title}</span>
              </span>
              <span className="block text-sm text-muted-foreground mt-1">{game.blurb}</span>
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-5" />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLocation("/activities")}
        className="mt-8 flex items-center gap-2 self-start text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Activities
      </button>
    </main>
  );
}

export const Route = createFileRoute("/play")({
  component: GamesMenuPage,
});