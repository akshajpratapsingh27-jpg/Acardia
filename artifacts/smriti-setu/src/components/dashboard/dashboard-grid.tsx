import { Bell, CalendarClock, MapPin, Phone, Stethoscope, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { MiniProgressGraph } from '@/components/dashboard/mini-progress-graph';
import { SeverityDot } from '@/components/shared/severity';
import { useCareData } from '@/state/care-context';

export function DashboardGrid() {
  const { state } = useCareData();
  const { location, alerts, progress, reminders } = state;

  const previewAlerts = alerts.filter((a) => !a.read).slice(0, 2);
  const upcomingReminders = reminders.filter((r) => r.status === 'upcoming').slice(0, 3);
  const isSafe = location.status === 'inside_zone';

  return (
    <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Dashboard">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        <DashboardCard
          href="/location"
          icon={<MapPin size={20} />}
          title="Location & Safety"
          testId="card-location-safety"
        >
          <p className={`text-sm font-bold ${isSafe ? 'text-[hsl(174_43%_32%)]' : 'text-[hsl(4_64%_45%)]'}`}>
            {isSafe ? 'Inside Safe Zone' : 'Outside Safe Zone'}
          </p>
          <p className="mt-1 truncate text-sm text-[hsl(var(--muted-foreground))]">{location.address}</p>
        </DashboardCard>

        <DashboardCard href="/progress" icon={<TrendingUp size={20} />} title="Daily Progress" testId="card-daily-progress">
          <p className="font-serif text-3xl text-[hsl(var(--foreground))]">{progress.todayPercent}%</p>
          <div className="mt-3">
            <MiniProgressGraph values={progress.last7Days.map((d) => d.percent)} />
          </div>
        </DashboardCard>

        <DashboardCard
          href="/medical"
          icon={<Stethoscope size={20} />}
          title="Medical Reports"
          testId="card-medical-reports"
        />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <DashboardCard href="/alerts" icon={<Bell size={20} />} title="Alerts & Notifications" testId="card-alerts">
          {previewAlerts.length > 0 ? (
            <ul className="space-y-2">
              {previewAlerts.map((alert) => (
                <li key={alert.id} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
                  <SeverityDot severity={alert.severity} />
                  <span className="truncate">{alert.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No unresolved alerts</p>
          )}
        </DashboardCard>

        <DashboardCard href="/reminders" icon={<CalendarClock size={20} />} title="Reminders" testId="card-reminders">
          {upcomingReminders.length > 0 ? (
            <ul className="space-y-1.5">
              {upcomingReminders.map((reminder) => (
                <li key={reminder.id} className="truncate text-sm text-[hsl(var(--foreground))]">
                  <span className="font-bold">{reminder.time}</span> · {reminder.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No upcoming reminders</p>
          )}
          <Link
            href="/reminders?add=1"
            className="relative z-20 mt-3 inline-block text-sm font-bold text-[hsl(40_64%_43%)] hover:underline"
            onClick={(event) => event.stopPropagation()}
            data-testid="button-add-reminder-preview"
          >
            + Add Reminder
          </Link>
        </DashboardCard>

        <DashboardCard href="/connect" icon={<Phone size={20} />} title="Connect" testId="card-connect">
          <p className="text-sm font-bold text-[hsl(40_64%_43%)]">View Contacts →</p>
        </DashboardCard>
      </div>
    </section>
  );
}
