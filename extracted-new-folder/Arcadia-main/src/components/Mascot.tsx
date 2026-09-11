import mascotWave from "@/assets/panda-front.gif";

export const MASCOT_SRC = mascotWave;

export function Mascot({ size = 140, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {glow ? <div className="absolute inset-4 rounded-full bg-sun/40 blur-2xl" /> : null}
      <img
        src={MASCOT_SRC}
        alt=""
        width={size}
        height={size}
        className="relative h-full w-full object-contain drop-shadow-[0_16px_22px_rgba(90,60,30,0.18)]"
      />
    </div>
  );
}
