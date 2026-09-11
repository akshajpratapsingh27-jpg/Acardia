import type { Dish } from "@/lib/dishes";

export function DishCard({
  dish,
  size = "md",
  state = "idle",
  onClick,
  disabled = false,
  className = "",
}: {
  dish: Dish;
  size?: "sm" | "md" | "lg";
  state?: "idle" | "correct" | "wrong" | "chosen" | "dim";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const ring =
    state === "correct"
      ? "ring-4 ring-[oklch(0.62_0.14_150)]"
      : state === "wrong"
        ? "ring-4 ring-destructive/70 opacity-60"
        : state === "chosen"
          ? "ring-4 ring-primary"
          : state === "dim"
            ? "ring-1 ring-border opacity-60"
            : "ring-1 ring-border";

  const box = size === "lg" ? "w-56 sm:w-72" : size === "sm" ? "w-28 sm:w-32" : "w-36 sm:w-44";

  const Tag = onClick && !disabled ? "button" : "div";

  return (
    <Tag
      type={onClick && !disabled ? "button" : undefined}
      onClick={onClick && !disabled ? onClick : undefined}
      className={`group ${box} overflow-hidden rounded-3xl bg-card shadow-sm transition-transform ${ring} ${
        onClick && !disabled ? "hover:scale-[1.03] active:scale-95" : ""
      } ${className}`}
      aria-label={dish.name}
    >
      <img
        src={dish.image}
        alt={dish.name}
        width={768}
        height={768}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
      <p className="px-2 pb-2 pt-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground">
        {dish.name}
      </p>
    </Tag>
  );
}
