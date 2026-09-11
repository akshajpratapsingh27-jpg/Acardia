import type { ReactNode } from 'react';

export function DetailScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-[900px]">{children}</div>
    </div>
  );
}

export function DetailScreenBody({ children }: { children: ReactNode }) {
  return <div className="space-y-6 px-5 pb-16 pt-6 sm:px-8 lg:px-12">{children}</div>;
}
