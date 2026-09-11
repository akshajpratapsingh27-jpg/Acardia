import { Check, HeartHandshake, Pause, Pencil, Play, Stethoscope, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReminderRecord } from '@/types/care';

const statusStyles: Record<ReminderRecord['status'], string> = {
  upcoming: 'text-[hsl(var(--foreground))]',
  completed: 'text-[hsl(174_43%_32%)] line-through',
  missed: 'text-[hsl(4_64%_45%)] line-through',
  paused: 'text-[hsl(var(--muted-foreground))] italic',
};

export function ReminderListItem({
  reminder,
  onComplete,
  onMiss,
  onEdit,
  onDelete,
  onPause,
  onResume,
}: {
  reminder: ReminderRecord;
  onComplete: () => void;
  onMiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid={`reminder-item-${reminder.id}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            reminder.type === 'medicine' ? 'bg-[hsl(275_28%_84%)] text-[hsl(275_27%_35%)]' : 'bg-[hsl(44_74%_63%/0.25)] text-[hsl(32_64%_35%)]'
          }`}
        >
          {reminder.type === 'medicine' ? <Stethoscope size={16} /> : <HeartHandshake size={16} />}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${statusStyles[reminder.status]}`}>{reminder.title}</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {reminder.date} · {reminder.time} · {reminder.repeat}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {reminder.status === 'upcoming' && (
          <>
            <Button variant="outline" size="sm" onClick={onComplete} data-testid={`button-complete-${reminder.id}`}>
              <Check size={14} /> Completed
            </Button>
            <Button variant="outline" size="sm" onClick={onMiss} data-testid={`button-miss-${reminder.id}`}>
              <X size={14} /> Missed
            </Button>
            <Button variant="ghost" size="icon" onClick={onPause} aria-label="Pause reminder" data-testid={`button-pause-${reminder.id}`}>
              <Pause size={15} />
            </Button>
          </>
        )}
        {reminder.status === 'paused' && (
          <Button variant="outline" size="sm" onClick={onResume} data-testid={`button-resume-${reminder.id}`}>
            <Play size={14} /> Resume
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit reminder" data-testid={`button-edit-${reminder.id}`}>
          <Pencil size={15} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete reminder" data-testid={`button-delete-${reminder.id}`}>
          <Trash2 size={15} />
        </Button>
      </div>
    </article>
  );
}
