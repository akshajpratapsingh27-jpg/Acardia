import type { AlertSeverity } from '@/types/care';

const severityStyles: Record<AlertSeverity, { dot: string; label: string; text: string }> = {
  emergency: { dot: 'bg-[hsl(4_64%_52%)]', label: 'Emergency SOS', text: 'text-[hsl(4_64%_40%)]' },
  safety: { dot: 'bg-[hsl(4_64%_52%)]', label: 'Outside Safe Zone', text: 'text-[hsl(4_64%_40%)]' },
  medicine: { dot: 'bg-[hsl(32_74%_50%)]', label: 'Medicine missed', text: 'text-[hsl(32_64%_35%)]' },
  reminder: { dot: 'bg-[hsl(44_74%_50%)]', label: 'Reminder missed', text: 'text-[hsl(32_64%_35%)]' },
  info: { dot: 'bg-[hsl(202_20%_55%)]', label: 'Notification', text: 'text-[hsl(var(--muted-foreground))]' },
};

export function SeverityDot({ severity }: { severity: AlertSeverity }) {
  const style = severityStyles[severity];
  return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />;
}

export function severityLabel(severity: AlertSeverity) {
  return severityStyles[severity].label;
}

export function severityTextClass(severity: AlertSeverity) {
  return severityStyles[severity].text;
}
