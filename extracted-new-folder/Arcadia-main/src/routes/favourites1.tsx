import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DISHES } from "@/data/dishes";
import { DishCard } from "@/components/DishCard";
import { getFavourites, toggleFavourite } from "@/lib/favourites";

export const Route = createFileRoute("/favourites1")({
  head: () => ({
    meta: [
      { title: "My Favourite Dishes — Marketplace" },
      {
        name: "description",
        content:
          "The Northeast Indian dishes you saved while playing Marketplace, kept together in one warm, quiet place.",
      },
      { property: "og:title", content: "My Favourite Dishes — Marketplace" },
      {
        property: "og:description",
        content: "The Northeast Indian dishes you saved while playing Marketplace.",
      },
    ],
  }),
  component: Favourites,
});

function Favourites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getFavourites()), []);
  const dishes = DISHES.filter((d) => ids.includes(d.id));

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <Link to="/" className="text-base font-semibold text-muted-foreground underline">
        Home
      </Link>
      <h1 className="mt-6 text-center text-4xl font-bold">My favourite dishes</h1>

      {dishes.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-muted-foreground">
            Nothing saved yet. Play a round and keep the dishes you love.
          </p>
          <Link
            to="/play"
            className="mt-6 inline-block rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground"
          >
            Start playing
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {dishes.map((d) => (
            <div key={d.id} className="relative">
              <DishCard dish={d} />
              <button
                type="button"
                aria-label={`Remove ${d.name} from favourites`}
                onClick={() => setIds(toggleFavourite(d.id))}
                className="absolute right-2 top-2 rounded-full bg-card/90 px-3 py-1.5 text-lg leading-none shadow"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
