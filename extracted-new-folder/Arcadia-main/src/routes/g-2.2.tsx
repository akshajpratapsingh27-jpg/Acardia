import { createFileRoute, useNavigate } from "@tanstack/react-router";
// Import your existing game component from its actual path (e.g., inside .cc or pages)
// Example: import GameComponent from "../.cc/your-game-file";

function GameRouteWrapper() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute left-4 top-4 z-10">
        <button
          type="button"
          onClick={() => void navigate({ to: "/play" })}
          className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-soft transition-transform hover:scale-105"
        >
          ← Back to Games
        </button>
      </div>
      {/* Render your game component here */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pattern Sequence (g-2.2)</h1>
          <p className="text-muted-foreground mt-2">Loading game component...</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/g-2/2")({
  component: GameRouteWrapper,
});