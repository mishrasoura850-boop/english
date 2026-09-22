import React, { useState } from 'react';
import { X, User, Award, Clock, Save, ShieldCheck, Check } from 'lucide-react';
import { updateUserProfile } from '../lib/supabase';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  userProfile, 
  onProfileUpdated 
}) {
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [englishLevel, setEnglishLevel] = useState(userProfile?.english_level || 'Intermediate');
  const [dailyGoal, setDailyGoal] = useState(userProfile?.daily_goal_minutes || 15);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const updates = {
      display_name: displayName,
      english_level: englishLevel,
      daily_goal_minutes: Number(dailyGoal)
    };

    const { data } = await updateUserProfile(user?.id, updates);
    setSaving(false);
    setSavedSuccess(true);
    if (onProfileUpdated) onProfileUpdated(data || updates);

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Learner Profile & Goals</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize your English learning pace and goals.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name / Nickname</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target English Level</label>
            <select
              value={englishLevel}
              onChange={(e) => setEnglishLevel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Beginner">Beginner (Simple sentence practice)</option>
              <option value="Intermediate">Intermediate (Conversational flow)</option>
              <option value="Advanced">Advanced (Fluency, idioms & nuance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Practice Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 30].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDailyGoal(mins)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    dailyGoal === mins
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} mins/day
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Supabase Cloud Sync</span>
            </div>
            <p className="text-[11px] mt-0.5 text-slate-500">
              {user?.email ? `Connected to ${user.email}` : 'Logged in as Guest (Data stored locally in browser)'}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Changes!</span>
              </>
            ) : saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}

