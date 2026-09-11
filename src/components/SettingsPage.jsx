import React from "react";
import { useLocation } from "wouter";
import { clearProfile } from "../lib/role";

export default function SettingsPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="mx-auto flex min-h-[100vh - 230px] max-w-[800px] flex-col px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#252525]">
          Settings
        </h1>
        <p className="mt-2 text-base text-[#686868]">
          Adjust who is using SmritiSetu and how the app behaves.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-[#252525] mb-2">User Profile</h2>
        <p className="text-sm text-[#686868] mb-4">
          Switch the current active user profile or reset local preferences.
        </p>
        <button
          type="button"
          onClick={() => {
            clearProfile();
            setLocation("/");
          }}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lift transition-transform hover:scale-[1.02]"
        >
          Switch user
        </button>
      </section>

      <button
        type="button"
        onClick={() => setLocation("/")}
        className="mt-8 self-start text-sm font-medium text-[#686868] hover:text-[#252525]"
      >
        ← Back to Home
      </button>
    </main>
  );
}