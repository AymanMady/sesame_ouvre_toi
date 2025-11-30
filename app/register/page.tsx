'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MicrophoneButton from '@/components/MicrophoneButton';
import { AudioRecorder } from '@/lib/AudioRecorder';
import { VoiceProcessor } from '@/lib/VoiceProcessor';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [magicPhrase, setMagicPhrase] = useState('');
  const [currentSample, setCurrentSample] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [samples, setSamples] = useState<number[][]>([]);
  const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string }>>([]);

  const RECORDING_DURATION = 2000; // 2 seconds
  const REQUIRED_SAMPLES = 3;

  useEffect(() => {
    // Generate stars only on client side to avoid hydration mismatch
    setStars(
      Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      }))
    );
  }, []);

  useEffect(() => {
    return () => {
      recorder?.cleanup();
      if (recordingTimer) clearTimeout(recordingTimer);
    };
  }, [recorder, recordingTimer]);

  const handleStartRecording = async () => {
    if (isRecording || currentSample >= REQUIRED_SAMPLES) return;

    try {
      const newRecorder = new AudioRecorder();
      await newRecorder.initialize();
      setRecorder(newRecorder);

      newRecorder.startRecording();
      setIsRecording(true);
      setStatus(`Recording sample ${currentSample + 1}/${REQUIRED_SAMPLES}...`);

      // Visual feedback - update audio level
      const levelInterval = setInterval(() => {
        const level = newRecorder.getAudioLevel();
        setAudioLevel(level);
      }, 50);

      // Stop after duration
      const timer = setTimeout(async () => {
        clearInterval(levelInterval);
        await handleStopRecording(newRecorder);
      }, RECORDING_DURATION);

      setRecordingTimer(timer);
    } catch (error) {
      console.error('Recording error:', error);
      setStatus('❌ Microphone access denied. Please enable microphone.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async (recorderInstance: AudioRecorder) => {
    try {
      setIsProcessing(true);
      const { buffer } = await recorderInstance.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);

      setStatus('Processing voice sample...');

      // Extract MFCC
      const mfcc = await VoiceProcessor.extractMFCC(buffer);
      
      // Add to samples
      const newSamples = [...samples, mfcc];
      setSamples(newSamples);
      setCurrentSample(newSamples.length);

      recorderInstance.cleanup();

      if (newSamples.length >= REQUIRED_SAMPLES) {
        setStatus('✨ All samples collected! Creating your voiceprint...');
      } else {
        setStatus(`✅ Sample ${newSamples.length}/${REQUIRED_SAMPLES} recorded!`);
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing recording:', error);
      setStatus('❌ Error processing audio. Please try again.');
      setIsRecording(false);
      setIsProcessing(false);
      recorderInstance.cleanup();
    }
  };

  const handleRegister = async () => {
    if (!email || !magicPhrase || samples.length < REQUIRED_SAMPLES) {
      setStatus('❌ Please complete all fields and record all samples.');
      return;
    }

    try {
      setIsProcessing(true);
      setStatus('Creating your magical voiceprint...');

      // Average the MFCC samples
      const averagedMFCC = VoiceProcessor.averageMFCCs(samples);
      
      // Normalize for better matching
      const normalizedMFCC = VoiceProcessor.normalizeMFCC(averagedMFCC);

      // Register user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          magicPhrase,
          voiceprint: JSON.stringify(normalizedMFCC),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✨ Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setStatus(`❌ ${data.error || 'Registration failed'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('❌ Registration failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Starfield background */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
          }}
        />
      ))}

      <motion.div
        className="w-full max-w-md bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-indigo-900/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-500/30 p-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title */}
        <motion.h1
          className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Sésame ouvre-toi !
        </motion.h1>
        
        <p className="text-center text-purple-300 mb-8 text-sm">
          Register your magical voice
        </p>

        {/* Email input */}
        <div className="mb-4">
          <label className="block text-purple-300 mb-2 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition-all"
            placeholder="your@email.com"
            disabled={isProcessing}
          />
        </div>

        {/* Magic phrase input */}
        <div className="mb-6">
          <label className="block text-purple-300 mb-2 text-sm font-medium">
            Magic Phrase
          </label>
          <input
            type="text"
            value={magicPhrase}
            onChange={(e) => setMagicPhrase(e.target.value)}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition-all"
            placeholder="e.g., Open sesame"
            disabled={isProcessing}
          />
          <p className="text-purple-400/70 text-xs mt-1">
            Choose a phrase you'll speak to unlock the gate
          </p>
        </div>

        {/* Recording section */}
        <div className="mb-6">
          <label className="block text-purple-300 mb-4 text-sm font-medium text-center">
            Record Your Voice ({currentSample}/{REQUIRED_SAMPLES} samples)
          </label>

          <div className="flex justify-center mb-4">
            <MicrophoneButton
              isRecording={isRecording}
              onClick={handleStartRecording}
              audioLevel={audioLevel}
              disabled={isProcessing || currentSample >= REQUIRED_SAMPLES}
            />
          </div>

          {/* Sample indicators */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: REQUIRED_SAMPLES }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < currentSample
                    ? 'bg-green-500'
                    : i === currentSample && isRecording
                    ? 'bg-yellow-500'
                    : 'bg-purple-500/30'
                }`}
                animate={
                  i === currentSample && isRecording
                    ? { scale: [1, 1.3, 1] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Instructions */}
          {currentSample < REQUIRED_SAMPLES && !isRecording && (
            <motion.p
              className="text-center text-purple-300 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎙 Click the microphone and say your magic phrase
            </motion.p>
          )}
        </div>

        {/* Status message */}
        {status && (
          <motion.div
            className="mb-6 p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-center text-sm text-purple-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {status}
          </motion.div>
        )}

        {/* Register button */}
        <motion.button
          onClick={handleRegister}
          disabled={
            isProcessing ||
            !email ||
            !magicPhrase ||
            samples.length < REQUIRED_SAMPLES
          }
          className={`
            w-full py-4 rounded-xl font-semibold text-white
            bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600
            shadow-lg shadow-purple-500/50
            transition-all duration-300
            ${
              isProcessing ||
              !email ||
              !magicPhrase ||
              samples.length < REQUIRED_SAMPLES
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-xl hover:shadow-purple-500/70 hover:scale-105'
            }
          `}
          whileHover={
            !(
              isProcessing ||
              !email ||
              !magicPhrase ||
              samples.length < REQUIRED_SAMPLES
            )
              ? { scale: 1.05 }
              : {}
          }
          whileTap={
            !(
              isProcessing ||
              !email ||
              !magicPhrase ||
              samples.length < REQUIRED_SAMPLES
            )
              ? { scale: 0.95 }
              : {}
          }
        >
          {isProcessing ? 'Creating Magic...' : 'Register'}
        </motion.button>

        {/* Login link */}
        <p className="text-center text-purple-300 text-sm mt-4">
          Already registered?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-purple-400 hover:text-purple-300 underline"
            disabled={isProcessing}
          >
            Login here
          </button>
        </p>
      </motion.div>
    </div>
  );
}

