import { createFileRoute, Link } from "@tanstack/react-router";
import pandaHug from "@/assets/panda-hug.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connect the Dots — Cuddly Red Panda Puzzle Game" },
      {
        name: "description",
        content:
          "A gentle connect-the-dots puzzle game guided by a sleepy red panda who hugs the puzzle with all four paws.",
      },
      { property: "og:title", content: "Connect the Dots — Cuddly Red Panda Puzzle Game" },
      {
        property: "og:description",
        content:
          "A gentle connect-the-dots puzzle game guided by a sleepy red panda who hugs the puzzle with all four paws.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-warm)]" aria-hidden />

      <section className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div
            className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-full bg-accent/50 blur-3xl animate-breathe"
            aria-hidden
          />
          <div className="animate-float-cuddle">
            <img
              src={pandaHug}
              alt="Cute red panda lying down and hugging a connect-the-dots puzzle tile with its paws and back legs"
              width={1024}
              height={1024}
              className="w-[clamp(16rem,52vw,26rem)] rotate-[-6deg] drop-shadow-[var(--shadow-soft)] animate-snuggle"
            />
          </div>
        </div>

        <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Connect the Dots
        </h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">
          Take it slow. Little Momo is holding the puzzle for you.
        </p>

        <Link
          to="/play"
          className="mt-8 rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Start playing
        </Link>
      </section>
    </main>
  );
}
