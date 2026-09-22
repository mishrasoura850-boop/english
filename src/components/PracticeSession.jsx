import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Edit3, 
  Check, 
  Volume2, 
  AlertCircle, 
  Lightbulb, 
  Shuffle, 
  HelpCircle,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import { SpeechService } from '../lib/speechService';
import { analyzeEnglishSpeech } from '../lib/puterAi';
import { getRandomTopic } from '../lib/topicsData';

export default function PracticeSession({ 
  currentTopic, 
  onSelectTopic, 
  onCompleteSession,
  onOpenTopicsModal
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [freqBars, setFreqBars] = useState(new Array(16).fill(10));
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const speechServiceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    speechServiceRef.current = new SpeechService();
    return () => {
      if (speechServiceRef.current) {
        speechServiceRef.current.stopRecording();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setAudioUrl(null);
    setIsEditing(false);
    setTranscript('');
    setRecordingSeconds(0);

    const result = await speechServiceRef.current.startRecording(
      (update) => {
        setTranscript(update.full);
      },
      (level, bars) => {
        setAudioLevel(level);
        if (bars && bars.length > 0) {
          setFreqBars(bars);
        }
      }
    );

    if (result.success) {
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setErrorMessage(result.error || 'Failed to start microphone. You can type your speech directly below.');
      setIsEditing(true);
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const { audioUrl } = speechServiceRef.current.stopRecording();
    if (audioUrl) {
      setAudioUrl(audioUrl);
    }
  };

  const handleShuffleTopic = () => {
    if (isRecording) handleStopRecording();
    const next = getRandomTopic(currentTopic?.id);
    onSelectTopic(next);
    setTranscript('');
    setAudioUrl(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setErrorMessage('Please speak into the microphone or type your response before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeEnglishSpeech(transcript, currentTopic?.title);
      setIsAnalyzing(false);
      onCompleteSession({
        ...result,
        original_transcript: transcript.trim(),
        duration_seconds: recordingSeconds || 45,
        topic_id: currentTopic?.id,
        topic_title: currentTopic?.title,
        category: currentTopic?.category || 'General'
      });
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage('Analysis error: ' + err.message);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Topic Spotlight Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {currentTopic?.category || 'General Topic'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {currentTopic?.difficulty || 'Intermediate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleTopic}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle Topic</span>
            </button>
            <button
              onClick={onOpenTopicsModal}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Browse All
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {currentTopic?.title || 'Describe your daily routine'}
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {currentTopic?.description || 'Talk about what you do from the moment you wake up until you go to sleep.'}
        </p>

        {/* Hints / Speaking bullet points */}
        {currentTopic?.hints && currentTopic.hints.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Points you can talk about:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
              {currentTopic.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Recording Studio & Microphone Area */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Large Animated Microphone Button */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative">
            {/* Pulsing ring when active */}
            {isRecording && (
              <div 
                className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" 
                style={{ transform: `scale(${1 + (audioLevel / 120)})` }}
              />
            )}

            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/40 ring-4 ring-red-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 hover:scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-9 h-9 sm:w-10 sm:h-10 fill-current" />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                  <span className="text-[10px] font-bold tracking-wider uppercase mt-1">Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Status Label & Timer */}
          <div className="mt-4">
            {isRecording ? (
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <span>Recording... {formatTime(recordingSeconds)}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                {transcript ? 'Recording finished. Review transcript below or speak again.' : 'Tap microphone and speak freely in English for 30–90 seconds.'}
              </p>
            )}
          </div>

          {/* Live Audio Equalizer Waveform */}
          {isRecording && (
            <div className="flex items-end justify-center gap-1.5 h-10 mt-4 px-4">
              {freqBars.map((val, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(6, (val / 255) * 38)}px`,
                    backgroundColor: val > 120 ? '#10b981' : '#34d399'
                  }}
                />
              ))}
            </div>
          )}

          {/* Audio Player Preview */}
          {audioUrl && !isRecording && (
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
              <audio ref={audioPlayerRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
              <button
                onClick={() => {
                  if (isPlayingAudio) {
                    audioPlayerRef.current?.pause();
                    setIsPlayingAudio(false);
                  } else {
                    audioPlayerRef.current?.play();
                    setIsPlayingAudio(true);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 text-emerald-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                <span>{isPlayingAudio ? 'Pause Voice' : 'Play My Voice'}</span>
              </button>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500">{formatTime(recordingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Spoken Transcript Preview & Editable Field */}
        <div className="mt-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Your Spoken Transcript</span>
              {transcript && <span className="text-[11px] text-slate-400 font-normal">({transcript.split(' ').filter(Boolean).length} words)</span>}
            </label>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
            </button>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak using the microphone or type your English sentences here..."
              className="w-full p-4 text-sm sm:text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
            />
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[90px] text-sm sm:text-base leading-relaxed text-slate-800">
              {transcript ? (
                <p>{transcript}</p>
              ) : (
                <span className="text-slate-400 italic text-xs">
                  Your speech will appear here automatically in real time as you speak...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Submit & AI Analysis CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          
          <button
            onClick={() => {
              setTranscript('');
              setAudioUrl(null);
              setErrorMessage(null);
            }}
            disabled={isRecording || isAnalyzing || !transcript}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            Clear Transcript
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isRecording || isAnalyzing || !transcript || transcript.trim().length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Teacher Checking Notebook...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Grade in Teacher Notebook</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}

