import { useState } from 'react';
import { ChevronLeft, Calendar, MapPin, Users, Heart, Clock, CheckCircle, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';

interface BookTestScreenProps {
  userType: 'individual' | 'club';
  onBack: () => void;
  userId: string | null;
}

export function BookTestScreen({ userType, onBack, userId }: BookTestScreenProps) {
  const { addAppointment, players, updatePlayerStatus } = useAppStore();

  const [bookingMode, setBookingMode] = useState<'single' | 'bulk'>('single');
  const [step, setStep] = useState(1);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [requestClubPayment, setRequestClubPayment] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const testTypes = [
    { id: 'ecg',    name: 'ECG Test',          duration: '30 mins',  description: 'Standard electrocardiogram' },
    { id: 'stress', name: 'Stress Test',        duration: '60 mins',  description: 'Exercise stress test' },
    { id: 'echo',   name: 'Echocardiogram',     duration: '45 mins',  description: 'Heart ultrasound' },
    { id: 'holter', name: '24h Holter Monitor', duration: '24 hours', description: 'Extended monitoring' },
  ];

  const locations = [
    { id: '1', name: 'CardioSport Clinic - Dublin', address: 'Croke Park, Jones Road, Dublin 3' },
    { id: '2', name: 'CardioSport Clinic - Cork',   address: 'Páirc Uí Chaoimh, Marina, Cork' },
    { id: '3', name: 'CardioSport Clinic - Galway', address: 'Pearse Stadium, Salthill, Galway' },
  ];

  // Generate the next 14 available weekdays starting from tomorrow
  const availableDates = (() => {
    const dates: string[] = [];
    const date = new Date();
    date.setDate(date.getDate() + 1); // start from tomorrow
    while (dates.length < 14) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) { // skip weekends
        dates.push(date.toLocaleDateString('en-IE', {
          day: 'numeric', month: 'long', year: 'numeric'
        }));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  })();

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM',
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getTestName   = () => testTypes.find(t => t.id === selectedTest)?.name ?? '';
  const getLocation   = () => locations.find(l => l.id === selectedLocation);

  // ── Confirmation screen ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const locationObj = getLocation();
    if (!locationObj) {
      console.error('[CardioSport] No location found — booking aborted');
      return;
    }

    // userId is passed as prop from App.tsx — no auth call needed here

    // Show confirmation screen immediately
    setBookingConfirmed(true);

    if (userType === 'club' && bookingMode === 'bulk') {
      // Add one appointment per selected player in background
      for (const playerId of selectedPlayers) {
        const player = players.find(p => String(p.id) === playerId);
        const appointmentData = {
          type:     getTestName(),
          date:     selectedDate,
          time:     selectedTime,
          location: locationObj.name,
          address:  locationObj.address,
          patient:  player?.name ?? 'Club Player',
        };
        addAppointment(appointmentData);
        if (userId) {
          await supabase.from('appointments').insert({
            user_id:  userId,
            type:     appointmentData.type,
            date:     appointmentData.date,
            time:     appointmentData.time,
            location: appointmentData.location,
            address:  appointmentData.address,
            patient:  appointmentData.patient,
            status:   'upcoming',
          });
          await supabase
            .from('players')
            .update({ status: 'Cleared' })
            .eq('id', Number(playerId));
          updatePlayerStatus(Number(playerId), 'Cleared');
        }
      }
    } else {
      const appointmentData = {
        type:     getTestName(),
        date:     selectedDate,
        time:     selectedTime,
        location: locationObj.name,
        address:  locationObj.address,
        patient:  'Player',
      };
      addAppointment(appointmentData);
      if (userId) {
        const { error } = await supabase.from('appointments').insert({
          user_id:  userId,
          type:     appointmentData.type,
          date:     appointmentData.date,
          time:     appointmentData.time,
          location: appointmentData.location,
          address:  appointmentData.address,
          patient:  appointmentData.patient,
          status:   'upcoming',
        });
        if (error) {
          console.error('[CardioSport] Appointment save error:', error.message);
        }
        if (userType === 'club' && selectedPlayers.length === 1) {
          await supabase
            .from('players')
            .update({ status: 'Cleared' })
            .eq('id', Number(selectedPlayers[0]));
          updatePlayerStatus(Number(selectedPlayers[0]), 'Cleared');
        }
      }
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // ── Success screen ─────────────────────────────────────────────────────────

  if (bookingConfirmed) {
    const locationObj = getLocation();
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-gray-900 text-2xl mb-2 text-center">Booking Confirmed!</h1>
        <p className="text-gray-500 text-center mb-8">
          {userType === 'club' && bookingMode === 'bulk'
            ? `${selectedPlayers.length} appointments have been booked.`
            : 'Your appointment has been booked successfully.'}
        </p>

        <div className="w-full bg-white rounded-3xl p-6 mb-8 shadow-sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Test</span>
              <span className="text-gray-900">{getTestName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900 text-right max-w-[60%]">{locationObj?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-900">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="text-gray-900">{selectedTime}</span>
            </div>
            {userType === 'club' && bookingMode === 'bulk' && (
              <div className="flex justify-between">
                <span className="text-gray-500">Players</span>
                <span className="text-gray-900">{selectedPlayers.length} booked</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ── Club booking view ──────────────────────────────────────────────────────

  if (userType === 'club') {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-20 right-0 w-56 h-56 text-red-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="70" strokeWidth="2" />
            <path d="M 100 30 Q 115 100 100 170" strokeWidth="2" />
            <path d="M 100 30 Q 85 100 100 170" strokeWidth="2" />
            <path d="M 30 100 Q 100 115 170 100" strokeWidth="2" />
          </svg>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 pt-12 pb-4">
            <button onClick={onBack} className="flex items-center text-red-500 mb-4 active:opacity-50 transition-opacity">
              <ChevronLeft className="w-6 h-6 mr-1" />
              <span>Back</span>
            </button>
            <h1 className="text-gray-900 mb-4">Book Cardiac Tests</h1>

            {/* Mode toggle */}
            <div className="bg-gray-100 rounded-xl p-1 flex mb-4">
              <button
                onClick={() => { setBookingMode('single'); setStep(1); }}
                className={`flex-1 py-2.5 rounded-lg transition-all ${bookingMode === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Single Player
              </button>
              <button
                onClick={() => { setBookingMode('bulk'); setStep(1); }}
                className={`flex-1 py-2.5 rounded-lg transition-all ${bookingMode === 'bulk' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Bulk Booking
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {([1, 2, 3, bookingMode === 'bulk' ? 4 : null] as (number | null)[])
                .filter((s): s is number => s !== null)
                .map((s) => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-red-500' : 'bg-gray-200'}`} />
                ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-6">
          {/* Bulk step 1 — player selection */}
          {bookingMode === 'bulk' && step === 1 && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Select multiple players to book tests for them at the same time and location.
                </p>
              </div>

              <h2 className="text-gray-900 mb-4">Select Players ({selectedPlayers.length} selected)</h2>
              <div className="space-y-3 mb-6">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => togglePlayerSelection(String(player.id))}
                    className={`w-full p-4 rounded-3xl border-2 transition-all ${
                      selectedPlayers.includes(String(player.id))
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          selectedPlayers.includes(String(player.id)) ? 'bg-red-500' : 'bg-gray-100'
                        }`}>
                          {selectedPlayers.includes(String(player.id))
                            ? <CheckCircle className="w-5 h-5 text-white" />
                            : <Users className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div className="text-left">
                          <p className="text-gray-900">{player.name}</p>
                          <p className="text-sm text-gray-500">{player.position}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        player.status === 'Overdue'  ? 'bg-red-100 text-red-700' :
                        player.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {player.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={selectedPlayers.length === 0}
                className="w-full py-3.5 bg-red-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
              >
                Continue ({selectedPlayers.length} players)
              </button>
            </div>
          )}

          {/* Test type step */}
          {((bookingMode === 'single' && step === 1) || (bookingMode === 'bulk' && step === 2)) && (
            <SinglePlayerBookingStep1
              testTypes={testTypes}
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
              onContinue={() => setStep(bookingMode === 'bulk' ? 3 : 2)}
              onBack={() => bookingMode === 'bulk' ? setStep(1) : onBack()}
              showBackButton={bookingMode === 'bulk'}
            />
          )}

          {/* Location step */}
          {((bookingMode === 'single' && step === 2) || (bookingMode === 'bulk' && step === 3)) && (
            <LocationStep
              locations={locations}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              onContinue={() => setStep(bookingMode === 'bulk' ? 4 : 3)}
              onBack={() => setStep(bookingMode === 'bulk' ? 2 : 1)}
            />
          )}

          {/* Date & time step */}
          {((bookingMode === 'single' && step === 3) || (bookingMode === 'bulk' && step === 4)) && (
            <DateTimeStep
              availableDates={availableDates}
              availableTimes={availableTimes}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setSelectedDate={setSelectedDate}
              setSelectedTime={setSelectedTime}
              onSubmit={handleSubmit}
              onBack={() => setStep(bookingMode === 'bulk' ? 3 : 2)}
              requestClubPayment={requestClubPayment}
              setRequestClubPayment={setRequestClubPayment}
              showPaymentOption={false}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Individual player booking view ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-20 -left-10 w-64 h-64 text-red-50 opacity-15" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <path d="M 60 180 L 80 40 M 80 40 Q 90 20 110 25 Q 130 30 140 50 L 150 80 Q 155 100 140 110 Q 125 120 110 110 L 80 40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="125" cy="70" rx="25" ry="35" strokeWidth="2" transform="rotate(-25 125 70)" />
        </svg>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 pt-12 pb-4">
          <button onClick={onBack} className="flex items-center text-red-500 mb-4 active:opacity-50 transition-opacity">
            <ChevronLeft className="w-6 h-6 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">Book Your Cardiac Test</h1>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-red-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {step === 1 && (
          <SinglePlayerBookingStep1
            testTypes={testTypes}
            selectedTest={selectedTest}
            setSelectedTest={setSelectedTest}
            onContinue={() => setStep(2)}
            onBack={onBack}
            showBackButton={false}
          />
        )}

        {step === 2 && (
          <LocationStep
            locations={locations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <DateTimeStep
            availableDates={availableDates}
            availableTimes={availableTimes}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            requestClubPayment={requestClubPayment}
            setRequestClubPayment={setRequestClubPayment}
            showPaymentOption={false}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SinglePlayerBookingStep1({ testTypes, selectedTest, setSelectedTest, onContinue, onBack, showBackButton }: {
  testTypes: { id: string; name: string; duration: string; description: string }[];
  selectedTest: string;
  setSelectedTest: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  showBackButton: boolean;
}) {
  return (
    <div>
      <h2 className="text-gray-900 mb-4">Select Test Type</h2>
      <div className="space-y-3">
        {testTypes.map((test) => (
          <button
            key={test.id}
            onClick={() => setSelectedTest(test.id)}
            className={`w-full p-4 rounded-3xl border-2 transition-all ${
              selectedTest === test.id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                selectedTest === test.id ? 'bg-red-500' : 'bg-gray-100'
              }`}>
                <Heart className={`w-5 h-5 ${selectedTest === test.id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 mb-1">{test.name}</p>
                <p className="text-sm text-gray-500 mb-2">{test.description}</p>
                <span className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {test.duration}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showBackButton ? (
        <div className="flex gap-3 mt-6">
          <button onClick={onBack} className="flex-1 py-3.5 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors">
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!selectedTest}
            className="flex-1 py-3.5 bg-red-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      ) : (
        <button
          onClick={onContinue}
          disabled={!selectedTest}
          className="w-full mt-6 py-3.5 bg-red-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
        >
          Continue
        </button>
      )}
    </div>
  );
}

function LocationStep({ locations, selectedLocation, setSelectedLocation, onContinue, onBack }: {
  locations: { id: string; name: string; address: string }[];
  selectedLocation: string;
  setSelectedLocation: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="text-gray-900 mb-4">Select Location</h2>
      <div className="space-y-3">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location.id)}
            className={`w-full p-4 rounded-3xl border-2 transition-all ${
              selectedLocation === location.id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                selectedLocation === location.id ? 'bg-red-500' : 'bg-gray-100'
              }`}>
                <MapPin className={`w-5 h-5 ${selectedLocation === location.id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 mb-1">{location.name}</p>
                <p className="text-sm text-gray-500">{location.address}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 py-3.5 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors">
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedLocation}
          className="flex-1 py-3.5 bg-red-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DateTimeStep({ availableDates, availableTimes, selectedDate, selectedTime, setSelectedDate, setSelectedTime, onSubmit, onBack, requestClubPayment, setRequestClubPayment, showPaymentOption }: {
  availableDates: string[];
  availableTimes: string[];
  selectedDate: string;
  selectedTime: string;
  setSelectedDate: (d: string) => void;
  setSelectedTime: (t: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  requestClubPayment: boolean;
  setRequestClubPayment: (v: boolean) => void;
  showPaymentOption: boolean;
}) {
  return (
    <div>
      <h2 className="text-gray-900 mb-4">Select Date & Time</h2>

      <div className="mb-6">
        <h3 className="text-gray-700 mb-3">Available Dates</h3>
        <div className="grid grid-cols-2 gap-3">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-2xl border-2 transition-all ${
                selectedDate === date ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <Calendar className={`w-5 h-5 mx-auto mb-2 ${selectedDate === date ? 'text-red-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${selectedDate === date ? 'text-red-600' : 'text-gray-600'}`}>{date}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-gray-700 mb-3">Available Times</h3>
          <div className="grid grid-cols-3 gap-3">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  selectedTime === time
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPaymentOption && selectedDate && selectedTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-gray-900 mb-2">Club Payment Request</h4>
              <p className="text-sm text-gray-600 mb-3">
                Request your club administrator to cover the cost of this booking.
              </p>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={requestClubPayment}
                  onChange={(e) => setRequestClubPayment(e.target.checked)}
                  className="w-4 h-4 text-red-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Request club to cover the cost</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 py-3.5 bg-gray-100 text-gray-900 rounded-xl active:bg-gray-200 transition-colors">
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 py-3.5 bg-red-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:scale-95 transition-all"
        >
          {requestClubPayment ? 'Submit Request' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}