import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FESTIVALS } from "@/data/festivals";
import { getFestivalFavourites, toggleFestivalFavourite } from "@/lib/fav-festivals";

export const Route = createFileRoute("/festival-favourites")({
  head: () => ({
    meta: [
      { title: "My Favourite Festivals — Flip the Cards" },
      {
        name: "description",
        content:
          "The Northeast Indian festivals you saved while playing Flip the Cards, kept together in one warm, quiet place.",
      },
      { property: "og:title", content: "My Favourite Festivals — Flip the Cards" },
      {
        property: "og:description",
        content: "The Northeast Indian festivals you saved while playing Flip the Cards.",
      },
    ],
  }),
  component: FestivalFavourites,
});

function FestivalFavourites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getFestivalFavourites()), []);
  const list = FESTIVALS.filter((f) => ids.includes(f.id));

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8">
      <Link to="/" className="text-base font-semibold text-muted-foreground underline">
        Home
      </Link>
      <h1 className="mt-6 text-center text-4xl font-bold">My favourite festivals</h1>

      {list.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-muted-foreground">
            Nothing saved yet. Play a round and keep the festivals you love.
          </p>
          <Link
            to="/flip"
            className="mt-6 inline-block rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground"
          >
            Start playing
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {list.map((f) => (
            <div key={f.id} className="relative overflow-hidden rounded-3xl bg-card shadow-sm">
              <img
                src={f.image}
                alt={f.name}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full object-cover"
              />
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{f.name}</p>
              <button
                type="button"
                aria-label={`Remove ${f.name} from favourites`}
                onClick={() => setIds(toggleFestivalFavourite(f.id))}
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
