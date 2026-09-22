// Web Speech API and Audio Recorder Utility for SpeakCheck

export class SpeechService {
  constructor() {
    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
    this.isRecording = false;
    this.onTranscriptUpdate = null;
    this.onAudioLevel = null;
    this.animationFrameId = null;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate({
            final: finalTranscript.trim(),
            interim: interimTranscript.trim(),
            full: (finalTranscript + ' ' + interimTranscript).trim()
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition warning/error:', event.error);
      };
    }
  }

  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async startRecording(onTranscriptCallback, onAudioLevelCallback) {
    this.onTranscriptUpdate = onTranscriptCallback;
    this.onAudioLevel = onAudioLevelCallback;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;

    try {
      // 1. Get microphone stream
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });

      // 2. Set up Audio Analyzer for visual waveform
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const pollAudioLevels = () => {
          if (!this.isRecording) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avgLevel = Math.min(100, Math.round((sum / dataArray.length) * 1.5));
          if (this.onAudioLevel) {
            this.onAudioLevel(avgLevel, Array.from(dataArray.slice(0, 16)));
          }
          this.animationFrameId = requestAnimationFrame(pollAudioLevels);
        };
        pollAudioLevels();
      }

      // 3. Set up MediaRecorder
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          this.audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;

      // 4. Start speech recognition
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          console.warn('Recognition already started or error:', e);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      return { 
        success: false, 
        error: err.name === 'NotAllowedError' 
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.' 
          : 'Could not start microphone: ' + err.message 
      };
    }
  }

  stopRecording() {
    this.isRecording = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }

    return {
      audioBlob: this.audioBlob,
      audioUrl: this.audioUrl
    };
  }
}

// Global Text to Speech (TTS) helper for hearing correct pronunciation
export function speakText(text, rate = 0.9) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate; // Slightly slower for clear English learning
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  // Choose natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')))) || voices.find(v => v.lang.startsWith('en'));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

