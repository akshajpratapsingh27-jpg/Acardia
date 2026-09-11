import { createFileRoute } from "@tanstack/react-router";
// SettingsPage is a JavaScript component without a declaration file.
// @ts-expect-error The component is intentionally consumed as an untyped module.
import SettingsPage from "../components/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SmritiSetu" },
      { name: "description", content: "Adjust who is using SmritiSetu and how the app behaves." },
      { property: "og:title", content: "Settings — SmritiSetu" },
      {
        property: "og:description",
        content: "Adjust who is using SmritiSetu and how the app behaves.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});