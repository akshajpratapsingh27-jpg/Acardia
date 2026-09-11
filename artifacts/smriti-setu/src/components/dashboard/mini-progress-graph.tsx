export function MiniProgressGraph({ values }: { values: number[] }) {
  const max = 100;
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={index}
          className="w-2.5 rounded-full bg-[hsl(var(--accent))]"
          style={{ height: `${Math.max(8, (value / max) * 100)}%`, opacity: 0.45 + (0.55 * index) / values.length }}
        />
      ))}
    </div>
  );
}
