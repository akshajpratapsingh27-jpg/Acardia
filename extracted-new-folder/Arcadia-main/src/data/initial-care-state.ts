import type { CareState } from '@/types/care';

// Centralized mock data. Replace this module with a real API call later —
// every component reads care state through useCareData(), so nothing else
// needs to change.
export const initialCareState: CareState = {
  elderly: {
    name: 'Rajesh Sharma',
    age: 72,
    photoUrl: null,
    dementiaStage: 'Moderate',
    preferredLanguage: 'Hindi',
    allergies: ['Penicillin'],
    emergencyInfo: 'Carries an ID card with home address and emergency contact number.',
    personalPreferences: ['Prefers tea over coffee', 'Enjoys morning walks in the garden'],
  },
  device: {
    online: true,
    lastSyncedMinutesAgo: 2,
  },
  location: {
    status: 'inside_zone',
    address: 'Near Deccan Gymkhana, Pune',
    lastUpdatedMinutesAgo: 2,
    safeZoneLabel: 'Home',
    safeZoneRadiusMeters: 250,
    safeZoneCenter: { lat: 18.5204, lng: 73.8567 },
    currentCoordinates: { lat: 18.5209, lng: 73.8572 },
    lastKnownCoordinates: { lat: 18.5209, lng: 73.8572 },
    sharingEnabled: true,
    sosActive: false,
  },
  alerts: [
    {
      id: 'al-1',
      severity: 'medicine',
      title: 'Medicine missed',
      description: 'Amlodipine 5 mg was not marked as taken at 9:00 AM.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 'al-2',
      severity: 'safety',
      title: 'New safety alert',
      description: 'Location was outside the designated safe zone for 6 minutes.',
      timestamp: '5 hours ago',
      read: false,
    },
    {
      id: 'al-3',
      severity: 'reminder',
      title: 'Reminder missed',
      description: 'Evening walk activity was not completed yesterday.',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: 'al-4',
      severity: 'info',
      title: 'Weekly summary ready',
      description: 'The 7-day activity summary has been updated.',
      timestamp: '2 days ago',
      read: true,
    },
  ],
  reminders: [
    { id: 'rm-1', kind: 'task', title: 'Amlodipine 5 mg', type: 'medicine', date: 'Today', time: '20:00', repeat: 'daily', status: 'upcoming', important: true, notes: 'Take with water after dinner.' },
    { id: 'rm-2', kind: 'reminder', title: 'Doctor appointment · Dr. Mehta', type: 'appointment', date: 'Tomorrow', time: '11:00', repeat: 'once', status: 'upcoming', important: true, notes: 'Bring the prescription copy.' },
    { id: 'rm-3', kind: 'task', title: 'Lunch', type: 'meal', date: 'Today', time: '13:00', repeat: 'daily', status: 'completed', important: false, notes: 'Light meal with vegetables.' },
    { id: 'rm-4', kind: 'task', title: 'Evening walk', type: 'exercise', date: 'Today', time: '17:30', repeat: 'daily', status: 'upcoming', important: false, notes: 'Gentle walk around the garden.' },
  ],
  medicalInfo: [
    { id: 'mi-1', label: 'Diagnosis', value: "Alzheimer's-type dementia" },
    { id: 'mi-2', label: 'Dementia stage', value: 'Moderate' },
    { id: 'mi-3', label: 'Allergies', value: 'Penicillin' },
    { id: 'mi-4', label: 'Current medicines', value: 'Amlodipine 5 mg, Donepezil 5 mg' },
  ],
  medicalRecords: [
    { id: 'mr-1', category: 'doctor_note', title: "Dr. Mehta's note", date: '12 Jun 2024', notes: 'Care plan unchanged. Follow-up in 3 weeks.' },
    { id: 'mr-2', category: 'prescription', title: 'Prescription — Donepezil 5 mg', date: '30 May 2024' },
    { id: 'mr-3', category: 'history', title: 'Diagnosis record', date: '14 Feb 2023' },
  ],
  contacts: [
    { id: 'c-1', category: 'doctor', name: 'Dr. Mehta', phone: '+919000000101', hospitalOrClinic: 'Sahyadri Hospital', specialty: 'Neurology' },
    { id: 'c-2', category: 'family', name: 'Priya Sharma', phone: '+919000000102', roleOrRelationship: 'Primary caregiver' },
    { id: 'c-3', category: 'family', name: 'Vikram Sharma', phone: '+919000000103', roleOrRelationship: 'Family member' },
    { id: 'c-4', category: 'caregiver', name: 'Anita Joshi', phone: '+919000000104', roleOrRelationship: 'Part-time attendant' },
    { id: 'c-5', category: 'emergency', name: 'Emergency Services', phone: '112', roleOrRelationship: 'Emergency services' },
  ],
  progress: {
    todayPercent: 78,
    todayActivities: [
      { label: 'Medicines', completed: 1, total: 2 },
      { label: 'Meals', completed: 2, total: 3 },
      { label: 'Cognitive games', completed: 1, total: 1 },
      { label: 'Exercise', completed: 0, total: 1 },
    ],
    medicinesTaken: 1,
    medicinesMissed: 1,
    gamesCompleted: 1,
    gamesTotal: 1,
    last7Days: [
      { label: 'Mon', percent: 70 },
      { label: 'Tue', percent: 85 },
      { label: 'Wed', percent: 60 },
      { label: 'Thu', percent: 90 },
      { label: 'Fri', percent: 75 },
      { label: 'Sat', percent: 65 },
      { label: 'Sun', percent: 78 },
    ],
    monthly: [
      { label: 'Wk 1', percent: 68 },
      { label: 'Wk 2', percent: 74 },
      { label: 'Wk 3', percent: 71 },
      { label: 'Wk 4', percent: 80 },
    ],
    cognitiveInsights: [
      { label: 'Activity participation', value: '+12% this week', trend: 'up' },
      { label: 'Game completion', value: '5 of 7 days', trend: 'up' },
      { label: 'Engagement trend', value: 'Steady', trend: 'flat' },
    ],
    notes: [
      { id: 'n-1', date: 'Today', text: 'More engaged during today\u2019s memory activity.' },
      { id: 'n-2', date: 'Yesterday', text: 'Needed a reminder prompt for lunch.' },
    ],
  },
};
