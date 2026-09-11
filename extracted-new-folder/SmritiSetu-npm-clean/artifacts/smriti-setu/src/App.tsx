import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CareDataProvider } from '@/state/care-context';
import DashboardPage from '@/pages/dashboard';
import LocationSafetyPage from '@/pages/location-safety';
import AlertsPage from '@/pages/alerts';
import RemindersPage from '@/pages/reminders';
import MedicalReportsPage from '@/pages/medical-reports';
import DailyProgressPage from '@/pages/daily-progress';
import ConnectPage from '@/pages/connect';
import ElderlyProfilePage from '@/pages/elderly-profile';
import MyDayPage from '@/pages/my-day';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell outside the boundary so it survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/location" component={LocationSafetyPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route path="/medical" component={MedicalReportsPage} />
        <Route path="/progress" component={DailyProgressPage} />
        <Route path="/my-day" component={MyDayPage} />
        <Route path="/connect" component={ConnectPage} />
        <Route path="/profile" component={ElderlyProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CareDataProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CareDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
