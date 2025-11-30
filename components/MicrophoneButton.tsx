'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
  audioLevel?: number;
  disabled?: boolean;
}

export default function MicrophoneButton({
  isRecording,
  onClick,
  audioLevel = 0,
  disabled = false,
}: MicrophoneButtonProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Generate particles when recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newParticles = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
        }));
        setParticles((prev) => [...prev, ...newParticles].slice(-20));
      }, 100);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isRecording]);

  const glowIntensity = isRecording ? 0.5 + (audioLevel / 255) * 0.5 : 0.3;

  return (
    <div className="relative flex items-center justify-center">
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.5,
            x: particle.x,
            y: particle.y,
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}

      {/* Outer glow rings */}
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(168, 85, 247, ${glowIntensity}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: isRecording ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isRecording ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-36 h-36 rounded-full border-2 border-purple-500/30"
        animate={{
          scale: isRecording ? [1, 1.3, 1] : 1,
          opacity: isRecording ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: isRecording ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-24 h-24 rounded-full
          bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700
          shadow-2xl shadow-purple-500/50
          flex items-center justify-center
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        animate={{
          boxShadow: isRecording
            ? [
                '0 0 20px rgba(168, 85, 247, 0.5)',
                `0 0 ${40 + audioLevel / 4}px rgba(168, 85, 247, 0.8)`,
                '0 0 20px rgba(168, 85, 247, 0.5)',
              ]
            : '0 0 20px rgba(168, 85, 247, 0.5)',
        }}
        transition={{
          boxShadow: {
            duration: 1,
            repeat: isRecording ? Infinity : 0,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Microphone icon */}
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            scale: isRecording ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isRecording ? Infinity : 0,
          }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </motion.svg>

        {/* Recording indicator */}
        {isRecording && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>

      {/* Audio level visualizer */}
      {isRecording && (
        <div className="absolute -bottom-8 flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-full"
              animate={{
                height: [4, Math.random() * audioLevel / 4 + 8, 4],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

