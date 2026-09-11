export function Logo({ className = 'h-14 w-14' }: { className?: string }) {
  return (
    <img
      src="/Smritisetu%20LOGO.jpeg"
      alt="SmritiSetu"
      className={`${className} object-contain`}
      data-testid="img-smritisetu-logo"
    />
  );
}
