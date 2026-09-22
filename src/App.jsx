import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PracticeSession from './components/PracticeSession';
import TeacherNotebook from './components/TeacherNotebook';
import PracticeHistory from './components/PracticeHistory';
import TopicSelector from './components/TopicSelector';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import SupabaseSetupGuide from './components/SupabaseSetupGuide';
import { 
  supabase, 
  getCurrentUser, 
  getUserProfile, 
  getUserPracticeSessions, 
  getStreakData, 
  savePracticeSession,
  signOut 
} from './lib/supabase';
import { SPEAKING_TOPICS, getRandomTopic } from './lib/topicsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'practice', 'review', 'history', 'topics'
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [sessions, setSessions] = useState([]);
  
  // Topic and Practice States
  const [currentTopic, setCurrentTopic] = useState(SPEAKING_TOPICS[0]);
  const [currentSessionResult, setCurrentSessionResult] = useState(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [dbGuideOpen, setDbGuideOpen] = useState(false);

  // Load user data on startup
  useEffect(() => {
    const initApp = async () => {
      // 1. Initial random daily topic
      setCurrentTopic(getRandomTopic());

      // 2. Check current Supabase Auth user
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // 3. Load profile, streak, and history
      await loadUserData(currentUser);

      // 4. Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        const u = session?.user || null;
        setUser(u);
        await loadUserData(u);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    };

    initApp();
  }, []);

  const loadUserData = async (currentUser) => {
    const userId = currentUser?.id;
    const profile = await getUserProfile(userId);
    setUserProfile(profile);

    const streak = await getStreakData(userId);
    setStreakData(streak);

    const userSessions = await getUserPracticeSessions(userId);
    setSessions(userSessions);
  };

  const handleCompleteSession = async (sessionPayload) => {
    // 1. Save session to Supabase & LocalStorage
    const savedRecord = await savePracticeSession(sessionPayload, user?.id);

    // 2. Refresh streak & sessions list
    const updatedStreak = await getStreakData(user?.id);
    setStreakData(updatedStreak);

    const updatedSessions = await getUserPracticeSessions(user?.id);
    setSessions(updatedSessions);

    // 3. Set current review session & navigate to Teacher Notebook
    setCurrentSessionResult(savedRecord);
    setActiveTab('review');
  };

  const handleSelectPastSession = (session) => {
    setCurrentSessionResult(session);
    const matchedTopic = SPEAKING_TOPICS.find(t => t.id === session.topic_id) || {
      title: session.topic_title,
      category: session.category || 'General'
    };
    setCurrentTopic(matchedTopic);
    setActiveTab('review');
  };

  const handleStartPractice = (topicToUse = null) => {
    if (topicToUse) setCurrentTopic(topicToUse);
    setActiveTab('practice');
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    await loadUserData(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        userProfile={userProfile}
        streakData={streakData}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenDbGuide={() => setDbGuideOpen(true)}
        onStartNewPractice={() => handleStartPractice()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            todayTopic={currentTopic}
            streakData={streakData}
            recentSessions={sessions}
            userProfile={userProfile}
            user={user}
            onStartPractice={() => handleStartPractice()}
            onOpenTopics={() => setActiveTab('topics')}
            onSelectPastSession={handleSelectPastSession}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeSession
            currentTopic={currentTopic}
            onSelectTopic={(t) => setCurrentTopic(t)}
            onCompleteSession={handleCompleteSession}
            onOpenTopicsModal={() => setTopicsModalOpen(true)}
          />
        )}

        {activeTab === 'review' && (
          <TeacherNotebook
            sessionResult={currentSessionResult}
            topic={currentTopic}
            onPracticeAgain={() => setActiveTab('practice')}
            onNewTopic={() => {
              const next = getRandomTopic(currentTopic?.id);
              setCurrentTopic(next);
              setActiveTab('practice');
            }}
          />
        )}

        {activeTab === 'history' && (
          <PracticeHistory
            sessions={sessions}
            onSelectSession={handleSelectPastSession}
            onStartNewPractice={() => handleStartPractice()}
          />
        )}

        {activeTab === 'topics' && (
          <TopicSelector
            isOpen={false}
            currentTopicId={currentTopic?.id}
            onSelectTopic={(topic) => {
              setCurrentTopic(topic);
              setActiveTab('practice');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">SpeakCheck</span> — Master English speaking & grammar with instant AI Teacher Notebook grading.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by Puter.js AI & Supabase</span>
            <span>•</span>
            <button onClick={() => setDbGuideOpen(true)} className="hover:text-emerald-700 underline">
              Supabase Status
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          loadUserData(authenticatedUser);
        }}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        userProfile={userProfile}
        onProfileUpdated={(updated) => setUserProfile(updated)}
      />

      <TopicSelector
        isOpen={topicsModalOpen}
        onClose={() => setTopicsModalOpen(false)}
        currentTopicId={currentTopic?.id}
        onSelectTopic={(t) => setCurrentTopic(t)}
      />

      <SupabaseSetupGuide
        isOpen={dbGuideOpen}
        onClose={() => setDbGuideOpen(false)}
      />

    </div>
  );
}

