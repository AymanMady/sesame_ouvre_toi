'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MicrophoneButton from '@/components/MicrophoneButton';
import MagicGate from '@/components/MagicGate';
import { AudioRecorder } from '@/lib/AudioRecorder';
import { VoiceProcessor } from '@/lib/VoiceProcessor';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateShaking, setGateShaking] = useState(false);
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string }>>([]);

  const RECORDING_DURATION = 2000; // 2 seconds

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
    if (isRecording || !email) {
      if (!email) {
        setStatus('❌ Please enter your email first');
      }
      return;
    }

    try {
      const newRecorder = new AudioRecorder();
      await newRecorder.initialize();
      setRecorder(newRecorder);

      newRecorder.startRecording();
      setIsRecording(true);
      setStatus('🎙 Listening to your voice...');

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

      setStatus('✨ Processing your voice...');

      // Extract MFCC
      const mfcc = await VoiceProcessor.extractMFCC(buffer);
      
      // Normalize for better matching
      const normalizedMFCC = VoiceProcessor.normalizeMFCC(mfcc);

      recorderInstance.cleanup();

      // Authenticate
      await handleAuthenticate(normalizedMFCC);
    } catch (error) {
      console.error('Error processing recording:', error);
      setStatus('❌ Error processing audio. Please try again.');
      setIsRecording(false);
      setIsProcessing(false);
      recorderInstance.cleanup();
    }
  };

  const handleAuthenticate = async (voiceprint: number[]) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          voiceprint: JSON.stringify(voiceprint),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✨ The gate recognizes you! (${(data.similarity * 100).toFixed(1)}% match)`);
        setGateOpen(true);
        
        // Store user session
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('❌ The magic did not recognize your voice.');
        setGateShaking(true);
        setTimeout(() => setGateShaking(false), 500);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setStatus('❌ Authentication failed. Please try again.');
      setGateShaking(true);
      setTimeout(() => setGateShaking(false), 500);
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

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-glow"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Sésame ouvre-toi !
          </motion.h1>
          <p className="text-purple-300 text-lg">
            Speak your magic phrase to unlock the gate
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Magic Gate */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <MagicGate isOpen={gateOpen} isShaking={gateShaking} />
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-indigo-900/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-500/30 p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Email input */}
            <div className="mb-6">
              <label className="block text-purple-300 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-purple-950/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 transition-all"
                placeholder="your@email.com"
                disabled={isProcessing || gateOpen}
              />
            </div>

            {/* Voice authentication */}
            <div className="mb-6">
              <label className="block text-purple-300 mb-4 text-sm font-medium text-center">
                Voice Authentication
              </label>

              <div className="flex justify-center mb-4">
                <MicrophoneButton
                  isRecording={isRecording}
                  onClick={handleStartRecording}
                  audioLevel={audioLevel}
                  disabled={isProcessing || gateOpen || !email}
                />
              </div>

              {/* Instructions */}
              {!isRecording && !gateOpen && (
                <motion.p
                  className="text-center text-purple-300 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {email
                    ? '🎙 Click the microphone and speak your magic phrase'
                    : '👆 Enter your email first'}
                </motion.p>
              )}

              {gateOpen && (
                <motion.p
                  className="text-center text-green-400 text-lg font-semibold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  ✨ Welcome! The gate is opening...
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

            {/* Register link */}
            <div className="text-center pt-4 border-t border-purple-500/30">
              <p className="text-purple-300 text-sm">
                New to the realm?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-purple-400 hover:text-purple-300 underline"
                  disabled={isProcessing || gateOpen}
                >
                  Register here
                </button>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Magical tooltip */}
        {!isRecording && !gateOpen && email && (
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-purple-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-purple-500/50 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-purple-200 text-sm flex items-center gap-2">
              <span className="text-xl">💫</span>
              Say your magic phrase to unlock
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

