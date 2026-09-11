import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Minus, TrendingUp } from 'lucide-react';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CompletionBarChart } from '@/components/progress/completion-bar-chart';
import { useCareData } from '@/state/care-context';

export default function DailyProgressPage() {
  const { state, addDailyNote } = useCareData();
  const { progress } = state;
  const [note, setNote] = useState('');

  const submitNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!note.trim()) return;
    addDailyNote(note.trim());
    setNote('');
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader title="Daily Progress" icon={<TrendingUp size={18} />} />
      <DetailScreenBody>
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
            <TabsTrigger value="week" data-testid="tab-7-days">7 Days</TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  Overall completion
                </p>
                <p className="font-serif text-2xl text-[hsl(var(--foreground))]">{progress.todayPercent}%</p>
              </div>
              <Progress value={progress.todayPercent} className="mt-3" />
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {progress.todayActivities.map((activity) => (
                <div
                  key={activity.label}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
                  data-testid={`activity-stat-${activity.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{activity.label}</p>
                  <p className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">
                    {activity.completed}/{activity.total}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Medicines taken</p>
                <p className="mt-1 text-lg font-bold text-[hsl(174_43%_32%)]">{progress.medicinesTaken}</p>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Medicines missed</p>
                <p className="mt-1 text-lg font-bold text-[hsl(4_64%_45%)]">{progress.medicinesMissed}</p>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="week" className="space-y-3">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Activity participation across the last 7 days.</p>
            <CompletionBarChart data={progress.last7Days} />
          </TabsContent>

          <TabsContent value="month" className="space-y-3">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Activity participation trend across the month.</p>
            <CompletionBarChart data={progress.monthly} />
          </TabsContent>
        </Tabs>

        <section>
          <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Cognitive Insights</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {progress.cognitiveInsights.map((insight) => (
              <div
                key={insight.label}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
                data-testid={`insight-${insight.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <p className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{insight.label}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[hsl(var(--foreground))]">
                  {insight.trend === 'up' && <ArrowUpRight size={14} className="text-[hsl(174_43%_32%)]" />}
                  {insight.trend === 'flat' && <Minus size={14} className="text-[hsl(var(--muted-foreground))]" />}
                  {insight.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Today's Notes</h2>
          <form onSubmit={submitNote} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an observation about today"
              className="flex-1"
              data-testid="input-daily-note"
            />
            <Button type="submit" disabled={!note.trim()} data-testid="button-add-note">
              Add note
            </Button>
          </form>
          <div className="mt-3 space-y-2">
            {progress.notes.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                <p className="text-sm text-[hsl(var(--foreground))]">{entry.text}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{entry.date}</p>
              </div>
            ))}
          </div>
        </section>
      </DetailScreenBody>
    </DetailScreenShell>
  );
}
