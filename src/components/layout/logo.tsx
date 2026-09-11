import logoAsset from '@/assets/ssetu.png';

export function Logo({ className = "h-12 w-32" }: { className?: string }) {
  return (
    <img
      src={logoAsset}
      alt="SmritiSetu Logo"
      className={`h-full w-full object-contain ${className}`}
    />
  );
}