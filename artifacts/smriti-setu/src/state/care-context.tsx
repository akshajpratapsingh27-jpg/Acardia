import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialCareState } from '@/data/initial-care-state';
import type {
  AlertRecord,
  AlertSeverity,
  CareState,
  ContactRecord,
  MedicalInfoField,
  MedicalRecordEntry,
  ReminderRecord,
} from '@/types/care';

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function pushAlert(
  alerts: AlertRecord[],
  severity: AlertSeverity,
  title: string,
  description: string,
): AlertRecord[] {
  return [
    { id: makeId('al'), severity, title, description, timestamp: 'Just now', read: false },
    ...alerts,
  ];
}

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function applySafeZoneCheck(state: CareState, nextCoordinates: { lat: number; lng: number }) {
  const distance = distanceMeters(state.location.safeZoneCenter, nextCoordinates);
  const outside = distance > state.location.safeZoneRadiusMeters;
  const wasOutside = state.location.status === 'outside_zone';
  const location = {
    ...state.location,
    status: outside ? ('outside_zone' as const) : ('inside_zone' as const),
    currentCoordinates: nextCoordinates,
    lastKnownCoordinates: nextCoordinates,
    lastUpdatedMinutesAgo: 0,
  };
  if (!outside || wasOutside) return { ...state, location };
  return {
    ...state,
    location,
    alerts: pushAlert(
      state.alerts,
      'safety',
      'Outside Safe Zone',
      `Location moved outside the ${state.location.safeZoneLabel} safe zone.`,
    ),
  };
}

interface CareContextValue {
  state: CareState;
  unresolvedAlertCount: number;
  syncNow: () => void;
  // reminders
  addReminder: (reminder: Omit<ReminderRecord, 'id' | 'status'> & { kind?: ReminderRecord['kind'] }) => void;
  updateReminder: (id: string, updates: Partial<Omit<ReminderRecord, 'id'>>) => void;
  deleteReminder: (id: string) => void;
  pauseReminder: (id: string) => void;
  resumeReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  missReminder: (id: string) => void;
  // alerts
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  // location
  setSafeZoneRadius: (meters: number) => void;
  setSafeZoneLabel: (label: string) => void;
  toggleLocationSharing: () => void;
  simulateLeaveSafeZone: () => void;
  simulateReturnToSafeZone: () => void;
  triggerSOS: () => void;
  clearSOS: () => void;
  // medical
  addMedicalInfo: (field: Omit<MedicalInfoField, 'id'>) => void;
  updateMedicalInfo: (id: string, updates: Partial<Omit<MedicalInfoField, 'id'>>) => void;
  deleteMedicalInfo: (id: string) => void;
  addMedicalRecord: (record: Omit<MedicalRecordEntry, 'id'>) => void;
  updateMedicalRecord: (id: string, updates: Partial<Omit<MedicalRecordEntry, 'id'>>) => void;
  deleteMedicalRecord: (id: string) => void;
  // contacts
  addContact: (contact: Omit<ContactRecord, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Omit<ContactRecord, 'id'>>) => void;
  deleteContact: (id: string) => void;
  // profile
  updateElderlyField: <K extends 'name' | 'age' | 'dementiaStage' | 'preferredLanguage' | 'emergencyInfo'>(
    field: K,
    value: CareState['elderly'][K],
  ) => void;
  updateElderlyPhoto: (photoUrl: string | null) => void;
  addAllergy: (value: string) => void;
  removeAllergy: (value: string) => void;
  addPreference: (value: string) => void;
  removePreference: (value: string) => void;
  // daily notes
  addDailyNote: (text: string) => void;
}

const CareContext = createContext<CareContextValue | null>(null);

const CARE_STATE_STORAGE_KEY = 'smritisetu-care-state-v1';

function loadCareState(): CareState {
  if (typeof window === 'undefined') return initialCareState;

  try {
    const saved = window.localStorage.getItem(CARE_STATE_STORAGE_KEY);
    if (!saved) return initialCareState;
    return JSON.parse(saved) as CareState;
  } catch {
    return initialCareState;
  }
}

export function CareDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareState>(loadCareState);

  // Keep caregiver changes available after navigation/refresh and in another
  // open tab (e.g. Caregiver Portal <-> My Day).
  useEffect(() => {
    try {
      window.localStorage.setItem(CARE_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Local storage can be unavailable in some browser/privacy modes.
    }
  }, [state]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CARE_STATE_STORAGE_KEY || !event.newValue) return;
      try {
        setState(JSON.parse(event.newValue) as CareState);
      } catch {
        // Ignore malformed external storage updates.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const syncNow = useCallback(() => {
    setState((s) => ({ ...s, device: { ...s.device, online: true, lastSyncedMinutesAgo: 0 } }));
  }, []);

  // ---- Reminders -> My Day -> Progress -> Alerts flow ----
  const addReminder = useCallback((reminder: Omit<ReminderRecord, 'id' | 'status'> & { kind?: ReminderRecord['kind'] }) => {
    setState((s) => ({
      ...s,
      reminders: [
        ...s.reminders,
        {
          ...reminder,
          kind: reminder.kind ?? 'task',
          id: makeId('rm'),
          status: 'upcoming',
        },
      ],
    }));
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Omit<ReminderRecord, 'id'>>) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));
  }, []);

  const pauseReminder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, status: 'paused' } : r)),
    }));
  }, []);

  const resumeReminder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, status: 'upcoming' } : r)),
    }));
  }, []);

  const completeReminder = useCallback((id: string) => {
    setState((s) => {
      const reminder = s.reminders.find((r) => r.id === id);
      if (!reminder) return s;
      return {
        ...s,
        reminders: s.reminders.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)),
        progress: {
          ...s.progress,
          todayPercent: Math.min(100, s.progress.todayPercent + 3),
        },
      };
    });
  }, []);

  // Missing an important reminder generates an Alert, per the reminder flow.
  const missReminder = useCallback((id: string) => {
    setState((s) => {
      const reminder = s.reminders.find((r) => r.id === id);
      if (!reminder) return s;
      const nextReminders = s.reminders.map((r) => (r.id === id ? { ...r, status: 'missed' as const } : r));
      const nextAlerts = reminder.important
        ? pushAlert(
            s.alerts,
            reminder.type === 'medicine' ? 'medicine' : 'reminder',
            reminder.type === 'medicine' ? 'Medicine missed' : 'Reminder missed',
            `${reminder.title} was not completed at ${reminder.time}.`,
          )
        : s.alerts;
      return {
        ...s,
        reminders: nextReminders,
        alerts: nextAlerts,
        progress: {
          ...s.progress,
          todayPercent: Math.max(0, s.progress.todayPercent - 3),
        },
      };
    });
  }, []);

  // ---- Alerts ----
  const markAlertRead = useCallback((id: string) => {
    setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) }));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setState((s) => ({ ...s, alerts: s.alerts.map((a) => ({ ...a, read: true })) }));
  }, []);

  // ---- Location -> Safe Zone Check -> Alert flow ----
  const setSafeZoneRadius = useCallback((meters: number) => {
    setState((s) => {
      const safeZoneRadiusMeters = Math.max(100, Math.min(5000, Math.round(meters)));
      const nextLocation = { ...s.location, safeZoneRadiusMeters };
      const outside = distanceMeters(nextLocation.safeZoneCenter, nextLocation.currentCoordinates) > safeZoneRadiusMeters;
      if (outside && s.location.status !== 'outside_zone') {
        return {
          ...s,
          location: { ...nextLocation, status: 'outside_zone' },
          alerts: pushAlert(
            s.alerts,
            'safety',
            'Outside Safe Zone',
            `Location is outside the ${nextLocation.safeZoneLabel} safe zone after the radius was changed.`,
          ),
        };
      }
      return { ...s, location: { ...nextLocation, status: outside ? 'outside_zone' : 'inside_zone' } };
    });
  }, []);

  const setSafeZoneLabel = useCallback((label: string) => {
    setState((s) => ({ ...s, location: { ...s.location, safeZoneLabel: label } }));
  }, []);

  const toggleLocationSharing = useCallback(() => {
    setState((s) => ({ ...s, location: { ...s.location, sharingEnabled: !s.location.sharingEnabled } }));
  }, []);

  const simulateLeaveSafeZone = useCallback(() => {
    setState((s) => applySafeZoneCheck(s, { lat: 18.5289, lng: 73.8728 }));
  }, []);

  const simulateReturnToSafeZone = useCallback(() => {
    setState((s) => applySafeZoneCheck(s, s.location.safeZoneCenter));
  }, []);

  const triggerSOS = useCallback(() => {
    setState((s) => ({
      ...s,
      location: { ...s.location, sosActive: true },
      alerts: pushAlert(s.alerts, 'emergency', 'Emergency SOS', 'SOS was triggered from the elderly companion app.'),
    }));
  }, []);

  const clearSOS = useCallback(() => {
    setState((s) => ({ ...s, location: { ...s.location, sosActive: false } }));
  }, []);

  // ---- Medical ----
  const addMedicalInfo = useCallback((field: Omit<MedicalInfoField, 'id'>) => {
    setState((s) => ({ ...s, medicalInfo: [...s.medicalInfo, { ...field, id: makeId('mi') }] }));
  }, []);

  const updateMedicalInfo = useCallback((id: string, updates: Partial<Omit<MedicalInfoField, 'id'>>) => {
    setState((s) => ({
      ...s,
      medicalInfo: s.medicalInfo.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  const deleteMedicalInfo = useCallback((id: string) => {
    setState((s) => ({ ...s, medicalInfo: s.medicalInfo.filter((m) => m.id !== id) }));
  }, []);

  const addMedicalRecord = useCallback((record: Omit<MedicalRecordEntry, 'id'>) => {
    setState((s) => ({ ...s, medicalRecords: [{ ...record, id: makeId('mr') }, ...s.medicalRecords] }));
  }, []);

  const updateMedicalRecord = useCallback((id: string, updates: Partial<Omit<MedicalRecordEntry, 'id'>>) => {
    setState((s) => ({
      ...s,
      medicalRecords: s.medicalRecords.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  const deleteMedicalRecord = useCallback((id: string) => {
    setState((s) => ({ ...s, medicalRecords: s.medicalRecords.filter((m) => m.id !== id) }));
  }, []);

  // ---- Contacts ----
  const addContact = useCallback((contact: Omit<ContactRecord, 'id'>) => {
    setState((s) => ({ ...s, contacts: [...s.contacts, { ...contact, id: makeId('c') }] }));
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Omit<ContactRecord, 'id'>>) => {
    setState((s) => ({ ...s, contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
  }, []);

  // ---- Profile ----
  const updateElderlyField = useCallback(
    <K extends 'name' | 'age' | 'dementiaStage' | 'preferredLanguage' | 'emergencyInfo'>(
      field: K,
      value: CareState['elderly'][K],
    ) => {
      setState((s) => ({ ...s, elderly: { ...s.elderly, [field]: value } }));
    },
    [],
  );

  const updateElderlyPhoto = useCallback((photoUrl: string | null) => {
    setState((s) => ({ ...s, elderly: { ...s.elderly, photoUrl } }));
  }, []);

  const addAllergy = useCallback((value: string) => {
    setState((s) => ({ ...s, elderly: { ...s.elderly, allergies: [...s.elderly.allergies, value] } }));
  }, []);

  const removeAllergy = useCallback((value: string) => {
    setState((s) => ({ ...s, elderly: { ...s.elderly, allergies: s.elderly.allergies.filter((a) => a !== value) } }));
  }, []);

  const addPreference = useCallback((value: string) => {
    setState((s) => ({
      ...s,
      elderly: { ...s.elderly, personalPreferences: [...s.elderly.personalPreferences, value] },
    }));
  }, []);

  const removePreference = useCallback((value: string) => {
    setState((s) => ({
      ...s,
      elderly: {
        ...s.elderly,
        personalPreferences: s.elderly.personalPreferences.filter((p) => p !== value),
      },
    }));
  }, []);

  // ---- Daily notes (part of Daily Progress) ----
  const addDailyNote = useCallback((text: string) => {
    setState((s) => ({
      ...s,
      progress: { ...s.progress, notes: [{ id: makeId('n'), date: 'Today', text }, ...s.progress.notes] },
    }));
  }, []);

  const unresolvedAlertCount = useMemo(() => state.alerts.filter((a) => !a.read).length, [state.alerts]);

  const value = useMemo<CareContextValue>(
    () => ({
      state,
      unresolvedAlertCount,
      syncNow,
      addReminder,
      updateReminder,
      deleteReminder,
      pauseReminder,
      resumeReminder,
      completeReminder,
      missReminder,
      markAlertRead,
      markAllAlertsRead,
      setSafeZoneRadius,
      setSafeZoneLabel,
      toggleLocationSharing,
      simulateLeaveSafeZone,
      simulateReturnToSafeZone,
      triggerSOS,
      clearSOS,
      addMedicalInfo,
      updateMedicalInfo,
      deleteMedicalInfo,
      addMedicalRecord,
      updateMedicalRecord,
      deleteMedicalRecord,
      addContact,
      updateContact,
      deleteContact,
      updateElderlyField,
      updateElderlyPhoto,
      addAllergy,
      removeAllergy,
      addPreference,
      removePreference,
      addDailyNote,
    }),
    [
      state,
      unresolvedAlertCount,
      syncNow,
      addReminder,
      updateReminder,
      deleteReminder,
      pauseReminder,
      resumeReminder,
      completeReminder,
      missReminder,
      markAlertRead,
      markAllAlertsRead,
      setSafeZoneRadius,
      setSafeZoneLabel,
      toggleLocationSharing,
      simulateLeaveSafeZone,
      simulateReturnToSafeZone,
      triggerSOS,
      clearSOS,
      addMedicalInfo,
      updateMedicalInfo,
      deleteMedicalInfo,
      addMedicalRecord,
      updateMedicalRecord,
      deleteMedicalRecord,
      addContact,
      updateContact,
      deleteContact,
      updateElderlyField,
      updateElderlyPhoto,
      addAllergy,
      removeAllergy,
      addPreference,
      removePreference,
      addDailyNote,
    ],
  );

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}

export function useCareData() {
  const ctx = useContext(CareContext);
  if (!ctx) throw new Error('useCareData must be used within a CareDataProvider');
  return ctx;
}
