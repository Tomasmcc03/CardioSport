import { Settings, Heart, Calendar, FileText, Activity, Users, TrendingUp, AlertCircle, DollarSign, LogOut, UserPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
 
type ScreenType = 'home' | 'bookTest' | 'appointments' | 'testHistory' | 'playerManagement' | 'clubReports' | 'healthTracking' | 'settings' | 'playerRequests' | 'addPlayer';
 
interface HomeScreenProps {
  username: string;
  userType: 'individual' | 'club';
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}
 
export function HomeScreen({ username, userType, onLogout, onNavigate }: HomeScreenProps) {
  if (userType === 'club') {
    return <ClubAdminHome username={username} onLogout={onLogout} onNavigate={onNavigate} />;
  }
  return <IndividualPlayerHome username={username} onLogout={onLogout} onNavigate={onNavigate} />;
}
 
// ── Individual Player Home ─────────────────────────────────────────────────────
 
function IndividualPlayerHome({ username, onLogout, onNavigate }: Omit<HomeScreenProps, 'userType'>) {
  const appointments = useAppStore((state) => state.appointments);
  const health = useAppStore((state) => state.health);
 
  const nextAppointment = appointments.find((a) => a.status === 'upcoming') ?? null;
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const completedTests = completedAppointments.length;
  const sortedCompleted = [...completedAppointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastTest = sortedCompleted.length > 0 ? sortedCompleted[0].date : 'N/A';
 
  const statusColor =
    health.overallStatus === 'Cleared'  ? 'bg-green-100 text-green-700' :
    health.overallStatus === 'Due Soon' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
 
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900 dark:text-white mb-1">Welcome Back {username}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Your Health Dashboard</p>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-600"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6 -mt-4">
 
        {/* Health Status Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Health Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
              {health.overallStatus}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-2xl p-4">
              <Heart className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">{health.restingHR} bpm</p>
              <p className="text-sm text-gray-500">Resting Heart Rate</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <Activity className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">{completedTests}</p>
              <p className="text-sm text-gray-500">Tests Completed</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Test:</span>
              <span className="text-gray-900">{lastTest}</span>
            </div>
          </div>
        </div>
 
        {/* Next Appointment Card */}
        {nextAppointment ? (
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white">Next Appointment</h2>
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-2xl mb-2">{nextAppointment.type}</p>
            <p className="text-red-100 mb-1">{nextAppointment.date} at {nextAppointment.time}</p>
            <p className="text-red-100 text-sm">{nextAppointment.location}</p>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('bookTest')}
            className="border-2 border-dashed border-red-200 rounded-3xl p-6 mb-6 text-center cursor-pointer active:bg-red-50 transition-colors"
          >
            <Calendar className="w-8 h-8 text-red-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
            <p className="text-red-500 text-sm mt-1">Tap to book a test</p>
          </div>
        )}
 
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-gray-900 dark:text-white mb-3 px-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('bookTest')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm">Book Test</p>
            </button>
 
            <button
              onClick={() => onNavigate('appointments')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm">Appointments</p>
            </button>
 
            <button
              onClick={() => onNavigate('testHistory')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm">Test History</p>
            </button>
 
            <button
              onClick={() => onNavigate('healthTracking')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm">Health Tracking</p>
            </button>
          </div>
        </div>
 
        {/* Recent Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6">
          <h3 className="text-gray-900 dark:text-white mb-4">Recent Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">All vitals within normal range</p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
              <p className="text-gray-600 dark:text-gray-300 text-sm">Remember to stay hydrated</p>
            </div>
          </div>
        </div>
 
        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl px-4 py-4 flex items-center justify-center active:bg-red-100 dark:active:bg-red-900/30"
        >
          <LogOut className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-600 dark:text-red-400">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
 
// ── Club Admin Home ────────────────────────────────────────────────────────────
 
function ClubAdminHome({ username, onLogout, onNavigate }: Omit<HomeScreenProps, 'userType'>) {
  const appointments = useAppStore((state) => state.appointments);
  const players = useAppStore((state) => state.players);
 
  const totalPlayers = players.length;
  const cleared = players.filter((p) => p.status === 'Cleared').length;
  const dueSoon = players.filter((p) => p.status === 'Due Soon').length;
  const overdue = players.filter((p) => p.status === 'Overdue').length;
  const upcomingTests = appointments.filter((a) => a.status === 'upcoming').length;
  const complianceRate = totalPlayers > 0 ? Math.round((cleared / totalPlayers) * 100) : 0;
 
  const urgentPlayers = players.filter((p) => p.status === 'Overdue' || p.status === 'Due Soon').slice(0, 3);
  // Only show requires attention section if there are urgent players
 
  const recentActivity = appointments
    .filter((a) => a.status === 'upcoming')
    .slice(0, 2)
    .map((a) => ({
      player: a.patient ?? 'Player',
      action: 'Test scheduled',
      time: `${a.date} at ${a.time}`,
    }));
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
 
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 to-pink-600">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white mb-1">Club Dashboard</h1>
              <p className="text-red-100">{username} Sports Club</p>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6 -mt-4">
 
        {/* Team Overview */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <h2 className="text-gray-900 mb-4">Team Overview</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl text-gray-900 mb-1">{totalPlayers}</p>
              <p className="text-sm text-gray-500">Total Players</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-green-600 mb-1">{cleared}</p>
              <p className="text-sm text-gray-500">Cleared</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-red-600 mb-1">{overdue}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Compliance Rate</p>
                <p className="text-xl text-gray-900">{complianceRate}%</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {/* Compliance progress bar */}
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>
        </div>
 
        {/* Requires Attention */}
        {urgentPlayers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-gray-900 mb-3 px-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              Requires Attention
            </h2>
            <div className="bg-white rounded-3xl overflow-hidden">
              {urgentPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`px-4 py-4 flex items-center justify-between ${
                    index !== urgentPlayers.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      player.status === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.status === 'Overdue' ? 'Test overdue' : 'Test due soon'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('bookTest')}
                    className="text-red-500 text-sm active:opacity-50"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-3 px-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('addPlayer')}
              className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-4 active:opacity-80 transition-opacity text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm">Add New Player</p>
              <p className="text-xs text-red-100 mt-1">Create account</p>
            </button>
 
            <button
              onClick={() => onNavigate('playerManagement')}
              className="bg-white rounded-3xl p-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-900 text-sm">Manage Players</p>
              <p className="text-xs text-gray-500 mt-1">{totalPlayers} players</p>
            </button>
 
            <button
              onClick={() => onNavigate('bookTest')}
              className="bg-white rounded-3xl p-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-900 text-sm">Book Tests</p>
              <p className="text-xs text-gray-500 mt-1">Bulk or individual</p>
            </button>
 
            <button
              onClick={() => onNavigate('appointments')}
              className="bg-white rounded-3xl p-4 active:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-900 text-sm">Appointments</p>
              <p className="text-xs text-gray-500 mt-1">{upcomingTests} upcoming</p>
            </button>
 
            <button
              onClick={() => onNavigate('clubReports')}
              className="bg-white rounded-3xl p-4 active:bg-gray-50 transition-colors col-span-2"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-900 text-sm">Reports</p>
              <p className="text-xs text-gray-500 mt-1">Analytics & exports</p>
            </button>
          </div>
        </div>
 
        {/* Monthly Budget */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Monthly Budget</h3>
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-3xl mb-2">€3,600</p>
          <p className="text-blue-100 text-sm mb-4">€2,400 spent • €1,200 remaining</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2" style={{ width: '66%' }} />
          </div>
        </div>
 
        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="mb-6">
            <h2 className="text-gray-900 dark:text-white mb-3 px-4">Recent Activity</h2>
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`px-4 py-4 flex items-center justify-between ${
                    index !== recentActivity.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                >
                  <div>
                    <p className="text-gray-900 dark:text-white">{activity.player}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* Sign Out */}
        <button
          onClick={onLogout}
          className="w-full py-4 bg-white text-red-500 rounded-2xl active:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}