import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Heart, Home, Lightbulb, Phone, Settings, Sparkles, Sun } from 'lucide-react';
import { Link } from 'wouter';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { Button } from '@/components/ui/button';
import { useCareData } from '@/state/care-context';
import type { ReminderRecord, ReminderType } from '@/types/care';
import logo from '@/assets/ssetu.png';

const moodOptions = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'okay', label: 'Okay', emoji: '🙂' },
  { value: 'not-so-good', label: 'Not so good', emoji: '😐' },
  { value: 'sad', label: 'Sad', emoji: '😔' },
] as const;

type MoodChoice = (typeof moodOptions)[number]['value'];

const moodResponses: Record<MoodChoice, { thought: string; activity: string; showConnect: boolean }> = {
  happy: {
    thought: 'Today is a good day to enjoy something you love.',
    activity: 'Look through a favorite photo in Memories.',
    showConnect: false,
  },
  okay: {
    thought: 'One little moment can make today brighter.',
    activity: 'Try a gentle activity or a game when you feel ready.',
    showConnect: false,
  },
  'not-so-good': {
    thought: 'Take your time. There is no hurry.',
    activity: 'A small walk or a friendly conversation may feel nice.',
    showConnect: false,
  },
  sad: {
    thought: 'You are doing well, one step at a time.',
    activity: 'Would you like to connect with someone from your family?',
    showConnect: true,
  },
};

const getTypeLabel = (type: ReminderType) => {
  const labelMap: Record<ReminderType, string> = {
    medicine: 'Medicine',
    meal: 'Meal',
    exercise: 'Exercise',
    cognitive: 'Cognitive activity',
    personal: 'Personal',
    custom: 'Custom',
    appointment: 'Appointment',
    birthday: 'Birthday',
    family: 'Family',
    call: 'Call',
    event: 'Event',
  };

  return labelMap[type];
};

const getTypeIcon = (type: ReminderType) => {
  const iconMap: Record<ReminderType, string> = {
    medicine: '💊',
    meal: '🍽️',
    exercise: '🚶',
    cognitive: '🧠',
    personal: '🧹',
    custom: '✨',
    appointment: '🩺',
    birthday: '🎂',
    family: '👨‍👩‍👧',
    call: '📞',
    event: '🎉',
  };

  return iconMap[type];
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseReminderDate(value: string): Date | null {
  const text = value?.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  if (lower === 'today') return startOfDay(new Date());
  if (lower === 'tomorrow') return startOfDay(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const dayMonthYear = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dayMonthYear) {
    const day = Number(dayMonthYear[1]);
    const month = Number(dayMonthYear[2]);
    const year = Number(dayMonthYear[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return startOfDay(parsed);
    }
    return null;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfDay(parsed);
}

function isSameDay(date: string, compareDate: Date) {
  const parsed = parseReminderDate(date);
  if (!parsed) return false;
  return parsed.getTime() === startOfDay(compareDate).getTime();
}

function isUpcomingDay(date: string, compareDate: Date) {
  const parsed = parseReminderDate(date);
  if (!parsed) return false;
  return parsed.getTime() > startOfDay(compareDate).getTime();
}

function sortRemindersChronologically(items: ReminderRecord[]) {
  return [...items].sort((a, b) => {
    const dateA = parseReminderDate(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const dateB = parseReminderDate(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (dateA !== dateB) return dateA - dateB;

    const timeA = a.time ? a.time : '23:59';
    const timeB = b.time ? b.time : '23:59';
    const valueA = timeA.split(':').reduce((total, segment) => total * 60 + Number(segment), 0);
    const valueB = timeB.split(':').reduce((total, segment) => total * 60 + Number(segment), 0);
    return valueA - valueB;
  });
}

export default function MyDayPage() {
  const { state, completeReminder, triggerSOS } = useCareData();
  const { reminders } = state;
  const [mood, setMood] = useState<MoodChoice | null>(null);

  const today = useMemo(() => new Date(), []);

  // Everything scheduled for today is visible on My Day. Tasks (medicine,
  // meals, exercise, etc.) remain in Today's tasks, while caregiver-created
  // reminders appear in Today's reminders.
  const todayTasks = useMemo(
    () => reminders.filter((item) => item.kind === 'task' && isSameDay(item.date, today)),
    [reminders, today],
  );

  const todaysReminders = useMemo(
    () => reminders.filter((item) => item.kind === 'reminder' && isSameDay(item.date, today)),
    [reminders, today],
  );

  const upcomingReminders = useMemo(
    () => sortRemindersChronologically(reminders.filter((item) => item.kind === 'reminder' && isUpcomingDay(item.date, today))),
    [reminders, today],
  );

  const completedTasksCount = todayTasks.filter((task) => task.status === 'completed').length;
  const moodResponse = mood ? moodResponses[mood] : null;
  return (
    <DetailScreenShell>
      <header className="sticky top-0 z-20 flex h-20 items-center border-b border-border/60 bg-card/80 px-5 backdrop-blur-xl sm:h-[82px]">
        <Link href="/" className="flex items-center gap-3" aria-label="Go to home">
          <img src={logo} alt="SmritiSetu" width={48} height={48} className="size-12 rounded-full ring-1 ring-border/70" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight tracking-tight">SmritiSetu</p>
            <p className="text-xs text-muted-foreground">Bridging memories</p>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/sos" onClick={() => triggerSOS()} className="flex items-center gap-2 rounded-full bg-foreground py-2 pl-2 pr-4 text-sm font-semibold text-background shadow-lift" aria-label="Emergency SOS">
            <span className="flex size-8 items-center justify-center rounded-full bg-sos text-[11px] font-bold text-sos-foreground">SOS</span>
            <span className="hidden sm:inline">I need help</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Settings">
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>
      </header>
      <DetailScreenBody>
        <section className="rounded-[30px] bg-white/75 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-base font-bold text-[hsl(var(--foreground))]">Today&apos;s tasks</p>
            </div>
            <p className="text-base font-bold text-[#252525] sm:text-lg">
              {completedTasksCount} of {todayTasks.length} completed
            </p>
          </div>

          {todayTasks.length > 0 ? (
            <div className="mt-4 space-y-3">
              {todayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 ${
                      isCompleted
                        ? 'border-[hsl(174_42%_43%)] bg-[hsl(174_42%_95%)]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-xl">
                        {getTypeIcon(task.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{task.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                              <span>{getTypeLabel(task.type)}</span>
                              {task.time && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock3 size={14} />
                                    {task.time}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-[hsl(174_43%_32%)] px-2 py-1 text-xs font-bold text-white">
                              <CheckCircle2 size={14} />
                              Done
                            </div>
                          )}
                        </div>

                        {task.notes && <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{task.notes}</p>}

                        <div className="mt-3">
                          <Button
                            type="button"
                            size="lg"
                            variant={isCompleted ? 'secondary' : 'default'}
                            className="min-h-[48px] w-full justify-center text-base font-bold"
                            onClick={() => !isCompleted && completeReminder(task.id)}
                            disabled={isCompleted}
                            aria-label={isCompleted ? `${task.title} completed` : `Mark ${task.title} complete`}
                          >
                            {isCompleted ? 'Completed' : 'Mark as done'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 text-center text-base text-[hsl(var(--muted-foreground))]">
              No tasks for today.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-[hsl(var(--muted-foreground))]" />
            <h3 className="font-serif text-2xl text-[hsl(var(--foreground))]">Reminders</h3>
          </div>

          <div className="rounded-[30px] bg-[#f1d36b] p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Today&apos;s reminders</h4>
            {todaysReminders.length > 0 ? (
              <div className="mt-3 space-y-3">
                {todaysReminders.map((reminder) => (
                  <div key={reminder.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-xl">
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-[hsl(var(--foreground))]">{reminder.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <span>{getTypeLabel(reminder.type)}</span>
                          {reminder.time && (
                            <>
                              <span>•</span>
                              <span>{reminder.time}</span>
                            </>
                          )}
                        </div>
                        {reminder.notes && <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{reminder.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">No reminders for today.</p>
            )}
          </div>

          <div className="rounded-[30px] bg-[#c9d7eb] p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Upcoming reminders</h4>
            {upcomingReminders.length > 0 ? (
              <div className="mt-3 space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-xl">
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-[hsl(var(--foreground))]">{reminder.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <span>{getTypeLabel(reminder.type)}</span>
                          <span>•</span>
                          <span>{reminder.date}</span>
                          {reminder.time && (
                            <>
                              <span>•</span>
                              <span>{reminder.time}</span>
                            </>
                          )}
                        </div>
                        {reminder.notes && <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{reminder.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">No upcoming reminders.</p>
            )}
          </div>
        </section>

        <section className="rounded-[30px] bg-white/75 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[hsl(var(--muted-foreground))]" />
            <h3 className="font-serif text-2xl text-[hsl(var(--foreground))]">How are you feeling today?</h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {moodOptions.map((option) => {
              const selected = mood === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`min-h-[72px] rounded-2xl border p-3 text-left transition ${
                    selected
                      ? 'border-[hsl(174_42%_43%)] bg-[hsl(174_42%_95%)] text-[hsl(var(--foreground))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                  }`}
                >
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="mt-2 text-base font-bold">{option.label}</div>
                </button>
              );
            })}
          </div>

          {moodResponse && (
            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                  <Lightbulb size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">Gentle suggestion</p>
                  <p className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">Thought for Today</p>
                </div>
              </div>
              <p className="mt-3 text-base text-[hsl(var(--foreground))]">{moodResponse.thought}</p>
              {mood === 'happy' || mood === 'not-so-good' ? (
                <Link href="/memory" className="mt-3 block text-base text-[hsl(var(--muted-foreground))] underline underline-offset-4 hover:text-[hsl(var(--foreground))]">
                  {moodResponse.activity}
                </Link>
              ) : (
                <p className="mt-3 text-base text-[hsl(var(--muted-foreground))]">{moodResponse.activity}</p>
              )}

              {moodResponse.showConnect ? (
                <div className="mt-4">
                  <Link href="/family">
                    <Button type="button" className="min-h-[48px] w-full justify-center text-base font-bold">
                      <Phone size={18} />
                      Connect with Family
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </DetailScreenBody>
      <nav className="fixed bottom-5 left-1/2 z-10 grid h-[82px] w-[92%] max-w-[850px] -translate-x-1/2 grid-cols-4 items-center gap-1 rounded-[42px] bg-[rgba(35,35,35,0.97)] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.18)]" aria-label="Elderly navigation">
        {[
          { href: '/', label: 'Home', icon: <Home size={20} /> },
          { href: '/progress', label: 'Activities', icon: <Sun size={20} /> },
          { href: '/my-day', label: 'My Day', icon: <Heart size={20} /> },
          { href: '/connect', label: 'Connect', icon: <Phone size={20} /> },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-[66px] flex-col items-center justify-center gap-1 rounded-[35px] text-xs ${item.href === '/my-day' ? 'bg-[#f2c94c] text-[#222]' : 'text-[#dedede]'}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </DetailScreenShell>
  );
}
