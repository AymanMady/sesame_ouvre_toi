'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string }>>([]);

  useEffect(() => {
    // Generate stars only on client side to avoid hydration mismatch
    setStars(
      Array.from({ length: 100 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      }))
    );

    // Check if user is authenticated
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
    } else {
      setUserEmail(email);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    router.push('/login');
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

      {/* Magical portal animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Rotating portal rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              borderColor: `rgba(168, 85, 247, ${0.3 - i * 0.05})`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        ))}

        {/* Central glow */}
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Particle swirl */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [
                0,
                Math.cos((i / 30) * Math.PI * 2) * 200,
                Math.cos((i / 30) * Math.PI * 2 + Math.PI) * 200,
                0,
              ],
              y: [
                0,
                Math.sin((i / 30) * Math.PI * 2) * 200,
                Math.sin((i / 30) * Math.PI * 2 + Math.PI) * 200,
                0,
              ],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Welcome card */}
        <motion.div
          className="bg-gradient-to-br from-purple-900/30 via-violet-900/30 to-indigo-900/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-500/30 p-12 text-center"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {/* Success icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 1,
            }}
          >
            <div className="relative">
              <motion.div
                className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(34, 197, 94, 0.5)',
                    '0 0 60px rgba(34, 197, 94, 0.8)',
                    '0 0 30px rgba(34, 197, 94, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  />
                </svg>
              </motion.div>

              {/* Sparkles around checkmark */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 80}%`,
                    top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 80}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1 + 1.5,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Welcome message */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            ✨ The Gate Recognizes You
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-purple-200 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.7 }}
          >
            Welcome to the magical realm!
          </motion.p>

          {userEmail && (
            <motion.p
              className="text-purple-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.9 }}
            >
              Authenticated as: <span className="font-semibold">{userEmail}</span>
            </motion.p>
          )}

          {/* Magical message */}
          <motion.div
            className="bg-purple-950/50 border border-purple-500/30 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.1 }}
          >
            <p className="text-purple-200 text-lg leading-relaxed">
              Your voice has unlocked the ancient gate. The magic flows through you.
              You now have access to the mystical realm beyond.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.3 }}
          >
            <motion.button
              onClick={handleLogout}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 Close the Gate (Logout)
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating magical elements */}
        <motion.div
          className="absolute -top-8 -left-8"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="text-6xl">✨</div>
        </motion.div>

        <motion.div
          className="absolute -top-8 -right-8"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        >
          <div className="text-6xl">🌟</div>
        </motion.div>

        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        >
          <div className="text-6xl">💫</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

