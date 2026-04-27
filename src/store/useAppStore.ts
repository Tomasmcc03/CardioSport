import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserType = 'individual' | 'club';
export type TestStatus = 'Cleared' | 'Due Soon' | 'Overdue';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';
export type TestResult = 'Normal' | 'Abnormal' | 'Pending';

export interface User {
  username: string;
  email: string;
  phone: string;
  bio: string;
  userType: UserType;
}

export interface Appointment {
  id: number;
  type: string;
  date: string;
  time: string;
  location: string;
  address: string;
  status: AppointmentStatus;
  result?: TestResult;
  heartRate?: string;
  doctor?: string;
  patient?: string;
}

export interface Player {
  id: number;
  name: string;
  age: number;
  position: string;
  lastTest: string;
  nextTest: string;
  status: TestStatus;
  testsCompleted: number;
}

export interface HealthData {
  restingHR: number;
  maxHR: number;
  avgHR: number;
  hrVariability: number;
  weeklyData: { day: string; hr: number }[];
  overallStatus: TestStatus;
  lastTest: string;
  nextDue: string;
  testsCompleted: number;
}

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  isLoggedIn: boolean;
  user: User;

  // Data
  appointments: Appointment[];
  players: Player[];
  health: HealthData;

  // Auth actions
  login: (username: string, userType: UserType) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Appointment actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: number) => void;

  // Player actions (club)
  addPlayer: (player: Omit<Player, 'id'>) => void;
  removePlayer: (id: number) => void;
  updatePlayerStatus: (id: number, status: TestStatus) => void;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialUser: User = {
  username: '',
  email: 'user@example.com',
  phone: '+353 87 123 4567',
  bio: 'GAA player and athlete',
  userType: 'individual',
};

// Appointments are loaded from Supabase on login — no initial mock data needed

// Players are loaded from Supabase on login for club accounts — no initial mock data needed

const initialHealth: HealthData = {
  restingHR: 72,
  maxHR: 185,
  avgHR: 68,
  hrVariability: 45,
  weeklyData: [
    { day: 'Mon', hr: 70 },
    { day: 'Tue', hr: 68 },
    { day: 'Wed', hr: 72 },
    { day: 'Thu', hr: 69 },
    { day: 'Fri', hr: 71 },
    { day: 'Sat', hr: 73 },
    { day: 'Sun', hr: 67 },
  ],
  overallStatus: 'Cleared',
  lastTest: 'Nov 15, 2025',
  nextDue: 'Feb 15, 2026',
  testsCompleted: 3,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  isLoggedIn: false,
  user: initialUser,
  appointments: [],
  players: [],
  health: initialHealth,

  // ── Auth ───────────────────────────────────────────────────────────────────

  login: (username, userType) => {
    set({
      isLoggedIn: true,
      user: { ...get().user, username, userType },
    });
  },

  logout: () => {
    set({
      isLoggedIn: false,
      user: initialUser,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates },
    }));
  },

  // ── Appointments ───────────────────────────────────────────────────────────

  addAppointment: (appointmentData) => {
    const state = get();
    const newId = Math.max(0, ...state.appointments.map((a) => a.id)) + 1;

    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      status: 'upcoming',
    };

    set((state) => ({
      appointments: [newAppointment, ...state.appointments],
      // Update health stats to reflect new test completion count
      health: {
        ...state.health,
        nextDue: appointmentData.date,
      },
    }));
  },

  cancelAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
      ),
    }));
  },

  // ── Players ────────────────────────────────────────────────────────────────

  addPlayer: (playerData) => {
    const state = get();
    const newId = Math.max(0, ...state.players.map((p) => p.id)) + 1;

    const newPlayer: Player = {
      ...playerData,
      id: newId,
    };

    set((state) => ({
      players: [...state.players, newPlayer],
    }));
  },

  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
  },

  updatePlayerStatus: (id, status) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    }));
  },
}));

// ─── Selector Helpers (use these in components) ───────────────────────────────

// Returns only upcoming appointments
export const selectUpcomingAppointments = (state: AppState) =>
  state.appointments.filter((a) => a.status === 'upcoming');

// Returns only completed appointments (test history)
export const selectCompletedAppointments = (state: AppState) =>
  state.appointments.filter((a) => a.status === 'completed');

// Returns the next upcoming appointment
export const selectNextAppointment = (state: AppState) =>
  state.appointments.find((a) => a.status === 'upcoming') ?? null;

// Returns player counts by status (for club dashboard)
export const selectPlayerStats = (state: AppState) => ({
  total: state.players.length,
  cleared: state.players.filter((p) => p.status === 'Cleared').length,
  dueSoon: state.players.filter((p) => p.status === 'Due Soon').length,
  overdue: state.players.filter((p) => p.status === 'Overdue').length,
});