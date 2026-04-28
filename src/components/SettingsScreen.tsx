import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Lock, Shield, FileText, LogOut, Moon, Sun, Info, Eye, EyeOff, Loader } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  club?: string;
}

export function SettingsScreen({ onBack, onLogout, username, setUsername, email, setEmail, phone, setPhone, club }: SettingsScreenProps) {
  const [activeView, setActiveView] = useState<'main' | 'profile' | 'privacy' | 'about' | 'changePassword'>('main');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();



  // Change Password View
  if (activeView === 'changePassword') {
    const handlePasswordChange = async () => {
      if (!newPassword.trim()) { setPasswordError('Please enter a new password.'); return; }
      if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
      if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
      setPasswordLoading(true);
      setPasswordError('');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setPasswordLoading(false);
      if (error) { setPasswordError(`Failed to update password: ${error.message}`); return; }
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setPasswordSuccess(false); setActiveView('main'); }, 2000);
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-12 pb-4">
            <button onClick={() => setActiveView('main')} className="flex items-center text-red-500 dark:text-red-400 mb-4 active:opacity-50 transition-opacity">
              <ChevronLeft className="w-6 h-6 mr-1" /><span>Settings</span>
            </button>
            <h1 className="text-gray-900 dark:text-white">Change Password</h1>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 space-y-5">
            {passwordSuccess && (
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm text-center">Password updated successfully!</p>
              </div>
            )}
            {passwordError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{passwordError}</p>
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                placeholder="Repeat your new password"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="w-full bg-red-500 text-white py-3 rounded-xl active:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {passwordLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // About View
  if (activeView === 'about') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-12 pb-4">
            <button onClick={() => setActiveView('main')} className="flex items-center text-red-500 dark:text-red-400 mb-4 active:opacity-50 transition-opacity">
              <ChevronLeft className="w-6 h-6 mr-1" /><span>Settings</span>
            </button>
            <h1 className="text-gray-900 dark:text-white">About</h1>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="text-gray-900 dark:text-white text-xl mb-1">CardioSport</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Version 1.0.0</p>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              CardioSport is a cardiac screening management platform designed for the GAA community, helping players and club administrators manage cardiac health screenings efficiently and accessibly.
            </p>
            <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4">
              <p className="text-gray-400 dark:text-gray-500 text-xs">Developed by Tomas McCrink</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">QUB CSC3023 — 2025/26</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Privacy Settings View
  if (activeView === 'privacy') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-12 pb-4">
            <button onClick={() => setActiveView('main')} className="flex items-center text-red-500 dark:text-red-400 mb-4 active:opacity-50 transition-opacity">
              <ChevronLeft className="w-6 h-6 mr-1" /><span>Settings</span>
            </button>
            <h1 className="text-gray-900 dark:text-white">Privacy & Security</h1>
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setActiveView('changePassword')}
              className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mr-3">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-900 dark:text-white">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-red-600 dark:text-red-400">Delete Account</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 px-2">Your data is protected by Supabase Row Level Security. Only you can access your personal information.</p>
        </div>
      </div>
    );
  }

  // Profile Details View
  if (activeView === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-12 pb-4">
            <button 
              onClick={() => setActiveView('main')}
              className="flex items-center text-red-500 dark:text-red-400 mb-4 active:opacity-50 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 mr-1" />
              <span>Settings</span>
            </button>
            <h1 className="text-gray-900 dark:text-white">Profile Details</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 space-y-5">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed"
              />
            </div>
            {club && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Club</label>
                <input
                  type="text"
                  value={club}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-6 py-6 space-y-6">
        {/* Account Settings */}
        <div>
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-3 px-4">ACCOUNT</h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setActiveView('profile')}
              className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-white">Profile Details</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

          </div>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-3 px-4">APPEARANCE</h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={toggleDarkMode}
              className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mr-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-gray-300" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <span className="text-gray-900 dark:text-white">Dark Mode</span>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-red-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${isDarkMode ? 'translate-x-6 ml-1' : 'translate-x-1'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div>
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-3 px-4">PRIVACY & SECURITY</h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setActiveView('privacy')}
              className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-gray-900 dark:text-white">Privacy & Security</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-3 px-4">ABOUT</h2>
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setActiveView('about')}
              className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-white">About CardioSport</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
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