import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { data, error } = await signUp(email, password, displayName);
      setLoading(false);
      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(data?.user);
          onClose();
        }, 1000);
      }
    } else {
      const { data, error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error);
      } else {
        onAuthSuccess(data?.user);
        onClose();
      }
    }
  };

  const handleGuestContinue = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-3">
            <Sparkles className="w-7 h-7 text-emerald-200" />
          </div>
          <h3 className="text-xl font-bold">
            {isSignUp ? 'Create your Free Account' : 'Welcome back to SpeakCheck'}
          </h3>
          <p className="text-emerald-100 text-xs mt-1">
            Save your practice streaks, AI notebook corrections & speaking history.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login & Sign Up */}
          <div className="mt-4 text-center text-xs text-slate-600">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            )}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={handleGuestContinue}
            className="w-full py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            Continue as Guest (Try speaking immediately)
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Secured by Supabase Authentication
          </p>

        </div>
      </div>
    </div>
  );
}

