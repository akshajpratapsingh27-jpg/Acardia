import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';

export function DetailScreenHeader({
  title,
  icon,
  backHref = '/',
  action,
}: {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-5 py-4 sm:px-8 lg:px-12">
      <Logo className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
      <Link
        href={backHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
        aria-label="Back"
        data-testid="button-back"
      >
        <ArrowLeft size={20} />
      </Link>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
          {icon}
        </div>
      )}
      <h1 className="min-w-0 flex-1 truncate font-serif text-xl text-[hsl(var(--foreground))] sm:text-2xl">
        {title}
      </h1>
      {action}
    </header>
  );
}
