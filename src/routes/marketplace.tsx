import { createFileRoute, Link } from "@tanstack/react-router";
import panda from "@/assets/momo-basket.png";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — A Gentle Northeast Food Memory Game" },
      {
        name: "description",
        content:
          "Marketplace is a calm, unhurried memory game for dementia care. Look at dishes from Northeast India, then find them again in the market.",
      },
      { property: "og:title", content: "Marketplace — A Gentle Northeast Food Memory Game" },
      {
        property: "og:description",
        content: "Remember the dishes of Northeast India, one gentle round at a time.",
      },
    ],
  }),
  component: MarketplaceHome,
});

function MarketplaceHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-14 text-center">
      <img
        src={panda}
        alt="A friendly red panda holding a board with a market basket"
        width={1024}
        height={1024}
        className="w-[19rem] max-w-full sm:w-[24rem]"
      />
      <h1 className="mt-2 font-bold tracking-tight text-foreground text-5xl sm:text-6xl">
        Marketplace
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Take it slow. Little Momo is holding the market basket for you.
      </p>
      <Link
        to="/play"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-12 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-105"
      >
        Start playing
      </Link>
      <Link
        to="/favourites"
        className="mt-5 text-base font-semibold text-muted-foreground underline"
      >
        My favourite dishes
      </Link>
    </main>
  );
}
