import { createFileRoute, Link } from "@tanstack/react-router";
import heroAsset from "@/assets/momo-hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Market Place — A Northeast Indian Food Memory Game" },
      {
        name: "description",
        content:
          "Play Market Place: spot and remember Northeast Indian dishes across five gentle rounds with Little Momo.",
      },
      { property: "og:title", content: "Market Place — Northeast Food Memory Game" },
      {
        property: "og:description",
        content: "Five slow rounds of remembering Northeast Indian dishes. Take it easy and play.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <img
        src={heroAsset}
        alt="Little Momo the red panda holding a board with a basket of fruits"
        width={1024}
        height={1024}
        className="w-full max-w-md drop-shadow-xl"
      />
      <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
        Market Place
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Take it slow. Little Momo is holding the basket for you.
      </p>
      <Link
        to="/play"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      >
        Start playing
      </Link>
    </main>
  );
}
