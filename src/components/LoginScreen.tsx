import { useState } from 'react';
import { Heart, X, Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  suppressNavigation: React.MutableRefObject<boolean>;
}

type AuthMode = 'signin' | 'signup_individual' | 'signup_club';

export function LoginScreen({ suppressNavigation }: LoginScreenProps) {
  const [userType, setUserType] = useState<'individual' | 'club'>('individual');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [individualData, setIndividualData] = useState({
    fullName: '',
    clubName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    phoneCode: '+353',
  });

  const [clubData, setClubData] = useState({
    clubName: '',
    email: '',
    phone: '',
    phoneCode: '+353',
    contactPerson: '',
    address: '',
    city: '',
    county: '',
    password: '',
    confirmPassword: '',
  });

  const irishCounties = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
    'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
    'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow',
  ];

  const inputClass = 'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors';
  const clearError = () => setError('');

  // ── Sign In ───────────────────────────────────────────────────────────────

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please check your inbox or disable email confirmation in Supabase.');
        } else if (authError.message.toLowerCase().includes('invalid login')) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(`Sign in failed: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if the user's account type matches the selected tab
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, user_type')
          .eq('id', data.user.id)
          .single();

        if (profile?.user_type === 'club' && userType === 'individual') {
          // Club account trying to sign in on Individual tab — suppress navigation and sign out
          suppressNavigation.current = true;
          await supabase.auth.signOut();
          suppressNavigation.current = false;
          setError('This is a club account. Please sign in using the GAA Club tab.');
          setLoading(false);
          return;
        }

        if (profile?.user_type === 'individual' && userType === 'club') {
          // Individual account trying to sign in on Club tab — suppress navigation and sign out
          suppressNavigation.current = true;
          await supabase.auth.signOut();
          suppressNavigation.current = false;
          setError('This is a player account. Please sign in using the Individual Player tab.');
          setLoading(false);
          return;
        }

        // onAuthStateChange in App.tsx handles navigation to dashboard
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('[CardioSport] Sign in exception:', err);
      setError('Connection error. Please check your internet and try again.');
    }

    setLoading(false);
  };

  // Handle Enter key press on sign in form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && authMode === 'signin') {
      handleSignIn();
    }
  };

  // ── Individual Sign Up ────────────────────────────────────────────────────

  const handleIndividualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (individualData.password !== individualData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (individualData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: individualData.email.trim(),
        password: individualData.password,
        options: {
          data: {
            username: individualData.fullName,
            user_type: 'individual',
          },
        },
      });

      console.log('[CardioSport] Individual sign up:', {
        user: data?.user?.email ?? null,
        confirmed: data?.user?.email_confirmed_at ?? null,
        error: authError?.message ?? null,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setError('Account created but email confirmation is still enabled in Supabase. Go to Authentication → Providers → Email → turn OFF Confirm email → Save. Then delete this user and try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Small delay to ensure profile row is created by Supabase trigger before updating
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updateData: Record<string, string> = {};
        if (individualData.phone) updateData.phone = `${individualData.phoneCode} ${individualData.phone}`;
        if (individualData.clubName) updateData.bio = individualData.clubName;
        if (Object.keys(updateData).length > 0) {
          await supabase.from('profiles').update(updateData).eq('id', data.user.id);
        }
        setLoading(false);
        setAuthMode('signin');
        return;
      }
    } catch (err) {
      console.error('[CardioSport] Sign up exception:', err);
      setError('Connection error. Please check your internet and try again.');
    }
    setLoading(false);
  };

  // ── Club Sign Up ──────────────────────────────────────────────────────────

  const handleClubSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (clubData.password !== clubData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (clubData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!clubData.clubName.trim()) {
      setError('Please enter your club name.');
      return;
    }
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: clubData.email.trim(),
        password: clubData.password,
        options: {
          data: {
            username: clubData.clubName,
            user_type: 'club',
          },
        },
      });

      console.log('[CardioSport] Club sign up:', {
        user: data?.user?.email ?? null,
        confirmed: data?.user?.email_confirmed_at ?? null,
        error: authError?.message ?? null,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setError('Account created but email confirmation is still enabled in Supabase. Go to Authentication → Providers → Email → turn OFF Confirm email → Save. Then delete this user and try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').update({
          phone: `${clubData.phoneCode} ${clubData.phone}`,
          bio: `${clubData.contactPerson} • ${clubData.city}, ${clubData.county}`,
        }).eq('id', data.user.id);
        setLoading(false);
        setAuthMode('signin');
        return;
      }
    } catch (err) {
      console.error('[CardioSport] Club sign up exception:', err);
      setError('Connection error. Please check your internet and try again.');
    }
    setLoading(false);
  };

  // ── Forgot Password ───────────────────────────────────────────────────────

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    alert(`Password reset email sent to ${email}.`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">

      {/* GAA Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -top-20 -right-20 w-80 h-80 text-red-100 opacity-30" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="80" strokeWidth="2" />
          <path d="M 100 20 Q 120 100 100 180" strokeWidth="2" />
          <path d="M 100 20 Q 80 100 100 180" strokeWidth="2" />
          <path d="M 20 100 Q 100 120 180 100" strokeWidth="2" />
          <path d="M 20 100 Q 100 80 180 100" strokeWidth="2" />
        </svg>
        <svg className="absolute -bottom-10 -left-10 w-64 h-64 text-red-100 opacity-30" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <path d="M 60 180 L 80 40 M 80 40 Q 90 20 110 25 Q 130 30 140 50 L 150 80 Q 155 100 140 110 Q 125 120 110 110 L 80 40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="125" cy="70" rx="25" ry="35" strokeWidth="2" transform="rotate(-25 125 70)" />
        </svg>
      </div>

      {/* Logo */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <h1 className="text-gray-900 dark:text-white mb-2">CardioSport</h1>
        <p className="text-gray-500 dark:text-gray-400">Heart Monitoring for GAA Athletes</p>
      </div>

      {/* Role toggle */}
      {authMode === 'signin' && (
        <div className="w-full max-w-sm mb-6 relative z-10">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex">
            <button type="button" onClick={() => { setUserType('individual'); clearError(); }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-sm ${userType === 'individual' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Individual Player
            </button>
            <button type="button" onClick={() => { setUserType('club'); clearError(); }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-sm ${userType === 'club' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              GAA Club
            </button>
          </div>
        </div>
      )}

      {/* Sign In Form */}
      {authMode === 'signin' && (
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl mb-6 relative z-10">
          <h2 className="text-gray-900 dark:text-white mb-6 text-center">Welcome Back</h2>
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} onKeyDown={handleKeyDown} placeholder="Enter your email" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} onKeyDown={handleKeyDown} placeholder="Enter your password" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="button" onClick={handleForgotPassword} className="w-full text-right text-sm text-red-500 active:opacity-50">Forgot password?</button>
            <button onClick={handleSignIn} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </div>
        </div>
      )}

      {authMode === 'signin' && (
        <p className="text-gray-500 text-sm relative z-10 text-center">
          {userType === 'individual' ? (
            <>Don't have an account? <button className="text-red-500" onClick={() => { setAuthMode('signup_individual'); clearError(); }}>Sign up as a player</button></>
          ) : (
            <>Don't have an account? <button className="text-red-500" onClick={() => { setAuthMode('signup_club'); clearError(); }}>Sign up your GAA club</button></>
          )}
        </p>
      )}

      {/* Individual Sign Up Modal */}
      {authMode === 'signup_individual' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white text-lg">Create Player Account</h2>
              <button onClick={() => { setAuthMode('signin'); clearError(); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleIndividualSignUp} className="space-y-4">
                {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-600 text-sm">{error}</p></div>}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Full Name *</label>
                  <input type="text" required value={individualData.fullName} onChange={(e) => setIndividualData(p => ({ ...p, fullName: e.target.value }))} placeholder="e.g. Cian Murphy" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Club Name</label>
                  <input type="text" value={individualData.clubName} onChange={(e) => setIndividualData(p => ({ ...p, clubName: e.target.value }))} placeholder="e.g. Croke Park GAA" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address *</label>
                  <input type="email" required value={individualData.email} onChange={(e) => setIndividualData(p => ({ ...p, email: e.target.value }))} placeholder="player@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <select value={individualData.phoneCode} onChange={(e) => setIndividualData(p => ({ ...p, phoneCode: e.target.value }))} className="px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors">
                      <option value="+353">🇮🇪 +353</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input type="tel" inputMode="numeric" value={individualData.phone} onChange={(e) => setIndividualData(p => ({ ...p, phone: e.target.value.replace(/[^0-9\s]/g, '') }))} placeholder="87 123 4567" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Password *</label>
                  <input type="password" required value={individualData.password} onChange={(e) => setIndividualData(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} required value={individualData.confirmPassword} onChange={(e) => setIndividualData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat your password" className={`${inputClass} pr-12`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
                <button type="button" onClick={() => { setAuthMode('signin'); clearError(); }} className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl">Back to Sign In</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Club Sign Up Modal */}
      {authMode === 'signup_club' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white text-lg">Sign Up Your GAA Club</h2>
              <button onClick={() => { setAuthMode('signin'); clearError(); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleClubSignUp} className="space-y-4">
                {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-600 text-sm">{error}</p></div>}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Club Name *</label>
                  <input type="text" required value={clubData.clubName} onChange={(e) => setClubData(p => ({ ...p, clubName: e.target.value }))} placeholder="e.g. Croke Park GAA" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address *</label>
                  <input type="email" required value={clubData.email} onChange={(e) => setClubData(p => ({ ...p, email: e.target.value }))} placeholder="club@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone *</label>
                  <div className="flex gap-2">
                    <select value={clubData.phoneCode} onChange={(e) => setClubData(p => ({ ...p, phoneCode: e.target.value }))} className="px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors">
                      <option value="+353">🇮🇪 +353</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input type="tel" inputMode="numeric" required value={clubData.phone} onChange={(e) => setClubData(p => ({ ...p, phone: e.target.value.replace(/[^0-9\s]/g, '') }))} placeholder="1 234 5678" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Contact Person *</label>
                  <input type="text" required value={clubData.contactPerson} onChange={(e) => setClubData(p => ({ ...p, contactPerson: e.target.value }))} placeholder="Club secretary name" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">City</label>
                    <input type="text" value={clubData.city} onChange={(e) => setClubData(p => ({ ...p, city: e.target.value }))} placeholder="Dublin" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">County</label>
                    <select value={clubData.county} onChange={(e) => setClubData(p => ({ ...p, county: e.target.value }))} className={inputClass}>
                      <option value="">Select</option>
                      {irishCounties.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Password *</label>
                  <input type="password" required value={clubData.password} onChange={(e) => setClubData(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} required value={clubData.confirmPassword} onChange={(e) => setClubData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Repeat your password" className={`${inputClass} pr-12`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Create Club Account'}
                </button>
                <button type="button" onClick={() => { setAuthMode('signin'); clearError(); }} className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl">Back to Sign In</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}