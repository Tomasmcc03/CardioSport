import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { BookTestScreen } from './components/BookTestScreen';
import { AppointmentsScreen } from './components/AppointmentsScreen';
import { TestHistoryScreen } from './components/TestHistoryScreen';
import { PlayerManagementScreen } from './components/PlayerManagementScreen';
import { ClubReportsScreen } from './components/ClubReportsScreen';
import { HealthTrackingScreen } from './components/HealthTrackingScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PlayerRequestsScreen } from './components/PlayerRequestsScreen';
import { AddPlayerScreen } from './components/AddPlayerScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { useAppStore } from './store/useAppStore';

type ScreenType =
  | 'home'
  | 'bookTest'
  | 'appointments'
  | 'testHistory'
  | 'playerManagement'
  | 'clubReports'
  | 'healthTracking'
  | 'settings'
  | 'playerRequests'
  | 'addPlayer';

export default function App() {
  const { user, login, logout, updateProfile } = useAppStore();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const suppressNavigation = useRef(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const isRecovery = hash && (hash.includes('type=recovery') || hash.includes('access_token'));

    if (!isRecovery) {
      // Normal load — clear session so user always starts at login screen
      localStorage.clear();
      supabase.auth.signOut().catch(() => {});
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowResetPassword(true);
          return;
        } else if (event === 'INITIAL_SESSION' && session?.user && isRecovery) {
          // Recovery flow — session established from reset token
          setShowResetPassword(true);
          return;
        } else if (event === 'SIGNED_IN' && session?.user && !isRecovery) {
          if (suppressNavigation.current) return;
          if (isLoggedIn) return;
          setShowResetPassword(false);
          await loadUserProfile(session.user.id);
          setIsLoggedIn(true);
        } else if (event === 'SIGNED_OUT' && !isRecovery) {
          setIsLoggedIn(false);
          setCurrentScreen('home');
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the user's profile from Supabase and load into Zustand store
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, email, phone, bio, user_type')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[CardioSport] Profile error:', error.message);
        return;
      }

      if (profile) {
        setCurrentUserId(userId);
        login(
          profile.username ?? 'User',
          (profile.user_type ?? 'individual') as 'individual' | 'club'
        );
        updateProfile({
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          bio: profile.bio ?? '',
        });
        // Load appointments from Supabase
        await loadAppointments(userId);
        // Load players from Supabase for club accounts
        if (profile.user_type === 'club') {
          await loadPlayers(userId);
        }
      }
    } catch (err) {
      console.error('[CardioSport] Unexpected profile error:', err);
    }
  };

  // Fetch players from Supabase and load into Zustand store (club accounts only)
  const loadPlayers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[CardioSport] Players load error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const players = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          age: row.age ?? 0,
          position: row.position ?? 'Unassigned',
          lastTest: row.last_test ?? 'Not yet tested',
          nextTest: row.next_test ?? 'Not scheduled',
          status: row.status ?? 'Due Soon',
          testsCompleted: row.tests_completed ?? 0,
        }));
        useAppStore.setState({ players });
      } else {
        useAppStore.setState({ players: [] });
      }
    } catch (err) {
      console.error('[CardioSport] Players load error:', err);
    }
  };

  // Parse a date string like "6 May 2026" into a Date object
  const parseAppointmentDate = (dateStr: string): Date | null => {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  // Fetch appointments from Supabase and load into Zustand store.
  // Automatically marks past upcoming appointments as completed.
  const loadAppointments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[CardioSport] Appointments load error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check each upcoming appointment — if its date is in the past, mark as completed
        const toUpdate: string[] = [];
        const appointments = data.map((row: any) => {
          let status = row.status;
          if (status === 'upcoming') {
            const apptDate = parseAppointmentDate(row.date);
            if (apptDate && apptDate < today) {
              status = 'completed';
              toUpdate.push(row.id);
            }
          }
          return {
            id: row.id,
            type: row.type,
            date: row.date,
            time: row.time,
            location: row.location,
            address: row.address ?? '',
            status,
            result: row.result ?? undefined,
            heartRate: row.heart_rate ?? undefined,
            doctor: row.doctor ?? undefined,
            patient: row.patient ?? undefined,
          };
        });

        // Update past appointments in Supabase in the background
        if (toUpdate.length > 0) {
          await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .in('id', toUpdate);
        }

        useAppStore.setState({ appointments });
      } else {
        useAppStore.setState({ appointments: [] });
      }
    } catch (err) {
      console.error('[CardioSport] Appointments error:', err);
    }
  };

  // Reset state immediately then sign out from Supabase.
  // Clear all localStorage to prevent stale session conflicts on next sign in.
  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentScreen('home');
    setCurrentUserId(null);
    logout();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[CardioSport] Sign out error:', err);
    }
    // Wait for Supabase to finish cleanup before clearing storage
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.clear();
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };



  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Loading CardioSport...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {showResetPassword ? (
          <ResetPasswordScreen onDone={() => { setShowResetPassword(false); }} />
        ) : !isLoggedIn ? (
          <LoginScreen suppressNavigation={suppressNavigation} />
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                onNavigate={handleNavigate}
                userType={user.userType}
                username={user.username}
                onLogout={handleLogout}
              />
            )}
            {currentScreen === 'bookTest' && (
              <BookTestScreen
                onBack={() => setCurrentScreen('home')}
                userType={user.userType}
                userId={currentUserId}
              />
            )}
            {currentScreen === 'appointments' && (
              <AppointmentsScreen
                onBack={() => setCurrentScreen('home')}
                userType={user.userType}
              />
            )}
            {currentScreen === 'testHistory' && (
              <TestHistoryScreen onBack={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'playerManagement' && user.userType === 'club' && (
              <PlayerManagementScreen
                onBack={() => setCurrentScreen('home')}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}
            {currentScreen === 'clubReports' && user.userType === 'club' && (
              <ClubReportsScreen onBack={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'playerRequests' && user.userType === 'club' && (
              <PlayerRequestsScreen onBack={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'healthTracking' && user.userType === 'individual' && (
              <HealthTrackingScreen onBack={() => setCurrentScreen('home')} />
            )}
            {currentScreen === 'settings' && (
              <SettingsScreen
                onBack={() => setCurrentScreen('home')}
                onLogout={handleLogout}
                username={user.username}
                setUsername={(val) => updateProfile({ username: val })}
                email={user.email}
                setEmail={(val) => updateProfile({ email: val })}
                phone={user.phone}
                setPhone={(val) => updateProfile({ phone: val })}
                club={user.bio}
              />
            )}
            {currentScreen === 'addPlayer' && (
              <AddPlayerScreen onBack={() => setCurrentScreen('home')} userId={currentUserId} />
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}