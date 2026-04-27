import { ChevronLeft, Heart, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
 
interface HealthTrackingScreenProps {
  onBack: () => void;
}
 
export function HealthTrackingScreen({ onBack }: HealthTrackingScreenProps) {
  const health = useAppStore((state) => state.health);
 
  const {
    restingHR,
    maxHR,
    avgHR,
    hrVariability,
    weeklyData,
    nextDue,
    overallStatus,
  } = health;
 
  const statusColor =
    overallStatus === 'Cleared'  ? 'text-green-600' :
    overallStatus === 'Due Soon' ? 'text-yellow-600' :
    'text-red-600';
 
  const recommendationText =
    overallStatus === 'Cleared'
      ? 'Your cardiac health looks great. Keep up your current routine.'
      : overallStatus === 'Due Soon'
      ? 'Your next cardiac screening is coming up. Book a test soon.'
      : 'Your cardiac test is overdue. Please book a screening immediately.';
 
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* GAA Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-20 right-0 w-56 h-56 text-red-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="70" strokeWidth="2" />
          <path d="M 100 30 Q 115 100 100 170" strokeWidth="2" />
          <path d="M 100 30 Q 85 100 100 170" strokeWidth="2" />
        </svg>
        <svg className="absolute bottom-40 -left-10 w-64 h-64 text-red-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <path d="M 60 180 L 80 40 M 80 40 Q 90 20 110 25 Q 130 30 140 50 L 150 80 Q 155 100 140 110 Q 125 120 110 110 L 80 40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="125" cy="70" rx="25" ry="35" strokeWidth="2" transform="rotate(-25 125 70)" />
        </svg>
      </div>
 
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-12 pb-4">
          <button
            onClick={onBack}
            className="flex items-center text-red-500 mb-4 active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">Health Tracking</h1>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6">
 
        {/* Current Status */}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Current Status</h2>
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-4xl mb-1">{restingHR}</p>
              <p className="text-red-100 text-sm">Resting HR (bpm)</p>
            </div>
            <div>
              <p className="text-4xl mb-1">{hrVariability}</p>
              <p className="text-red-100 text-sm">HRV (ms)</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <p className="text-red-100 text-sm">Overall Status</p>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                {overallStatus}
              </span>
            </div>
          </div>
        </div>
 
        {/* Weekly Trend — Recharts */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            7-Day Heart Rate
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[60, 80]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value} bpm`, 'Heart Rate']}
                cursor={{ fill: 'rgba(239,68,68,0.05)' }}
              />
              <Bar
                dataKey="hr"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Vital Statistics */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-1">Vital Statistics</h3>
          <p className="text-xs text-gray-400 mb-4">Data shown is illustrative. Connect a wearable device for live readings.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900">Average HR</p>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
              </div>
              <p className="text-xl text-gray-900">{avgHR} bpm</p>
            </div>
 
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900">Max HR</p>
                  <p className="text-sm text-gray-500">During exercise</p>
                </div>
              </div>
              <p className="text-xl text-gray-900">{maxHR} bpm</p>
            </div>
 
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900">HRV</p>
                  <p className="text-sm text-gray-500">Heart rate variability</p>
                </div>
              </div>
              <p className="text-xl text-gray-900">{hrVariability} ms</p>
            </div>
          </div>
        </div>
 
        {/* Recommendations */}
        <div className={`rounded-3xl p-6 border ${
          overallStatus === 'Cleared'
            ? 'bg-blue-50 border-blue-200'
            : overallStatus === 'Due Soon'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`mb-3 ${
            overallStatus === 'Cleared'   ? 'text-blue-900' :
            overallStatus === 'Due Soon'  ? 'text-yellow-900' :
            'text-red-900'
          }`}>
            Recommendations
          </h3>
          <p className="text-xs opacity-60 mb-3">These recommendations are illustrative. Always consult a medical professional for clinical advice.</p>
          <div className={`space-y-2 text-sm ${
            overallStatus === 'Cleared'   ? 'text-blue-700' :
            overallStatus === 'Due Soon'  ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            <p>• {recommendationText}</p>
            <p>• Your heart rate is within normal range</p>
            <p>• HRV indicates good recovery</p>
            <p>• Continue regular monitoring</p>
            <p>• Next cardiac screening due: {nextDue}</p>
          </div>
        </div>
 
      </div>
    </div>
  );
}