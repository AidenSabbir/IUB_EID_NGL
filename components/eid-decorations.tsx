"use client";

import { motion } from "framer-motion";
import { Star, Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function EidDecorations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stars = [
    { top: "10%", left: "5%", size: 24, delay: 0, color: "text-amber-500/30" },
    { top: "20%", left: "85%", size: 32, delay: 1, color: "text-emerald-500/20" },
    { top: "40%", left: "15%", size: 20, delay: 2, color: "text-indigo-500/20" },
    { top: "60%", left: "80%", size: 28, delay: 0.5, color: "text-amber-500/20" },
    { top: "80%", left: "10%", size: 36, delay: 1.5, color: "text-emerald-500/30" },
    { top: "75%", left: "90%", size: 24, delay: 2.5, color: "text-indigo-500/20" },
  ];

  const sparkles = [
    { top: "15%", left: "75%", size: 20, delay: 0.2 },
    { top: "50%", left: "5%", size: 24, delay: 1.2 },
    { top: "85%", left: "50%", size: 16, delay: 2.2 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      <motion.div
        className="absolute top-[5%] right-[5%] md:top-[10%] md:right-[10%] text-amber-500/20"
        animate={{ 
          rotate: [-5, 5, -5],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        <Moon size={120} strokeWidth={1} fill="currentColor" className="opacity-50" />
      </motion.div>

      {stars.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          className={`absolute ${star.color}`}
          style={{ top: star.top, left: star.left }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Star size={star.size} strokeWidth={1} fill="currentColor" />
        </motion.div>
      ))}

      {sparkles.map((sparkle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute text-amber-400/30"
          style={{ top: sparkle.top, left: sparkle.left }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.8, 1.5, 0.8],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 6,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={sparkle.size} strokeWidth={1.5} />
        </motion.div>
      ))}

      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='currentColor' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 right-0 w-full flex justify-center text-amber-500/20 pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg 
          className="w-full max-w-4xl h-auto" 
          viewBox="0 0 100 40" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="currentColor"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Base line */}
          <rect x="10" y="38" width="80" height="1" />
          
          {/* Left Minaret */}
          <path d="M 14 38 L 14 12 L 16 7 L 18 12 L 18 38 Z" />
          <rect x="13" y="16" width="6" height="0.5" />
          <rect x="13" y="24" width="6" height="0.5" />
          <rect x="13" y="32" width="6" height="0.5" />
          
          {/* Right Minaret */}
          <path d="M 82 38 L 82 12 L 84 7 L 86 12 L 86 38 Z" />
          <rect x="81" y="16" width="6" height="0.5" />
          <rect x="81" y="24" width="6" height="0.5" />
          <rect x="81" y="32" width="6" height="0.5" />
          
          {/* Main Dome */}
          <path d="M 38 38 L 38 25 C 38 10, 62 10, 62 25 L 62 38 Z" />
          
          {/* Left small Dome */}
          <path d="M 23 38 L 23 30 C 23 20, 35 20, 35 30 L 35 38 Z" />
          
          {/* Right small Dome */}
          <path d="M 65 38 L 65 30 C 65 20, 77 20, 77 30 L 77 38 Z" />
          
          {/* Spires */}
          <path d="M 50 11 L 50 4 M 48 7 L 52 7" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M 29 21 L 29 16 M 28 19 L 30 19" stroke="currentColor" strokeWidth="0.4"/>
          <path d="M 71 21 L 71 16 M 70 19 L 72 19" stroke="currentColor" strokeWidth="0.4"/>
          
          {/* Crescent on main spire */}
          <path d="M 50 3 C 51.5 3, 52 1.5, 52 1.5 C 51 2, 50 2, 49 1.5 C 49 1.5, 48.5 3, 50 3 Z" fill="currentColor" />
        </svg>
      </motion.div>
    </div>
  );
}
