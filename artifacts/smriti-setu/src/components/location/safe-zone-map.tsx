import { useEffect, useRef, useState } from 'react';
import type { Coordinates, SafetyStatus } from '@/types/care';

const GOOGLE_MAPS_SCRIPT_ID = 'smritisetu-google-maps';

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(window.google.maps), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => (window.google?.maps ? resolve(window.google.maps) : reject(new Error('Google Maps did not initialize.')));
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  });
}

export function SafeZoneMap({
  status,
  radiusMeters,
  online,
  currentCoordinates,
  lastKnownCoordinates,
  safeZoneCenter,
  safeZoneLabel,
}: {
  status: SafetyStatus;
  radiusMeters: number;
  online: boolean;
  currentCoordinates: Coordinates;
  lastKnownCoordinates: Coordinates;
  safeZoneCenter: Coordinates;
  safeZoneLabel: string;
}) {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const activeCoordinates = online ? currentCoordinates : lastKnownCoordinates;

  useEffect(() => {
    let cancelled = false;

    if (!apiKey) {
      setError('Google Maps requires VITE_GOOGLE_MAPS_API_KEY. Add the key to your local .env file to enable the map.');
      return;
    }

    setError(null);
    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapElement.current) return;
        const center = new maps.LatLng(activeCoordinates.lat, activeCoordinates.lng);
        mapRef.current = new maps.Map(mapElement.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
        });
        markerRef.current = new maps.Marker({
          position: center,
          map: mapRef.current,
          title: online ? 'Current location' : 'Last known location',
          label: { text: online ? 'C' : 'L', color: '#ffffff', fontWeight: '700' },
        });
        circleRef.current = new maps.Circle({
          map: mapRef.current,
          center: safeZoneCenter,
          radius: radiusMeters,
          fillColor: '#4d9b8f',
          fillOpacity: 0.14,
          strokeColor: '#4d9b8f',
          strokeOpacity: 0.9,
          strokeWeight: 2,
        });
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Google Maps could not be loaded.');
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    const maps = window.google?.maps;
    if (!maps || !mapRef.current || !markerRef.current || !circleRef.current) return;

    const position = new maps.LatLng(activeCoordinates.lat, activeCoordinates.lng);
    markerRef.current.setPosition(position);
    markerRef.current.setTitle(online ? 'Current location' : 'Last known location');
    markerRef.current.setLabel({ text: online ? 'C' : 'L', color: '#ffffff', fontWeight: '700' });
    mapRef.current.panTo(position);
    circleRef.current.setCenter(safeZoneCenter);
    circleRef.current.setRadius(radiusMeters);
  }, [activeCoordinates.lat, activeCoordinates.lng, online, radiusMeters, safeZoneCenter.lat, safeZoneCenter.lng]);

  if (error) {
    return (
      <div
        className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-6 text-center"
        data-testid="map-fallback"
      >
        <div className="max-w-md">
          <p className="text-sm font-bold text-[hsl(var(--foreground))]">Map unavailable in this environment</p>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapElement}
      className="h-72 w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] sm:h-80"
      role="application"
      aria-label={`${online ? 'Current' : 'Last known'} location and ${safeZoneLabel} safe zone map`}
      data-testid="google-map"
    />
  );
}
