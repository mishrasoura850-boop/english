-- ==============================================================================
-- SpeakCheck SaaS - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. PROFILES TABLE (Stores user profile details)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT DEFAULT 'Learner',
    avatar_url TEXT,
    english_level TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    daily_goal_minutes INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. PRACTICE SESSIONS TABLE (Stores completed speaking sessions)
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT,
    topic_title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    original_transcript TEXT NOT NULL,
    corrected_transcript TEXT NOT NULL,
    score NUMERIC(3, 1) NOT NULL, -- 0.0 to 10.0
    feedback_category TEXT NOT NULL, -- Very Bad, Bad, Good, Very Good, Excellent
    feedback_remarks TEXT NOT NULL,
    grammar_score NUMERIC(3, 1),
    vocabulary_score NUMERIC(3, 1),
    clarity_score NUMERIC(3, 1),
    duration_seconds INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for practice_sessions
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own practice sessions" 
    ON public.practice_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions" 
    ON public.practice_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice sessions" 
    ON public.practice_sessions FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. SESSION MISTAKES TABLE (Stores individual grammar/vocabulary corrections)
CREATE TABLE IF NOT EXISTS public.session_mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
    original_snippet TEXT NOT NULL,
    corrected_snippet TEXT NOT NULL,
    mistake_type TEXT NOT NULL, -- e.g. Tense, Preposition, Article, Word Choice
    simple_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for session_mistakes
ALTER TABLE public.session_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session mistakes" 
    ON public.session_mistakes FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.practice_sessions ps 
        WHERE ps.id = session_mistakes.session_id AND ps.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own session mistakes" 
    ON public.session_mistakes FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.practice_sessions ps 
        WHERE ps.id = session_mistakes.session_id AND ps.user_id = auth.uid()
    ));

-- 4. USER STREAKS & ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_practice_days INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    last_practice_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" 
    ON public.user_streaks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" 
    ON public.user_streaks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" 
    ON public.user_streaks FOR UPDATE 
    USING (auth.uid() = user_id);

-- 5. SPEAKING TOPICS (Preloaded catalog)
CREATE TABLE IF NOT EXISTS public.speaking_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    hints TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read speaking topics" 
    ON public.speaking_topics FOR SELECT 
    TO public USING (true);

-- 6. AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, total_practice_days, total_sessions)
    VALUES (NEW.id, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_mistakes_session_id ON public.session_mistakes(session_id);

