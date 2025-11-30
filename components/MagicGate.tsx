'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MagicGateProps {
  isOpen: boolean;
  isShaking?: boolean;
}

export default function MagicGate({ isOpen, isShaking = false }: MagicGateProps) {
  return (
    <div className="relative w-full max-w-md h-96 flex items-center justify-center">
      {/* Portal glow effect when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute inset-0 rounded-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
          >
            {/* Rotating magical portal */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />

            {/* Particle swirl */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i / 20) * Math.PI * 2) * 150],
                  y: [0, Math.sin((i / 20) * Math.PI * 2) * 150],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gate frame */}
      <motion.div
        className="absolute w-full h-full rounded-3xl border-4 border-gradient"
        style={{
          borderImage: 'linear-gradient(135deg, #f59e0b, #a855f7, #3b82f6) 1',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
        }}
        animate={
          isShaking
            ? {
                x: [-5, 5, -5, 5, 0],
                rotate: [-1, 1, -1, 1, 0],
              }
            : {}
        }
        transition={
          isShaking
            ? {
                duration: 0.5,
              }
            : {}
        }
      />

      {/* Left door */}
      <motion.div
        className="absolute left-0 w-1/2 h-full rounded-l-3xl overflow-hidden"
        style={{ transformOrigin: 'left center' }}
        animate={{
          rotateY: isOpen ? -90 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.6, 0.05, 0.01, 0.9],
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 relative">
          {/* Door details */}
          <div className="absolute inset-4 border-2 border-purple-400/30 rounded-2xl" />
          
          {/* Magical runes */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-12 h-12 border-2 border-purple-400/50 rounded-full flex items-center justify-center"
                animate={{
                  opacity: isOpen ? 0 : [0.3, 0.8, 0.3],
                  scale: isOpen ? 0 : [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: isOpen ? 0 : Infinity,
                  delay: i * 0.3,
                }}
              >
                <div className="w-8 h-8 border border-purple-400/50 rounded-full" />
              </motion.div>
            ))}
          </div>

          {/* Door handle */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg" />
        </div>
      </motion.div>

      {/* Right door */}
      <motion.div
        className="absolute right-0 w-1/2 h-full rounded-r-3xl overflow-hidden"
        style={{ transformOrigin: 'right center' }}
        animate={{
          rotateY: isOpen ? 90 : 0,
        }}
        transition={{
          duration: 1.2,
          ease: [0.6, 0.05, 0.01, 0.9],
        }}
      >
        <div className="w-full h-full bg-gradient-to-bl from-purple-900 via-violet-800 to-indigo-900 relative">
          {/* Door details */}
          <div className="absolute inset-4 border-2 border-purple-400/30 rounded-2xl" />
          
          {/* Magical runes */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-12 h-12 border-2 border-purple-400/50 rounded-full flex items-center justify-center"
                animate={{
                  opacity: isOpen ? 0 : [0.3, 0.8, 0.3],
                  scale: isOpen ? 0 : [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: isOpen ? 0 : Infinity,
                  delay: i * 0.3 + 0.15,
                }}
              >
                <div className="w-8 h-8 border border-purple-400/50 rounded-full" />
              </motion.div>
            ))}
          </div>

          {/* Door handle */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg" />
        </div>
      </motion.div>

      {/* Center lock/keyhole */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="absolute z-10 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl"
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            animate={
              isShaking
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [-10, 10, -10, 10, 0],
                  }
                : {
                    boxShadow: [
                      '0 0 20px rgba(251, 191, 36, 0.5)',
                      '0 0 40px rgba(251, 191, 36, 0.8)',
                      '0 0 20px rgba(251, 191, 36, 0.5)',
                    ],
                  }
            }
          >
            {/* Keyhole */}
            <div className="relative">
              <div className="w-4 h-4 bg-purple-900 rounded-full" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-3 bg-purple-900 clip-triangle" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magic sparkles around gate */}
      {!isOpen &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 45}%`,
              top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 45}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
    </div>
  );
}

