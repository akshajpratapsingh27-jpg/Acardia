import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const Route = createFileRoute("/my-day")({
  head: () => ({
    meta: [
      { title: "My Day — SmritiSetu" },
      { name: "description", content: "Your day's plan, reminders and gentle nudges will appear here." },
      { property: "og:title", content: "My Day — SmritiSetu" },
      { property: "og:description", content: "Your day's plan, reminders and gentle nudges will appear here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return <PlaceholderPage title="My Day" blurb="Your day's plan, reminders and gentle nudges will appear here." />;
}
