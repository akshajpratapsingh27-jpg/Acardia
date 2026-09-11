import { useMemo, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { SeverityDot, severityLabel } from '@/components/shared/severity';
import { Button } from '@/components/ui/button';
import { useCareData } from '@/state/care-context';
import type { AlertSeverity } from '@/types/care';

const severityOrder: AlertSeverity[] = ['emergency', 'safety', 'medicine', 'reminder', 'info'];

export default function AlertsPage() {
  const { state, markAlertRead, markAllAlertsRead } = useCareData();
  const [showHistory, setShowHistory] = useState(false);

  const unread = state.alerts.filter((a) => !a.read);
  const read = state.alerts.filter((a) => a.read);
  const visible = showHistory ? state.alerts : unread;

  const grouped = useMemo(() => {
    const groups = new Map<AlertSeverity, typeof visible>();
    for (const severity of severityOrder) groups.set(severity, []);
    for (const alert of visible) groups.get(alert.severity)?.push(alert);
    return groups;
  }, [visible]);

  return (
    <DetailScreenShell>
      <DetailScreenHeader
        title="Alerts & Notifications"
        icon={<Bell size={18} />}
        action={
          unread.length > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAlertsRead} data-testid="button-mark-all-read">
              <Check size={14} /> Mark all read
            </Button>
          ) : undefined
        }
      />
      <DetailScreenBody>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {unread.length > 0 ? `${unread.length} unresolved` : 'All alerts resolved'}
          </p>
          <button
            className="text-sm font-bold text-[hsl(40_64%_43%)] hover:underline"
            onClick={() => setShowHistory((v) => !v)}
            data-testid="button-toggle-history"
          >
            {showHistory ? 'Hide history' : 'View alert history'}
          </button>
        </div>

        {severityOrder.map((severity) => {
          const alertsForSeverity = grouped.get(severity) ?? [];
          if (alertsForSeverity.length === 0) return null;
          return (
            <section key={severity}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {severityLabel(severity)}
              </h2>
              <div className="mt-2 space-y-2">
                {alertsForSeverity.map((alert) => (
                  <article
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      alert.read
                        ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))] opacity-70'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                    }`}
                    data-testid={`alert-item-${alert.id}`}
                  >
                    <div className="mt-1">
                      <SeverityDot severity={alert.severity} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[hsl(var(--foreground))]">{alert.title}</p>
                        {!alert.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" aria-label="Unread" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{alert.description}</p>
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{alert.timestamp}</p>
                    </div>
                    {!alert.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAlertRead(alert.id)}
                        data-testid={`button-mark-read-${alert.id}`}
                      >
                        Mark as read
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
            <p className="text-sm font-bold text-[hsl(var(--foreground))]">No alerts</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">There is nothing to review right now.</p>
          </div>
        )}
      </DetailScreenBody>
    </DetailScreenShell>
  );
}
