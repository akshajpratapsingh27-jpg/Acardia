import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CareDataProvider } from '@/state/care-context';
import { HomeScreen } from '@/components/HomeScreen';
import { RoleOnboarding } from '@/components/RoleOnboarding';
import { getStoredName, storeProfile } from '@/lib/role';
import type { UserRole } from '@/lib/role';
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
import ActivitiesPage from '@/routes/activities';
import FamilyPage from '@/routes/family';
import { ChatbotScreen } from '@/routes/chatbot';
// The existing Memory screen is a JavaScript component without declarations.
// @ts-expect-error The component is intentionally consumed as an untyped module.
import MemoryPage from '@/routes/memory';
import GamesMenuPage from '@/routes/play';
import TuneWithMePage from '@/routes/play2';
import FlipCardsPage from '@/routes/play3';
import ConnectTheDotsPage from '@/routes/play4';
import MarketplacePage from '@/routes/play5';
import { LetsExploreGame as ExploreGamePage } from '@/routes/play6';
import FlipGamePage from '@/routes/flip';
import MarketplaceGamePage from '@/routes/marketplace';
import FestivalFavouritesPage from '@/routes/festival-favourites';
// The existing Settings screen is a JavaScript component without declarations.
// @ts-expect-error The component is intentionally consumed as an untyped module.
import SettingsPage from '@/components/SettingsPage';
// @ts-expect-error SosPage is an existing JSX screen without a declaration file.
import SosPage from '@/SosPage';
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
        <Route path="/" component={RoleEntryPage} />
        <Route path="/location" component={LocationSafetyPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route path="/medical" component={MedicalReportsPage} />
        <Route path="/progress" component={DailyProgressPage} />
        <Route path="/my-day" component={MyDayPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/family" component={FamilyPage} />
        <Route path="/chatbot" component={ChatbotScreen} />
        <Route path="/memory" component={MemoryPage} />
        <Route path="/play" component={GamesMenuPage} />
        <Route path="/play2" component={TuneWithMePage} />
        <Route path="/play3" component={FlipCardsPage} />
        <Route path="/play4" component={ConnectTheDotsPage} />
        <Route path="/play5" component={MarketplacePage} />
        <Route path="/play6" component={ExploreGamePage} />
        <Route path="/flip" component={FlipGamePage} />
        <Route path="/marketplace" component={MarketplaceGamePage} />
        <Route path="/festival-favourites" component={FestivalFavouritesPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/connect" component={ConnectPage} />
        <Route path="/profile" component={ElderlyProfilePage} />
        <Route path="/sos" component={SosRoute} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function RoleEntryPage() {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    // The root URL is the explicit role-selection landing page. Existing
    // profiles remain available to Change Role and direct feature routes.
    setRole(null);
    setName(getStoredName());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen" />;

  if (!role) {
    return (
      <RoleOnboarding
        onComplete={(nextRole, nextName) => {
          storeProfile(nextRole, nextName);
          setRole(nextRole);
          setName(nextName.trim());
        }}
      />
    );
  }

  if (role === 'caregiver') {
    return <DashboardPage />;
  }

  return <HomeScreen role={role} name={name || 'friend'} />;
}

function SosRoute() {
  const [, setLocation] = useLocation();
  return <SosPage navigate={() => setLocation('/')} />;
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
