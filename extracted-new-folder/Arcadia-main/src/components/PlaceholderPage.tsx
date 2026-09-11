import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Mascot } from "@/components/Mascot";

export function PlaceholderPage({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen animate-rise px-5 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-soft transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>

        <div className="mt-8 flex flex-col items-center gap-4 rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-soft">
          <Mascot size={120} />
          <h1 className="text-3xl font-light tracking-tight">
            <span className="font-bold">{title}</span>
          </h1>
          {blurb ? <p className="max-w-sm text-muted-foreground">{blurb}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
