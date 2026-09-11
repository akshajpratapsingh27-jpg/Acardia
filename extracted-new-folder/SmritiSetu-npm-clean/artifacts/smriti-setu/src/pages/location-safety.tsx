import { useState } from 'react';
import { MapPin, Navigation, Share2, ShieldAlert, ShieldCheck, Siren } from 'lucide-react';
import { DetailScreenHeader } from '@/components/layout/detail-screen-header';
import { DetailScreenBody, DetailScreenShell } from '@/components/layout/detail-screen-shell';
import { SafeZoneMap } from '@/components/location/safe-zone-map';
import { SeverityDot } from '@/components/shared/severity';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCareData } from '@/state/care-context';

export default function LocationSafetyPage() {
  const {
    state,
    setSafeZoneRadius,
    setSafeZoneLabel,
    toggleLocationSharing,
    simulateLeaveSafeZone,
    simulateReturnToSafeZone,
  } = useCareData();
  const { location, device, alerts } = state;
  const isSafe = location.status === 'inside_zone';
  const [zoneLabelDraft, setZoneLabelDraft] = useState(location.safeZoneLabel);

  const safetyAlerts = alerts.filter((a) => a.severity === 'safety' || a.severity === 'emergency');
  const formatRadiusLabel = (value: number) => {
    if (value >= 1000) {
      const kilometers = value / 1000;
      return `${kilometers % 1 === 0 ? kilometers.toFixed(0) : kilometers.toFixed(1)} km`;
    }
    return `${value} m`;
  };

  return (
    <DetailScreenShell>
      <DetailScreenHeader title="Location & Safety" icon={<MapPin size={18} />} />
      <DetailScreenBody>
        <div
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${
            isSafe ? 'bg-[hsl(174_42%_43%/0.11)] text-[hsl(174_43%_27%)]' : 'bg-[hsl(4_64%_52%/0.12)] text-[hsl(4_64%_40%)]'
          }`}
          data-testid="status-safety"
        >
          {isSafe ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
          {isSafe ? 'Inside Safe Zone' : 'Outside Safe Zone — safety alert generated'}
        </div>

        <SafeZoneMap
          status={location.status}
          radiusMeters={location.safeZoneRadiusMeters}
          online={device.online}
          currentCoordinates={location.currentCoordinates}
          lastKnownCoordinates={location.lastKnownCoordinates}
          safeZoneCenter={location.safeZoneCenter}
          safeZoneLabel={location.safeZoneLabel}
        />

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {device.online ? 'Current Location' : 'Last Known Location'}
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--foreground))]">{location.address}</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Updated {location.lastUpdatedMinutesAgo} min ago
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
              <Share2 size={16} /> Location sharing
            </div>
            <Switch
              checked={location.sharingEnabled}
              onCheckedChange={toggleLocationSharing}
              data-testid="switch-location-sharing"
              aria-label="Toggle location sharing"
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
              <Siren size={16} /> Emergency SOS
            </div>
            <span
              className={`text-sm font-bold ${location.sosActive ? 'text-[hsl(4_64%_45%)]' : 'text-[hsl(174_43%_32%)]'}`}
              data-testid="text-sos-status"
            >
              {location.sosActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Safe Zone Settings</h2>
          <div className="mt-4 space-y-2">
            <Label htmlFor="zone-label">Zone name</Label>
            <div className="flex gap-2">
              <Input
                id="zone-label"
                value={zoneLabelDraft}
                onChange={(e) => setZoneLabelDraft(e.target.value)}
                data-testid="input-safe-zone-label"
              />
              <Button
                variant="outline"
                onClick={() => setSafeZoneLabel(zoneLabelDraft)}
                data-testid="button-save-zone-label"
              >
                Save
              </Button>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="zone-radius">Safe-zone radius</Label>
              <span className="text-sm font-bold text-[hsl(var(--foreground))]">
                {formatRadiusLabel(location.safeZoneRadiusMeters)}
              </span>
            </div>
            <Slider
              id="zone-radius"
              min={100}
              max={5000}
              step={25}
              value={[location.safeZoneRadiusMeters]}
              onValueChange={([v]) => setSafeZoneRadius(v)}
              data-testid="slider-safe-zone-radius"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Prototype demo
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Simulate the location → safe zone check → alert flow.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateLeaveSafeZone}
              disabled={!isSafe}
              data-testid="button-simulate-leave-zone"
            >
              <Navigation size={14} /> Simulate leaving safe zone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateReturnToSafeZone}
              disabled={isSafe}
              data-testid="button-simulate-return-zone"
            >
              Simulate return to safe zone
            </Button>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">Important safety alerts</h2>
          <div className="mt-3 space-y-2">
            {safetyAlerts.length > 0 ? (
              safetyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
                >
                  <SeverityDot severity={alert.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[hsl(var(--foreground))]">{alert.title}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{alert.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">{alert.timestamp}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No safety alerts right now.</p>
            )}
          </div>
        </section>
      </DetailScreenBody>
    </DetailScreenShell>
  );
}
