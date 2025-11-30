'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string }>>([]);

  useEffect(() => {
    // Generate stars only on client side to avoid hydration mismatch
    setStars(
      Array.from({ length: 50 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      }))
    );

    // Redirect to login after animation
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

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

      {/* Main content */}
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          animate={{
            textShadow: [
              '0 0 20px rgba(168, 85, 247, 0.5)',
              '0 0 40px rgba(168, 85, 247, 0.8)',
              '0 0 20px rgba(168, 85, 247, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Sésame ouvre-toi !
        </motion.h1>

        <motion.p
          className="text-2xl text-purple-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Magic Voice Authentication
        </motion.p>

        <motion.div
          className="flex justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
