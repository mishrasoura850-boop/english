import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export default function SupabaseSetupGuide({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchemaSnippet = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT DEFAULT 'Learner',
    avatar_url TEXT,
    english_level TEXT DEFAULT 'Intermediate',
    daily_goal_minutes INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT,
    topic_title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    original_transcript TEXT NOT NULL,
    corrected_transcript TEXT NOT NULL,
    score NUMERIC(3, 1) NOT NULL,
    feedback_category TEXT NOT NULL,
    feedback_remarks TEXT NOT NULL,
    grammar_score NUMERIC(3, 1),
    vocabulary_score NUMERIC(3, 1),
    clarity_score NUMERIC(3, 1),
    duration_seconds INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.practice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.session_mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
    original_snippet TEXT NOT NULL,
    corrected_snippet TEXT NOT NULL,
    mistake_type TEXT NOT NULL,
    simple_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.session_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mistakes" ON public.session_mistakes FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.practice_sessions ps WHERE ps.id = session_mistakes.session_id AND ps.user_id = auth.uid()));
CREATE POLICY "Users insert own mistakes" ON public.session_mistakes FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.practice_sessions ps WHERE ps.id = session_mistakes.session_id AND ps.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_practice_days INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    last_practice_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streak" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Supabase Cloud Database Setup</h3>
            <p className="text-xs text-slate-500">Connected to your Supabase project credentials</p>
          </div>
        </div>

        {/* Current Credentials */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Project URL:</span>
            <span className="font-mono font-bold text-slate-800">{SUPABASE_URL}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Publishable Key:</span>
            <span className="font-mono text-slate-700 truncate max-w-[280px]">{SUPABASE_ANON_KEY}</span>
          </div>
        </div>

        {/* 3 Steps */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Setup (1 Minute):</h4>
          <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed font-medium">
            <li>
              Go to your Supabase Dashboard (<a href="https://supabase.com/dashboard/project/dzwaivutvtturdnjohhf/sql" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline inline-flex items-center gap-0.5">SQL Editor <ExternalLink className="w-3 h-3" /></a>).
            </li>
            <li>Click <strong>New Query</strong>, paste the SQL schema below, and click <strong>Run</strong>.</li>
            <li>That's it! User authentication, practice history, and streaks will automatically sync to PostgreSQL.</li>
          </ol>
        </div>

        {/* SQL Script Box with Copy Button */}
        <div className="relative">
          <div className="flex items-center justify-between bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-t-xl font-mono">
            <span>supabase_schema.sql</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-b-xl overflow-x-auto max-h-56 leading-relaxed">
            {sqlSchemaSnippet}
          </pre>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

