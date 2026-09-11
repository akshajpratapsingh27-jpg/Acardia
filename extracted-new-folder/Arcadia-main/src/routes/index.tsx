import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { RoleOnboarding } from "@/components/RoleOnboarding";
import { clearProfile, getStoredName, getStoredRole, storeProfile } from "@/lib/role";
import type { UserRole } from "@/lib/role";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmritiSetu — A gentle memory companion" },
      {
        name: "description",
        content:
          "SmritiSetu is a calm daily companion for people living with memory loss and the caretakers who support them.",
      },
      { property: "og:title", content: "SmritiSetu — A gentle memory companion" },
      {
        property: "og:description",
        content:
          "A calm daily companion for people living with memory loss and the caretakers who support them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setRole(getStoredRole());
    setName(getStoredName());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen" />;

  if (!role) {
    return (
      <RoleOnboarding
        onComplete={(nextRole, nextName) => {
          storeProfile(nextRole, nextName);
          setRole(nextRole);
          setName(nextName.trim());
        }}
      />
    );
  }

  return (
    <HomeScreen
      role={role}
      name={name || "friend"}
      onReset={() => {
        clearProfile();
        setRole(null);
        setName("");
      }}
    />
  );
}
