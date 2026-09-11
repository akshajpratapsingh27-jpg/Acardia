import { Bell, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { Logo } from '@/components/layout/logo';
import { useCareData } from '@/state/care-context';

export function AppHeader() {
  const { state, unresolvedAlertCount, syncNow } = useCareData();
  const { device } = state;
  const lastActiveLabel =
    device.lastSyncedMinutesAgo === 0
      ? 'just now'
      : `${device.lastSyncedMinutesAgo} min ago`;

  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <Logo className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
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
        <div className="flex flex-col items-end text-right">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
            Last Seen
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--foreground))]">
            <span
              className={`h-2 w-2 rounded-full ${device.online ? 'bg-[hsl(174_42%_43%)]' : 'bg-[hsl(var(--muted-foreground))]'}`}
            />
            {device.online ? 'Online' : 'Offline'}
          </span>
          <span className="mt-0.5 text-[0.7rem] leading-snug text-[hsl(var(--muted-foreground))]">
            Last active: {lastActiveLabel}
          </span>
        </div>

        <button
          className="flex h-11 items-center gap-2 rounded-full px-2 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] sm:px-3"
          onClick={syncNow}
          aria-label="Sync care data"
          data-testid="button-sync"
        >
          <RefreshCw size={14} />
          <span className="hidden lg:inline">Sync</span>
        </button>

        <Link
          href="/alerts"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]"
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
