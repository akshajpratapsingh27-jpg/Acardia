import type { Dish } from "@/data/dishes";

type Props = {
  dish: Dish;
  onClick?: () => void;
  state?: "idle" | "correct" | "wrong" | "dim";
  disabled?: boolean;
  size?: "lg" | "md";
};

export function DishCard({ dish, onClick, state = "idle", disabled, size = "md" }: Props) {
  const ring =
    state === "correct"
      ? "border-success ring-4 ring-success/40"
      : state === "wrong"
        ? "border-destructive ring-4 ring-destructive/30"
        : "border-border";

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      {...(onClick ? { onClick, disabled, type: "button" as const } : {})}
      className={[
        "group block w-full overflow-hidden rounded-3xl border-4 bg-card text-left transition-all duration-200",
        ring,
        state === "dim" ? "opacity-45" : "opacity-100",
        onClick && !disabled
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_30px_-16px_oklch(0.5_0.1_45/0.5)] focus-visible:outline-4 focus-visible:outline-ring"
          : "",
      ].join(" ")}
    >
      <img
        src={dish.image}
        alt={dish.name}
        loading="lazy"
        width={768}
        height={768}
        className={size === "lg" ? "aspect-square w-full object-cover" : "aspect-square w-full object-cover"}
      />
      <div className="px-3 pb-2 pt-1.5 text-center">
        <p className="text-[0.7rem] font-semibold leading-tight text-foreground/80">{dish.name}</p>
        <p className="text-[0.6rem] leading-tight text-muted-foreground">{dish.place}</p>
      </div>
    </Tag>
  );
}
