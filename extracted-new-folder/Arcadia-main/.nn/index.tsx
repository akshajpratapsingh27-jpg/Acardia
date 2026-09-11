import { createFileRoute } from "@tanstack/react-router";
import { LetsExploreGame } from "@/components/game/LetsExploreGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Let's Explore – Find the Hidden Pen" },
      {
        name: "description",
        content:
          "Take it slow. Little Momo hides a pen in five cozy rooms — remember where it was and find it again.",
      },
      { property: "og:title", content: "Let's Explore – Find the Hidden Pen" },
      {
        property: "og:description",
        content: "A calm five-round memory game with Little Momo the red panda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <LetsExploreGame />;
}
