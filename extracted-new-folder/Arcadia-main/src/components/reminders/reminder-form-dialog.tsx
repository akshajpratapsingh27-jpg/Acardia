import { useEffect, useState, type FormEvent } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ReminderKind, ReminderRecord, ReminderRepeat, ReminderType } from '@/types/care';

const taskTypeOptions: { value: ReminderType; label: string }[] = [
  { value: 'medicine', label: 'Medicine' },
  { value: 'meal', label: 'Meal' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'cognitive', label: 'Cognitive Activity' },
  { value: 'personal', label: 'Personal' },
  { value: 'custom', label: 'Custom' },
];

const reminderTypeOptions: { value: ReminderType; label: string }[] = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'family', label: 'Family' },
  { value: 'call', label: 'Call' },
  { value: 'event', label: 'Event' },
  { value: 'custom', label: 'Custom' },
];

const kindOptions: { value: ReminderKind; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'reminder', label: 'Reminder' },
];

const repeatOptions: { value: ReminderRepeat; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const getTypeOptions = (kind: ReminderKind) =>
  kind === 'task' ? taskTypeOptions : reminderTypeOptions;

function formatDateForInput(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'today' || trimmed.toLowerCase() === 'tomorrow') {
    return { valid: true, value: trimmed };
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return { valid: false, value: trimmed };

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const candidate = new Date(year, month - 1, day);

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return { valid: false, value: trimmed };
  }

  return { valid: true, value: formatDateForInput(candidate) };
}

export interface ReminderFormValues {
  title: string;
  kind: ReminderKind;
  type: ReminderType;
  date: string;
  time: string;
  repeat: ReminderRepeat;
  notes?: string;
  important: boolean;
}

export function ReminderFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ReminderRecord | null;
  onSubmit: (values: ReminderFormValues) => void;
}) {
  const [title, setTitle] = useState('');
  // The caregiver action is specifically "Add Reminder", so new entries
  // default to the reminder bucket used by My Day. Caregivers can still
  // switch to Task when they are adding a daily activity such as medicine,
  // meals, exercise, or cognitive activities.
  const [kind, setKind] = useState<ReminderKind>('reminder');
  const [type, setType] = useState<ReminderType>('medicine');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState<ReminderRepeat>('once');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      const nextKind = initial?.kind ?? 'reminder';
      const nextType = initial?.type ?? (nextKind === 'task' ? 'medicine' : 'appointment');
      setTitle(initial?.title ?? '');
      setKind(nextKind);
      setType(nextType);
      setDate(initial?.date ?? 'Today');
      setTime(initial?.time ?? '09:00');
      setRepeat(initial?.repeat ?? 'once');
      setNotes(initial?.notes ?? '');
    }
  }, [open, initial]);

  useEffect(() => {
    const allowedTypes = getTypeOptions(kind).map((option) => option.value);
    if (!allowedTypes.includes(type)) {
      const firstType = allowedTypes[0];
      if (firstType) setType(firstType);
    }
  }, [kind, type]);

  const dateValidation = parseDateInput(date);
  const selectedDate = (() => {
    if (!dateValidation.valid || !dateValidation.value) return undefined;
    const normalized = dateValidation.value.toLowerCase();
    if (normalized === 'today' || normalized === 'tomorrow') return undefined;
    const [day, month, year] = dateValidation.value.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  })();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !dateValidation.valid) return;
    const trimmedNotes = notes.trim();
    const resolvedDate = dateValidation.value || 'Today';
    onSubmit({
      title: trimmedTitle,
      kind,
      type,
      date: resolvedDate,
      time,
      repeat,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      important:
        kind === 'task'
          ? ['medicine', 'exercise', 'cognitive'].includes(type)
          : ['appointment', 'birthday', 'call', 'event', 'family'].includes(type),
    });
    onOpenChange(false);
  };

  const typeOptions = getTypeOptions(kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-reminder-form">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit reminder' : 'Add reminder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item type</Label>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={kind === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setKind(option.value)}
                  data-testid={`button-kind-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-title">Title / details</Label>
            <Input
              id="reminder-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === 'task' ? 'e.g. Amlodipine 5 mg' : 'e.g. Family birthday celebration'}
              data-testid="input-reminder-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-type">Category</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReminderType)}>
                <SelectTrigger id="reminder-type" data-testid="select-reminder-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-repeat">Repeat</Label>
              <Select value={repeat} onValueChange={(v) => setRepeat(v as ReminderRepeat)}>
                <SelectTrigger id="reminder-repeat" data-testid="select-reminder-repeat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repeatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-date">Date</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="reminder-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="DD/MM/YYYY or Today"
                  className={cn('flex-1', date && !dateValidation.valid && 'border-destructive focus-visible:ring-destructive')}
                  aria-invalid={date ? !dateValidation.valid : undefined}
                  data-testid="input-reminder-date"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon" aria-label="Choose reminder date">
                      <CalendarIcon size={15} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        if (day) setDate(formatDateForInput(day));
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {date && !dateValidation.valid && (
                <p className="text-xs text-[hsl(var(--destructive))]">Enter a valid date in DD/MM/YYYY format.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                data-testid="input-reminder-time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-notes">Notes (optional)</Label>
            <Textarea
              id="reminder-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add instructions or context"
              data-testid="input-reminder-notes"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!title.trim() || !dateValidation.valid} data-testid="button-save-reminder">
              {initial ? 'Save changes' : 'Add reminder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
