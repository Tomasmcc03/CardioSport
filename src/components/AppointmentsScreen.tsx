import { ChevronLeft, Calendar, MapPin, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
 
interface AppointmentsScreenProps {
  onBack: () => void;
  userType?: 'individual' | 'club';
}
 
export function AppointmentsScreen({ onBack, userType }: AppointmentsScreenProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
 
  const appointments = useAppStore((state) => state.appointments);
  const cancelAppointment = useAppStore((state) => state.cancelAppointment);
 
  const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');
  const pastAppointments = appointments.filter((a) => a.status === 'completed');
 
  const handleCancel = (id: number) => {
    setCancellingId(id);
  };
 
  const confirmCancel = async () => {
    if (cancellingId !== null) {
      const idToCancel = cancellingId;
      // Close modal and update Zustand immediately for instant UI response
      setCancellingId(null);
      cancelAppointment(idToCancel);
      // Update Supabase database in background
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', idToCancel);
      if (error) {
        console.error('[CardioSport] Cancel error:', error.message);
      } else {
      }
    }
  };
 
  const dismissCancel = () => {
    setCancellingId(null);
  };
 
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
 
      {/* GAA Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-40 right-5 w-48 h-48 text-blue-50 opacity-20" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="65" strokeWidth="2" />
          <path d="M 100 35 Q 112 100 100 165" strokeWidth="2" />
          <path d="M 100 35 Q 88 100 100 165" strokeWidth="2" />
        </svg>
      </div>
 
      {/* Cancel confirmation modal */}
      {cancellingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-gray-900 text-lg mb-2">Cancel Appointment</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={dismissCancel}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors"
              >
                Keep It
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
 
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
          <h1 className="text-gray-900 mb-4">Appointments</h1>
 
          {/* Tabs */}
          <div className="bg-gray-100 rounded-xl p-1 flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Upcoming
              {upcomingAppointments.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {upcomingAppointments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'past'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6">
 
        {/* Upcoming tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-3xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-900">{appointment.type}</h3>
                      {appointment.patient && userType === 'club' && (
                        <p className="text-sm text-gray-500 mt-0.5">{appointment.patient}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center active:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
 
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {appointment.time}
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p>{appointment.location}</p>
                        <p className="text-gray-500">{appointment.address}</p>
                      </div>
                    </div>
                  </div>
 
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                    <button className="flex-1 py-2.5 bg-gray-50 text-gray-900 rounded-xl active:bg-gray-100 transition-colors">
                      Reschedule
                    </button>
                    <button className="flex-1 py-2.5 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 mb-1">No upcoming appointments</p>
                <p className="text-gray-500 text-sm">Book a cardiac test to get started</p>
              </div>
            )}
          </div>
        )}
 
        {/* Past tab */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-3xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-900">{appointment.type}</h3>
                      {appointment.doctor && (
                        <p className="text-sm text-gray-500 mt-0.5">{appointment.doctor}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      appointment.result === 'Normal'
                        ? 'bg-green-100 text-green-700'
                        : appointment.result === 'Abnormal'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {appointment.result ?? 'Completed'}
                    </span>
                  </div>
 
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {appointment.location}
                    </div>
                    {appointment.heartRate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-4 h-4 mr-2 text-gray-400 text-center">♥</span>
                        {appointment.heartRate}
                      </div>
                    )}
                  </div>
 
                  <button className="w-full mt-4 py-2.5 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors">
                    View Report
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 mb-1">No past appointments</p>
                <p className="text-gray-500 text-sm">Completed tests will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}