import { ChevronLeft, CheckCircle, XCircle, Clock, Calendar, MapPin, Inbox } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
 
interface PlayerRequestsScreenProps {
  onBack: () => void;
}
 
type RequestStatus = 'pending' | 'approved' | 'rejected';
 
interface PaymentRequest {
  id: number;
  playerName: string;
  position: string;
  testType: string;
  location: string;
  address: string;
  date: string;
  time: string;
  cost: string;
  status: RequestStatus;
  requestedDate: string;
}
 
export function PlayerRequestsScreen({ onBack }: PlayerRequestsScreenProps) {
  const addAppointment = useAppStore((state) => state.addAppointment);
  const players = useAppStore((state) => state.players);
 
  // Requests live in local state — these represent payment approval requests
  // submitted by players during the booking flow. In production these would
  // come from a backend. For now we seed from the first 3 store players.
  const seedRequests = (): PaymentRequest[] => {
    const base = [
      {
        testType: 'ECG Test',
        location: 'CardioSport Clinic - Dublin',
        address: 'Croke Park, Jones Road, Dublin 3',
        date: 'December 15, 2025',
        time: '10:00 AM',
        cost: '€150',
        requestedDate: '2 hours ago',
      },
      {
        testType: 'Stress Test',
        location: 'CardioSport Clinic - Cork',
        address: 'Páirc Uí Chaoimh, Marina, Cork',
        date: 'December 18, 2025',
        time: '2:00 PM',
        cost: '€300',
        requestedDate: '5 hours ago',
      },
      {
        testType: 'Echocardiogram',
        location: 'CardioSport Clinic - Galway',
        address: 'Pearse Stadium, Salthill, Galway',
        date: 'December 20, 2025',
        time: '11:00 AM',
        cost: '€400',
        requestedDate: '1 day ago',
      },
    ];
 
    return base.map((b, i) => {
      const player = players[i] ?? { name: `Player ${i + 1}`, position: 'Midfielder' };
      return {
        id: i + 1,
        playerName: player.name,
        position: player.position,
        status: 'pending' as RequestStatus,
        ...b,
      };
    });
  };
 
  const [requests, setRequests] = useState<PaymentRequest[]>(seedRequests);
  const [activeTab, setActiveTab] = useState<'pending' | 'actioned'>('pending');
 
  const pendingRequests  = requests.filter((r) => r.status === 'pending');
  const actionedRequests = requests.filter((r) => r.status !== 'pending');
 
  const handleApprove = (id: number) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;
 
    // Write the approved booking into the shared appointments store
    addAppointment({
      type:     request.testType,
      date:     request.date,
      time:     request.time,
      location: request.location,
      address:  request.address,
      patient:  request.playerName,
    });
 
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r)
    );
  };
 
  const handleReject = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r)
    );
  };
 
  const displayList = activeTab === 'pending' ? pendingRequests : actionedRequests;
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
 
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 pt-12 pb-4">
          <button
            onClick={onBack}
            className="flex items-center text-red-500 dark:text-red-400 mb-4 active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900 dark:text-white mb-1">Player Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review and approve player payment requests</p>
 
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex mt-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Pending
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('actioned')}
              className={`flex-1 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === 'actioned'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Actioned
              {actionedRequests.length > 0 && (
                <span className="ml-2 bg-gray-400 text-white text-xs rounded-full px-1.5 py-0.5">
                  {actionedRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
 
      {/* Request List */}
      <div className="px-6 py-6 space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white mb-1">
              {activeTab === 'pending' ? 'No pending requests' : 'No actioned requests yet'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {activeTab === 'pending'
                ? 'Player payment requests will appear here'
                : 'Approved and rejected requests appear here'}
            </p>
          </div>
        ) : (
          displayList.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm">
 
              {/* Player Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-1">{request.playerName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{request.position}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status === 'approved' ? 'Approved'
                      : request.status === 'rejected' ? 'Rejected'
                      : 'Pending'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{request.requestedDate}</p>
                </div>
              </div>
 
              {/* Test Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-white">{request.testType}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {request.date} at {request.time}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{request.location}</span>
                </div>
              </div>
 
              {/* Cost */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Cost to club</span>
                <span className="text-xl text-gray-900 dark:text-white">{request.cost}</span>
              </div>
 
              {/* Action Buttons — only show for pending */}
              {request.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl active:bg-gray-200 dark:active:bg-gray-600 flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl active:bg-green-600 flex items-center justify-center transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve
                  </button>
                </div>
              ) : (
                <div className={`w-full py-3 rounded-xl flex items-center justify-center text-sm ${
                  request.status === 'approved'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {request.status === 'approved'
                    ? <><CheckCircle className="w-4 h-4 mr-2" /> Booking confirmed and added to schedule</>
                    : <><XCircle className="w-4 h-4 mr-2" /> Request rejected</>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
 