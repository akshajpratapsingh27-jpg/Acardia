import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/talk")({
  head: () => ({
    meta: [
      { title: "Talk to me — SmritiSetu" },
      { name: "description", content: "A calm place to chat whenever you feel like talking." },
      { property: "og:title", content: "Talk to me — SmritiSetu" },
      { property: "og:description", content: "A calm place to chat whenever you feel like talking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return <PlaceholderPage title="Talk to me" blurb="A calm place to chat whenever you feel like talking." />;
}
