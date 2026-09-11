import { createFileRoute, Link } from "@tanstack/react-router";
import panda from "@/assets/momo-panda.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flip the Cards — A Gentle Northeast Festival Memory Game" },
      {
        name: "description",
        content:
          "Flip the Cards is a calm matching game for dementia care. Match the festivals of Northeast India, one gentle pair at a time.",
      },
      { property: "og:title", content: "Flip the Cards — A Gentle Northeast Festival Memory Game" },
      {
        property: "og:description",
        content: "Match the festivals of Northeast India, one gentle pair at a time.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-14 text-center">
      <img
        src={panda}
        alt="A friendly red panda holding a board with playing cards"
        width={1024}
        height={1024}
        className="w-[19rem] max-w-full sm:w-[24rem]"
      />
      <h1 className="mt-2 font-bold tracking-tight text-foreground text-5xl sm:text-6xl">
        Flip the Cards
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Take it slow. Little Momo is holding the cards for you.
      </p>
      <Link
        to="/flip"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-12 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
      >
        Start playing
      </Link>
      <Link
        to="/marketplace"
        className="mt-5 text-base font-semibold text-muted-foreground underline"
      >
        Visit the Marketplace game
      </Link>
      <Link
        to="/festival-favourites"
        className="mt-3 text-base font-semibold text-muted-foreground underline"
      >
        My favourite festivals
      </Link>
    </main>
  );
}
