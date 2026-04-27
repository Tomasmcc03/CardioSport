import { useState } from 'react';
import { ArrowLeft, UserPlus, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
 
interface AddPlayerScreenProps {
  onBack: () => void;
  userId: string | null;
}
 
export function AddPlayerScreen({ onBack, userId }: AddPlayerScreenProps) {
  const addPlayer = useAppStore((state) => state.addPlayer);
 
  const [playerData, setPlayerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    phoneCode: '+353',
    dateOfBirth: '',
    position: '',
    address: '',
    city: '',
    county: '',
    emergencyName: '',
    emergencyPhone: '',
    bloodType: '',
    medicalConditions: '',
    allergies: '',
  });
 
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
 
  const gaaPositions = [
    'Goalkeeper', 'Full-back', 'Corner-back', 'Wing-back', 'Centre-back',
    'Midfielder', 'Centre-forward', 'Wing-forward', 'Corner-forward', 'Full-forward',
  ];
 
  const irishCounties = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal',
    'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
    'Laois', 'Leitrim', 'Limerick', 'Derry', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
  ];
 
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
 
  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 18;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CardioSport] handleSubmit called');
 
    const today = new Date();
    const nextTestDate = new Date(today);
    nextTestDate.setMonth(nextTestDate.getMonth() + 3);
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });

    const playerPayload = {
      name: playerData.fullName,
      age: calculateAge(playerData.dateOfBirth),
      position: playerData.position || 'Unassigned',
      lastTest: 'Not yet tested',
      nextTest: formatDate(nextTestDate),
      status: 'Due Soon' as const,
      testsCompleted: 0,
    };
 
    // Write to Zustand store for instant UI update
    addPlayer(playerPayload);

    // Write to Supabase players table using userId passed from App.tsx
    if (userId) {
      const { error } = await supabase.from('players').insert({
        club_id: userId,
        name: playerPayload.name,
        age: playerPayload.age,
        position: playerPayload.position,
        last_test: playerPayload.lastTest,
        next_test: playerPayload.nextTest,
        status: playerPayload.status,
        tests_completed: playerPayload.testsCompleted,
        email: playerData.email,
        phone: `${playerData.phoneCode} ${playerData.phone}`,
        address: playerData.address,
        city: playerData.city,
        county: playerData.county,
        emergency_name: playerData.emergencyName,
        emergency_phone: playerData.emergencyPhone,
        blood_type: playerData.bloodType,
        medical_conditions: playerData.medicalConditions,
        allergies: playerData.allergies,
      });
      if (error) {
        console.error('[CardioSport] Add player error:', error.message);
      } else {
        console.log('[CardioSport] Player saved to Supabase');
      }
    }
 
    // Save submitted values before resetting form
    setSubmittedName(playerData.fullName);
    setSubmittedEmail(playerData.email);
    setShowSuccess(true);
 
    // Reset form
    setPlayerData({
      fullName: '',
      email: '',
      phone: '',
      phoneCode: '+353',
      dateOfBirth: '',
      position: '',
      address: '',
      city: '',
      county: '',
      emergencyName: '',
      emergencyPhone: '',
      bloodType: '',
      medicalConditions: '',
      allergies: '',
    });
  };
 
  const handleInputChange = (field: string, value: string) => {
    setPlayerData((prev) => ({ ...prev, [field]: value }));
  };
 
  const inputClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors';
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
 
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 to-pink-600 px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4 active:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white mb-1">Add New Player</h1>
            <p className="text-red-100 text-sm">Create a player account</p>
          </div>
        </div>
      </div>
 
      {/* Form */}
      <div className="px-6 py-6 -mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
 
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6">
            <h2 className="text-gray-900 dark:text-white mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-red-600" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={playerData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g., Cian Murphy"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={playerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="player@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone Number *</label>
                <div className="flex gap-2">
                  <select value={playerData.phoneCode} onChange={(e) => handleInputChange('phoneCode', e.target.value)} className="px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors">
                    <option value="+353">🇮🇪 +353</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={playerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="87 123 4567"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={playerData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">GAA Position *</label>
                <select
                  required
                  value={playerData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Position</option>
                  {gaaPositions.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
 
          {/* Address */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Street Address</label>
                <input
                  type="text"
                  value={playerData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">City/Town</label>
                  <input
                    type="text"
                    value={playerData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Dublin"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">County</label>
                  <select
                    value={playerData.county}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select County</option>
                    {irishCounties.map((county) => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
 
          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={playerData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  placeholder="e.g., Mary Murphy"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Contact Phone *</label>
                <div className="flex gap-2">
                  <select value={playerData.phoneCode} onChange={(e) => handleInputChange('phoneCode', e.target.value)} className="px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors">
                    <option value="+353">🇮🇪 +353</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={playerData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="87 987 6543"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
 
          {/* Medical Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6">
            <h3 className="text-gray-900 dark:text-white mb-2">Medical Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Optional but recommended</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Blood Type</label>
                <select
                  value={playerData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Known Medical Conditions</label>
                <textarea
                  value={playerData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  placeholder="List any known medical conditions"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Allergies</label>
                <textarea
                  value={playerData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
 
          {/* Submit */}
          <div className="space-y-3 pb-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl active:opacity-80 transition-opacity flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Player Account
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 rounded-xl active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
 
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white text-center mb-2">
              {submittedName} Added!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6">
              {submittedName} has been added to your squad successfully.
            </p>
            <button
              onClick={() => { setShowSuccess(false); onBack(); }}
              className="w-full py-3 bg-red-500 text-white rounded-xl active:bg-red-600 transition-colors"
            >
              Back to Squad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}