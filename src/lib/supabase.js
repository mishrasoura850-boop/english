import { createClient } from '@supabase/supabase-js';

// User's Supabase project credentials
export const SUPABASE_URL = 'https://dzwaivutvtturdnjohhf.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_t3rhlkkZoa1J57L8IH7Q4g_jIM_tQpQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

const LOCAL_STORAGE_KEY_SESSIONS = 'speakcheck_local_sessions';
const LOCAL_STORAGE_KEY_STREAK = 'speakcheck_local_streak';
const LOCAL_STORAGE_KEY_PROFILE = 'speakcheck_local_profile';

// ==========================================
// Authentication Methods
// ==========================================

export async function signUp(email, password, displayName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        }
      }
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Supabase Sign Up Error:', err);
    return { data: null, error: err.message };
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Supabase Sign In Error:', err);
    return { data: null, error: err.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Supabase Sign Out Error:', err);
    return { error: err.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (err) {
    console.warn('Get session warning:', err);
    return null;
  }
}

// ==========================================
// Profile Management
// ==========================================

export async function getUserProfile(userId) {
  if (!userId) {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    return local ? JSON.parse(local) : { display_name: 'Guest Learner', english_level: 'Intermediate', daily_goal_minutes: 15 };
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error || !data) {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      return local ? JSON.parse(local) : { display_name: 'Learner', english_level: 'Intermediate', daily_goal_minutes: 15 };
    }
    return data;
  } catch (err) {
    console.warn('Profile fetch fallback to local:', err);
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    return local ? JSON.parse(local) : { display_name: 'Learner', english_level: 'Intermediate', daily_goal_minutes: 15 };
  }
}

export async function updateUserProfile(userId, updates) {
  // Always update local cache
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
  const current = local ? JSON.parse(local) : {};
  const updatedLocal = { ...current, ...updates };
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updatedLocal));

  if (!userId) return { data: updatedLocal, error: null };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Update profile remote error (cached locally):', err);
    return { data: updatedLocal, error: null };
  }
}

// ==========================================
// Practice Sessions & Mistakes
// ==========================================

export async function savePracticeSession(sessionPayload, userId) {
  const localId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const sessionRecord = {
    id: localId,
    user_id: userId || 'guest',
    topic_id: sessionPayload.topic_id || 'topic_custom',
    topic_title: sessionPayload.topic_title || 'Free Speaking',
    category: sessionPayload.category || 'General',
    original_transcript: sessionPayload.original_transcript,
    corrected_transcript: sessionPayload.corrected_transcript,
    score: sessionPayload.score,
    feedback_category: sessionPayload.feedback_category,
    feedback_remarks: sessionPayload.feedback_remarks,
    grammar_score: sessionPayload.grammar_score || sessionPayload.score,
    vocabulary_score: sessionPayload.vocabulary_score || sessionPayload.score,
    clarity_score: sessionPayload.clarity_score || sessionPayload.score,
    duration_seconds: sessionPayload.duration_seconds || 60,
    mistakes: sessionPayload.mistakes || [],
    better_phrasings: sessionPayload.better_phrasings || [],
    created_at: new Date().toISOString()
  };

  // 1. Save to Local Storage (Instant & Resilient)
  const existingLocal = getLocalPracticeSessions();
  const updatedLocal = [sessionRecord, ...existingLocal];
  localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(updatedLocal));

  // 2. Sync to Supabase if authenticated
  if (userId && userId !== 'guest') {
    try {
      const { data: insertedSession, error: sessionErr } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: userId,
          topic_id: sessionRecord.topic_id,
          topic_title: sessionRecord.topic_title,
          category: sessionRecord.category,
          original_transcript: sessionRecord.original_transcript,
          corrected_transcript: sessionRecord.corrected_transcript,
          score: sessionRecord.score,
          feedback_category: sessionRecord.feedback_category,
          feedback_remarks: sessionRecord.feedback_remarks,
          grammar_score: sessionRecord.grammar_score,
          vocabulary_score: sessionRecord.vocabulary_score,
          clarity_score: sessionRecord.clarity_score,
          duration_seconds: sessionRecord.duration_seconds,
        })
        .select()
        .single();

      if (!sessionErr && insertedSession && sessionPayload.mistakes?.length > 0) {
        const mistakeRows = sessionPayload.mistakes.map(m => ({
          session_id: insertedSession.id,
          original_snippet: m.original || m.original_snippet || '',
          corrected_snippet: m.correction || m.corrected_snippet || '',
          mistake_type: m.category || m.mistake_type || 'Grammar',
          simple_explanation: m.explanation || m.simple_explanation || ''
        }));
        await supabase.from('session_mistakes').insert(mistakeRows);
      }
    } catch (err) {
      console.warn('Supabase DB save error (saved locally):', err);
    }
  }

  // 3. Update Streak & Attendance
  await recordPracticeAttendance(userId);

  return sessionRecord;
}

export async function getUserPracticeSessions(userId) {
  // Always get local sessions as base
  const localSessions = getLocalPracticeSessions();

  if (!userId || userId === 'guest') {
    return localSessions;
  }

  try {
    const { data: dbSessions, error } = await supabase
      .from('practice_sessions')
      .select('*, session_mistakes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !dbSessions || dbSessions.length === 0) {
      return localSessions;
    }

    // Transform DB sessions to unified format
    const remoteFormatted = dbSessions.map(s => ({
      ...s,
      mistakes: (s.session_mistakes || []).map(m => ({
        original: m.original_snippet,
        correction: m.corrected_snippet,
        category: m.mistake_type,
        explanation: m.simple_explanation
      }))
    }));

    // Merge without duplicates
    const merged = [...remoteFormatted];
    for (const loc of localSessions) {
      if (!merged.some(m => m.id === loc.id || (m.created_at === loc.created_at && m.original_transcript === loc.original_transcript))) {
        merged.push(loc);
      }
    }
    return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.warn('Fetch remote sessions fallback:', err);
    return localSessions;
  }
}

export function getLocalPracticeSessions() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// Streaks and Attendance
// ==========================================

export async function getStreakData(userId) {
  const defaultStreak = {
    current_streak: 0,
    longest_streak: 0,
    total_practice_days: 0,
    total_sessions: 0,
    last_practice_date: null,
    history_dates: {}
  };

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_STREAK);
    const localData = local ? JSON.parse(local) : defaultStreak;

    // Calculate dates map from all recorded sessions
    const sessions = getLocalPracticeSessions();
    const datesMap = {};
    for (const s of sessions) {
      const dateStr = s.created_at.split('T')[0];
      datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
    }
    localData.history_dates = datesMap;
    localData.total_sessions = sessions.length;

    return localData;
  } catch (e) {
    return defaultStreak;
  }
}

export async function recordPracticeAttendance(userId) {
  const sessions = getLocalPracticeSessions();
  const datesMap = {};
  for (const s of sessions) {
    const dateStr = s.created_at.split('T')[0];
    datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
  }

  const sortedDates = Object.keys(datesMap).sort();
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate current & longest streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  let checkDate = new Date();
  // If not practiced today yet, check if yesterday was practiced
  const todayPracticed = !!datesMap[todayStr];
  if (!todayPracticed) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (datesMap[dStr]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  if (sortedDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  const streakObj = {
    current_streak: currentStreak,
    longest_streak: Math.max(longestStreak, currentStreak),
    total_practice_days: sortedDates.length,
    total_sessions: sessions.length,
    last_practice_date: todayStr,
    history_dates: datesMap,
    updated_at: new Date().toISOString()
  };

  localStorage.setItem(LOCAL_STORAGE_KEY_STREAK, JSON.stringify(streakObj));

  if (userId && userId !== 'guest') {
    try {
      await supabase.from('user_streaks').upsert({
        user_id: userId,
        current_streak: streakObj.current_streak,
        longest_streak: streakObj.longest_streak,
        total_practice_days: streakObj.total_practice_days,
        total_sessions: streakObj.total_sessions,
        last_practice_date: streakObj.last_practice_date,
        updated_at: streakObj.updated_at
      });
    } catch (err) {
      console.warn('Update remote streak error:', err);
    }
  }

  return streakObj;
}

