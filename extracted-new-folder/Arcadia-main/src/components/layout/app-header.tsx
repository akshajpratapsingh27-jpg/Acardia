import { Bell, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { Logo } from '@/components/layout/logo';
import { useCareData } from '@/state/care-context';
import { clearProfile } from '@/lib/role';

export function AppHeader() {
  const { unresolvedAlertCount, syncNow } = useCareData();
  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full sm:h-14 sm:w-14">
          <Logo className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl leading-tight text-[hsl(var(--foreground))] sm:text-2xl">
            SmritiSetu
          </p>
          <p className="truncate text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            Caregiver Dashboard
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          className="flex h-11 items-center gap-2 rounded-full px-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] sm:px-3"
          onClick={syncNow}
          aria-label="Sync care data"
          data-testid="button-sync"
        >
          <RefreshCw size={14} />
        </button>

        <button
          className="rounded-full px-3 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          onClick={() => {
            clearProfile();
            window.location.assign('/');
          }}
          data-testid="button-change-role"
        >
          Change Role
        </button>

        <Link
          href="/alerts"
          className="relative flex h-11 items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]"
          aria-label="Open alerts and notifications"
          data-testid="button-open-alerts"
        >
          <Bell size={18} strokeWidth={1.8} />
          {unresolvedAlertCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--accent))]" />
          )}
        </Link>
      </div>
    </header>
  );
}