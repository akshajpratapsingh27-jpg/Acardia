import { useState } from "react";
import { HeartHandshake, User2, ArrowRight } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/role";

const ROLES: {
  id: UserRole;
  title: string;
  blurb: string;
  icon: typeof User2;
  tone: string;
}[] = [
  {
    id: "patient",
    title: "I am here for myself",
    blurb: "A calm, simple space made for you",
    icon: User2,
    tone: "bg-sun/60 text-sun-foreground",
  },
  {
    id: "caregiver",
    title: "I am a caretaker",
    blurb: "Support and follow someone you love",
    icon: HeartHandshake,
    tone: "bg-sage/70 text-sage-foreground",
  },
];

export function RoleOnboarding({
  onComplete,
}: {
  onComplete: (role: UserRole, name: string) => void;
}) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-8 px-5 py-12 text-center">
      <div className="animate-rise">
        <Mascot size={168} />
      </div>

      <div className="animate-rise space-y-2" style={{ animationDelay: "60ms" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Welcome to SmritiSetu
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Who is using this device?
        </h1>
        <p className="text-base text-muted-foreground">
          We only ask this once. You can change it later in Settings.
        </p>
      </div>

      <div
        className="animate-rise grid w-full gap-3 sm:grid-cols-2"
        style={{ animationDelay: "120ms" }}
      >
        {ROLES.map((option) => {
          const Icon = option.icon;
          const active = role === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setRole(option.id)}
              aria-pressed={active}
              className={cn(
                "group flex items-center gap-4 rounded-3xl border p-5 text-left transition-all duration-300",
                "bg-card shadow-soft hover:-translate-y-0.5 hover:shadow-lift",
                active
                  ? "border-primary/50 ring-2 ring-primary/30"
                  : "border-border/70",
              )}
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
                  option.tone,
                )}
              >
                <Icon className="size-6" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-base font-semibold">{option.title}</span>
                <span className="block text-sm text-muted-foreground">{option.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="animate-rise w-full space-y-3 text-left"
        style={{ animationDelay: "180ms" }}
      >
        <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
          {role === "caregiver" ? "Your name" : "What should we call you?"}
        </label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Darsh"
          className="h-14 rounded-2xl border-border/70 bg-card px-5 text-base shadow-soft"
        />
        <button
          type="button"
          disabled={!role || name.trim().length === 0}
          onClick={() => role && onComplete(role, name)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="size-5" />
        </button>
      </div>
    </main>
  );
}
