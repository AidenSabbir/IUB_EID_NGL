"use client";

import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function EidDecorations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stars = [
    { top: "15%", left: "10%", size: 32, delay: 0, color: "text-amber-400/60" },
    { top: "25%", left: "80%", size: 40, delay: 1, color: "text-emerald-400/50" },
    { top: "45%", left: "20%", size: 28, delay: 2, color: "text-indigo-400/50" },
    { top: "55%", left: "75%", size: 36, delay: 0.5, color: "text-amber-400/50" },
    { top: "75%", left: "15%", size: 44, delay: 1.5, color: "text-emerald-400/60" },
    { top: "85%", left: "85%", size: 32, delay: 2.5, color: "text-indigo-400/50" },
  ];

  const sparkles = [
    { top: "20%", left: "65%", size: 28, delay: 0.2 },
    { top: "40%", left: "10%", size: 32, delay: 1.2 },
    { top: "70%", left: "55%", size: 24, delay: 2.2 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      
      {/* Hanging Crescent Moon */}
      <motion.div
        className="absolute top-0 right-[10%] md:right-[15%] text-amber-500/80 origin-top flex flex-col items-center"
        animate={{ 
          rotate: [-6, 6, -6],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        {/* The Chain */}
        <div className="w-[2px] h-24 md:h-32 bg-gradient-to-b from-amber-500/0 via-amber-500/50 to-amber-500/80 rounded-full" />
        
        {/* The Moon SVG */}
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="mt-[-10px] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          
          {/* Hanging Star from Moon */}
          <path d="M12 18l1.5-3.5L17 13l-3.5-1.5L12 8l-1.5 3.5L7 13l3.5 1.5z" className="text-amber-300" transform="scale(0.4) translate(18, 30)" />
        </svg>
      </motion.div>

      {/* Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          className={`absolute ${star.color}`}
          style={{ top: star.top, left: star.left }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.25, 1],
            rotate: [0, 45, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Star size={star.size} strokeWidth={1} fill="currentColor" className="drop-shadow-md" />
        </motion.div>
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute text-amber-400/80"
          style={{ top: sparkle.top, left: sparkle.left }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.6, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 5,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={sparkle.size} strokeWidth={1.5} className="drop-shadow-lg" />
        </motion.div>
      ))}

      {/* Prominent Mosque at Bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 w-full flex justify-center text-amber-600/30 dark:text-amber-500/20 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg 
          className="w-full h-auto drop-shadow-2xl" 
          viewBox="0 0 100 40" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="currentColor"
          preserveAspectRatio="none"
          style={{ maxHeight: '35vh', minHeight: '150px' }}
        >
          {/* Base */}
          <rect x="0" y="38" width="100" height="2" />
          
          {/* Outer Left Minaret */}
          <path d="M 5 38 L 5 15 L 7 10 L 9 15 L 9 38 Z" />
          <path d="M 7 10 L 7 5" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="7" cy="4.5" r="0.5" />
          
          {/* Inner Left Minaret */}
          <path d="M 18 38 L 18 10 L 21 4 L 24 10 L 24 38 Z" />
          <path d="M 21 4 L 21 1" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="21" cy="0.5" r="0.5" />
          
          {/* Outer Right Minaret */}
          <path d="M 95 38 L 95 15 L 93 10 L 91 15 L 91 38 Z" />
          <path d="M 93 10 L 93 5" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="93" cy="4.5" r="0.5" />
          
          {/* Inner Right Minaret */}
          <path d="M 82 38 L 82 10 L 79 4 L 76 10 L 76 38 Z" />
          <path d="M 79 4 L 79 1" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="79" cy="0.5" r="0.5" />
          
          {/* Main Central Dome */}
          <path d="M 35 38 L 35 22 C 35 5, 65 5, 65 22 L 65 38 Z" />
          <path d="M 50 8 L 50 2" stroke="currentColor" strokeWidth="0.8"/>
          {/* Crescent on Main Dome */}
          <path d="M 50 1 C 51.5 1, 52 -0.5, 52 -0.5 C 51 0, 50 0, 49 -0.5 C 49 -0.5, 48.5 1, 50 1 Z" fill="currentColor" />

          {/* Left Side Dome */}
          <path d="M 22 38 L 22 28 C 22 15, 38 15, 38 28 L 38 38 Z" />
          <path d="M 30 18 L 30 12" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="30" cy="11.5" r="0.5" />
          
          {/* Right Side Dome */}
          <path d="M 78 38 L 78 28 C 78 15, 62 15, 62 28 L 62 38 Z" />
          <path d="M 70 18 L 70 12" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="70" cy="11.5" r="0.5" />

          {/* Arches on the base of domes */}
          <path d="M 40 38 L 40 30 A 5 5 0 0 1 50 30 L 50 38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M 50 38 L 50 30 A 5 5 0 0 1 60 30 L 60 38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          
        </svg>
      </motion.div>
    </div>
  );
}
