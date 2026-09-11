import { CheckCircle2, CircleAlert, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'wouter';
import { useCareData } from '@/state/care-context';

export function ElderlySummary() {
  const { state } = useCareData();
  const { elderly, location } = state;
  const unresolvedImportant = state.alerts.filter(
    (a) => !a.read && (a.severity === 'emergency' || a.severity === 'safety' || a.severity === 'medicine'),
  );
  const isSafe = location.status === 'inside_zone';

  return (
    <section
      className="panel-shadow relative mt-8 overflow-hidden rounded-[1.8rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-7"
      data-testid="card-elderly-summary"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-[hsl(42_45%_96%)] bg-[hsl(174_26%_89%)] shadow-md sm:h-28 sm:w-28">
          {elderly.photoUrl ? (
            <img
              src={elderly.photoUrl}
              alt={elderly.name}
              className="h-full w-full object-cover"
              data-testid="img-elderly-photo"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[hsl(var(--muted-foreground))]">
              <UserRound className="h-10 w-10" />
            </div>
          )}
          <span
            className={`absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--card))] ${isSafe ? 'bg-[hsl(174_42%_43%)]' : 'bg-[hsl(4_64%_52%)]'}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-2xl text-[hsl(var(--foreground))] sm:text-3xl" data-testid="text-elderly-name">
              {elderly.name}
            </h2>
            <span className="rounded-full bg-[hsl(44_74%_63%/0.16)] px-3 py-1 text-xs font-bold text-[hsl(40_64%_43%)]">
              Age {elderly.age}
            </span>
          </div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Dementia: {elderly.dementiaStage}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold">
            <span
              className={`flex items-center gap-1.5 ${isSafe ? 'text-[hsl(174_43%_32%)]' : 'text-[hsl(4_64%_45%)]'}`}
            >
              {isSafe ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
              {isSafe ? 'Safe' : 'Outside safe zone'}
            </span>
          </div>
          <Link
            href="/profile"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[hsl(40_64%_43%)] hover:underline"
            data-testid="button-view-profile"
          >
            View Profile →
          </Link>
        </div>
      </div>

      <Link
        href="/alerts"
        className={`mt-6 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
          unresolvedImportant.length > 0
            ? 'bg-[hsl(44_74%_63%/0.14)] text-[hsl(40_64%_43%)]'
            : 'bg-[hsl(174_42%_43%/0.11)] text-[hsl(174_43%_27%)]'
        }`}
        data-testid="button-needs-attention"
      >
        {unresolvedImportant.length > 0 ? (
          <>
            <CircleAlert size={17} /> {unresolvedImportant.length} thing{unresolvedImportant.length === 1 ? '' : 's'} need
            attention
          </>
        ) : (
          <>
            <CheckCircle2 size={17} /> Everything looks good
          </>
        )}
      </Link>
    </section>
  );
}
