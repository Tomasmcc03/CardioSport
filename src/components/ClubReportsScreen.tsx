import { ChevronLeft, Download, TrendingUp, Users, DollarSign, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
 
interface ClubReportsScreenProps {
  onBack: () => void;
}
 
export function ClubReportsScreen({ onBack }: ClubReportsScreenProps) {
  const players = useAppStore((state) => state.players);
  const appointments = useAppStore((state) => state.appointments);
 
  // ── Derived stats from store ──────────────────────────────────────────────
  const totalPlayers = players.length;
  const clearedCount = players.filter((p) => p.status === 'Cleared').length;
  const overdueCount = players.filter((p) => p.status === 'Overdue').length;
  const dueSoonCount = players.filter((p) => p.status === 'Due Soon').length;
  const complianceRate = totalPlayers > 0
    ? Math.round((clearedCount / totalPlayers) * 100)
    : 0;
 
  const completedTests = appointments.filter((a) => a.status === 'completed');
  const upcomingTests  = appointments.filter((a) => a.status === 'upcoming');
  const totalTests     = completedTests.length;
 
  // Test type frequency from completed appointments
  const testTypeCounts: Record<string, number> = {};
  completedTests.forEach((a) => {
    testTypeCounts[a.type] = (testTypeCounts[a.type] ?? 0) + 1;
  });
  const mostPopularTest = Object.entries(testTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ECG Test';
 
  // Monthly chart data — derived from real appointment data grouped by month
  const monthlyData = (() => {
    const counts: Record<string, number> = {};
    completedTests.forEach((a) => {
      const date = new Date(a.date);
      if (!isNaN(date.getTime())) {
        const key = date.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' });
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([month, tests]) => ({ month, tests }))
      .slice(-6); // show last 6 months max
  })();
 
  // ── CSV export helpers ────────────────────────────────────────────────────
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  const exportCompliance = () => {
    const rows = [
      ['Name', 'Age', 'Position', 'Status', 'Last Test', 'Next Test', 'Tests Completed'],
      ...players.map((p) => [
        p.name, String(p.age), p.position, p.status,
        p.lastTest, p.nextTest, String(p.testsCompleted),
      ]),
    ];
    downloadCSV('CardioSport_Compliance_Report.csv', rows);
  };
 
  const exportFinancial = () => {
    const costPerTest = 225;
    const rows = [
      ['Test Type', 'Date', 'Location', 'Cost (€)'],
      ...completedTests.map((a) => [
        a.type, a.date, a.location, String(costPerTest),
      ]),
    ];
    downloadCSV('CardioSport_Financial_Summary.csv', rows);
  };
 
  const exportSchedule = () => {
    const rows = [
      ['Test Type', 'Date', 'Time', 'Location', 'Patient', 'Status'],
      ...appointments.map((a) => [
        a.type, a.date, a.time, a.location, a.patient ?? '', a.status,
      ]),
    ];
    downloadCSV('CardioSport_Test_Schedule.csv', rows);
  };
 
  const exportMedicalRecords = () => {
    const rows = [
      ['Test Type', 'Date', 'Time', 'Location', 'Result', 'Heart Rate', 'Doctor'],
      ...completedTests.map((a) => [
        a.type, a.date, a.time, a.location,
        a.result ?? 'N/A', a.heartRate ?? 'N/A', a.doctor ?? 'N/A',
      ]),
    ];
    downloadCSV('CardioSport_Medical_Records.csv', rows);
  };
 
  const reportTypes = [
    {
      name: 'Player Compliance Report',
      description: `${totalPlayers} players • ${complianceRate}% compliant`,
      icon: Users,
      onExport: exportCompliance,
    },
    {
      name: 'Financial Summary',
      description: `${totalTests} tests • €${totalTests * 225} total spend`,
      icon: DollarSign,
      onExport: exportFinancial,
    },
    {
      name: 'Test Schedule Report',
      description: `${upcomingTests.length} upcoming • ${overdueCount} overdue`,
      icon: Calendar,
      onExport: exportSchedule,
    },
    {
      name: 'Medical Records Export',
      description: `${totalTests} completed test records`,
      icon: FileText,
      onExport: exportMedicalRecords,
    },
  ];
 
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* GAA Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-60 -left-16 w-72 h-72 text-purple-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="70" strokeWidth="2" />
          <path d="M 100 30 Q 115 100 100 170" strokeWidth="2" />
          <path d="M 100 30 Q 85 100 100 170" strokeWidth="2" />
          <path d="M 30 100 Q 100 115 170 100" strokeWidth="2" />
          <path d="M 30 100 Q 100 85 170 100" strokeWidth="2" />
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
          <h1 className="text-gray-900">Reports & Analytics</h1>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6">
 
        {/* Key Metrics */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h2 className="text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4">
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">{totalTests}</p>
              <p className="text-sm text-gray-500">Total Tests (YTD)</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">{complianceRate}%</p>
              <p className="text-sm text-gray-500">Compliance Rate</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">€225</p>
              <p className="text-sm text-gray-500">Avg Cost/Test</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <Calendar className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-2xl text-gray-900 mb-1">{upcomingTests.length}</p>
              <p className="text-sm text-gray-500">Upcoming Tests</p>
            </div>
          </div>
        </div>
 
        {/* Monthly Trend — Recharts */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Monthly Test Volume</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
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
                formatter={(value: number) => [`${value} tests`, 'Volume']}
                cursor={{ fill: 'rgba(239,68,68,0.05)' }}
              />
              <Bar dataKey="tests" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Export Reports */}
        <div className="mb-6">
          <h2 className="text-gray-900 mb-3 px-1">Export Reports</h2>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {reportTypes.map((report, index) => (
              <div
                key={report.name}
                className={`px-4 py-4 ${
                  index !== reportTypes.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                      <report.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm">{report.name}</p>
                      <p className="text-xs text-gray-500 truncate">{report.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={report.onExport}
                    className="ml-3 px-3 py-2 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors flex items-center flex-shrink-0 text-sm"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Quick Insights */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white">
          <h3 className="text-white mb-3">Quick Insights</h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-100">• {overdueCount} {overdueCount === 1 ? 'player has' : 'players have'} overdue tests</p>
            <p className="text-blue-100">• {dueSoonCount} {dueSoonCount === 1 ? 'player' : 'players'} due for testing soon</p>
            <p className="text-blue-100">• Most booked test: {mostPopularTest}</p>
            <p className="text-blue-100">• Total squad compliance: {complianceRate}%</p>
            <p className="text-blue-100">• {upcomingTests.length} tests scheduled ahead</p>
          </div>
        </div>
      </div>
    </div>
  );
}