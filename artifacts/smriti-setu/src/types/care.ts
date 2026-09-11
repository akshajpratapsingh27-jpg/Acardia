// Centralized domain types for the caregiver portal.
// Keeping these in one place makes it easy to swap the mock data
// source for real API data later without touching component code.

export type DementiaStage = 'Mild' | 'Moderate' | 'Severe';

export interface ElderlyProfile {
  name: string;
  age: number;
  photoUrl: string | null;
  dementiaStage: DementiaStage;
  preferredLanguage: string;
  allergies: string[];
  emergencyInfo: string;
  personalPreferences: string[];
}

export type SafetyStatus = 'inside_zone' | 'outside_zone';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationState {
  status: SafetyStatus;
  address: string;
  lastUpdatedMinutesAgo: number;
  safeZoneLabel: string;
  safeZoneRadiusMeters: number;
  safeZoneCenter: Coordinates;
  currentCoordinates: Coordinates;
  lastKnownCoordinates: Coordinates;
  sharingEnabled: boolean;
  sosActive: boolean;
}

export type AlertSeverity = 'emergency' | 'safety' | 'medicine' | 'reminder' | 'info';

export interface AlertRecord {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export type ReminderKind = 'task' | 'reminder';
export type ReminderType =
  | 'medicine'
  | 'meal'
  | 'exercise'
  | 'cognitive'
  | 'personal'
  | 'custom'
  | 'appointment'
  | 'birthday'
  | 'family'
  | 'call'
  | 'event';
export type ReminderRepeat = 'once' | 'daily' | 'weekly' | 'custom';
export type ReminderStatus = 'upcoming' | 'completed' | 'missed' | 'paused';

export interface ReminderRecord {
  id: string;
  kind: ReminderKind;
  title: string;
  type: ReminderType;
  date: string;
  time: string;
  repeat: ReminderRepeat;
  status: ReminderStatus;
  important: boolean;
  notes?: string;
}

export interface MedicalInfoField {
  id: string;
  label: string;
  value: string;
}

export type MedicalRecordCategory = 'history' | 'prescription' | 'doctor_note' | 'document';

export interface MedicalRecordEntry {
  id: string;
  category: MedicalRecordCategory;
  title: string;
  date: string;
  notes?: string;
}

export type ContactCategory = 'doctor' | 'family' | 'caregiver' | 'emergency';

export interface ContactRecord {
  id: string;
  category: ContactCategory;
  name: string;
  phone: string;
  roleOrRelationship?: string;
  hospitalOrClinic?: string;
  specialty?: string;
}

export interface DailyActivityStat {
  label: string;
  completed: number;
  total: number;
}

export interface DayCompletion {
  label: string;
  percent: number;
}

export interface CognitiveInsight {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
}

export interface DailyNote {
  id: string;
  date: string;
  text: string;
}

export interface ProgressState {
  todayPercent: number;
  todayActivities: DailyActivityStat[];
  medicinesTaken: number;
  medicinesMissed: number;
  gamesCompleted: number;
  gamesTotal: number;
  last7Days: DayCompletion[];
  monthly: DayCompletion[];
  cognitiveInsights: CognitiveInsight[];
  notes: DailyNote[];
}

export interface DeviceState {
  online: boolean;
  lastSyncedMinutesAgo: number;
}

export interface CareState {
  elderly: ElderlyProfile;
  device: DeviceState;
  location: LocationState;
  alerts: AlertRecord[];
  reminders: ReminderRecord[];
  medicalInfo: MedicalInfoField[];
  medicalRecords: MedicalRecordEntry[];
  contacts: ContactRecord[];
  progress: ProgressState;
}
