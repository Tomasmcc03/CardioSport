import { ChevronLeft, Users, Plus, Heart, Calendar, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
 
interface PlayerManagementScreenProps {
  onBack: () => void;
  onNavigate?: (screen: 'addPlayer' | 'bookTest') => void;
}
 
export function PlayerManagementScreen({ onBack, onNavigate }: PlayerManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Cleared' | 'Due Soon' | 'Overdue'>('All');
  const [removingId, setRemovingId] = useState<number | null>(null);
 
  const players = useAppStore((state) => state.players);
  const removePlayer = useAppStore((state) => state.removePlayer);
 
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cleared':  return 'bg-green-100 text-green-700';
      case 'Due Soon': return 'bg-yellow-100 text-yellow-700';
      case 'Overdue':  return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };
 
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || player.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
 
  const totalPlayers = players.length;
  const clearedCount = players.filter((p) => p.status === 'Cleared').length;
  const dueSoonCount = players.filter((p) => p.status === 'Due Soon').length;
  const overdueCount = players.filter((p) => p.status === 'Overdue').length;
 
  const confirmRemove = async () => {
    if (removingId !== null) {
      const idToRemove = removingId;
      // Close modal and update Zustand immediately
      setRemovingId(null);
      removePlayer(idToRemove);
      // Delete from Supabase in background
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', idToRemove);
      if (error) {
        console.error('[CardioSport] Remove player error:', error.message);
      } else {
      }
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* GAA Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-32 -right-20 w-80 h-80 text-green-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="75" strokeWidth="2" />
          <path d="M 100 25 Q 118 100 100 175" strokeWidth="2" />
          <path d="M 100 25 Q 82 100 100 175" strokeWidth="2" />
          <path d="M 25 100 Q 100 118 175 100" strokeWidth="2" />
          <path d="M 25 100 Q 100 82 175 100" strokeWidth="2" />
        </svg>
        <svg className="absolute bottom-10 left-0 w-56 h-56 text-green-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <path d="M 60 180 L 80 40 M 80 40 Q 90 20 110 25 Q 130 30 140 50 L 150 80 Q 155 100 140 110 Q 125 120 110 110 L 80 40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="125" cy="70" rx="25" ry="35" strokeWidth="2" transform="rotate(-25 125 70)" />
        </svg>
      </div>
 
      {/* Remove confirmation modal */}
      {removingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-gray-900 text-lg mb-2">Remove Player</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove{' '}
              <span className="font-medium text-gray-900">
                {players.find((p) => p.id === removingId)?.name}
              </span>{' '}
              from the squad? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemovingId(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors"
              >
                Remove
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-gray-900">Player Management</h1>
            <button
              onClick={() => onNavigate?.('addPlayer')}
              className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
 
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search players or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
 
          {/* Status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['All', 'Cleared', 'Due Soon', 'Overdue'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {status}
                {status !== 'All' && (
                  <span className="ml-1 opacity-70">
                    ({status === 'Cleared' ? clearedCount : status === 'Due Soon' ? dueSoonCount : overdueCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
 
      {/* Content */}
      <div className="px-6 py-6">
 
        {/* Stats */}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 mb-6 text-white">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-2xl mb-1">{totalPlayers}</p>
              <p className="text-red-100 text-xs">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">{clearedCount}</p>
              <p className="text-red-100 text-xs">Cleared</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">{dueSoonCount}</p>
              <p className="text-red-100 text-xs">Due Soon</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">{overdueCount}</p>
              <p className="text-red-100 text-xs">Overdue</p>
            </div>
          </div>
        </div>
 
        {/* Results count */}
        <p className="text-sm text-gray-500 mb-3 px-1">
          {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
          {searchQuery || filterStatus !== 'All' ? ' found' : ' total'}
        </p>
 
        {/* Players List */}
        {filteredPlayers.length > 0 ? (
          <div className="space-y-3">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{player.name}</h3>
                      <p className="text-sm text-gray-500">
                        {player.position} • Age {player.age}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(player.status)}`}>
                    {player.status}
                  </span>
                </div>
 
                <div className="bg-gray-50 rounded-2xl p-3 mb-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Last Test</p>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        {player.lastTest}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Next Test</p>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        {player.nextTest}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tests Completed</span>
                      <span className="text-gray-900">{player.testsCompleted}</span>
                    </div>
                  </div>
                </div>
 
                <div className="flex gap-2">
                  <button
                    onClick={() => setRemovingId(player.id)}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center active:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="flex-1 py-2.5 bg-gray-50 text-gray-900 rounded-xl active:bg-gray-100 transition-colors text-sm">
                    View History
                  </button>
                  <button
                    onClick={() => onNavigate?.('bookTest')}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors flex items-center justify-center text-sm"
                  >
                    <Heart className="w-4 h-4 mr-1.5" />
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 mb-1">No players found</p>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try a different search term' : 'Add players to get started'}
            </p>
          </div>
        )}
 
        {/* Add player CTA */}
        <button
          onClick={() => onNavigate?.('addPlayer')}
          className="w-full mt-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 active:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Player
        </button>
      </div>
    </div>
  );
}