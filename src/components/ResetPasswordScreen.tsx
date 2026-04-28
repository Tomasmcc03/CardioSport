import { useState, useEffect } from 'react';
import { Heart, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordScreenProps {
  onDone: () => void;
}

export function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);



  const inputClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors';

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(`Failed to update password: ${updateError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Reload the page after reset — this clears all state cleanly
    // and the normal load will clear localStorage and show the login screen
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = window.location.origin;
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-white to-red-50 dark:from-gray-900 dark:to-gray-800">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <h1 className="text-gray-900 dark:text-white mb-2">CardioSport</h1>
        <p className="text-gray-500 dark:text-gray-400">Reset Your Password</p>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-gray-900 dark:text-white mb-2">Password Updated!</h2>
            <p className="text-gray-500 text-sm">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <h2 className="text-gray-900 dark:text-white mb-2">Set New Password</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Minimum 6 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Repeat your new password"
                  className={inputClass}
                />
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}