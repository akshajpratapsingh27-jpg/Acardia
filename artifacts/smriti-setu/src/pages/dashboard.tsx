import { AppHeader } from '@/components/layout/app-header';
import { ElderlySummary } from '@/components/dashboard/elderly-summary';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';

export default function DashboardPage() {
  return (
    <div className="grain-overlay app-shell min-h-[100dvh] text-[hsl(var(--foreground))]">
      <AppHeader />
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-2 sm:px-8 lg:px-12">
        <ElderlySummary />
        <DashboardGrid />
      </div>
    </div>
  );
}
