"use client";

import { useState, useEffect } from "react";

interface UseEidUnlockReturn {
  isUnlocked: boolean;
  timeRemaining: number;
}

/**
 * Hook to poll for Eid unlock status every second.
 * Accepts an unlockTime (Date object or ISO string) and returns
 * isUnlocked boolean and timeRemaining in milliseconds.
 */
export function useEidUnlock(unlockTime: Date | string): UseEidUnlockReturn {
  const unlockTimeMs = typeof unlockTime === "string" 
    ? new Date(unlockTime).getTime() 
    : unlockTime.getTime();

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return Date.now() >= unlockTimeMs;
  });

  const [timeRemaining, setTimeRemaining] = useState(() => {
    return Math.max(0, unlockTimeMs - Date.now());
  });

  useEffect(() => {
    // Initial check
    const currentTime = Date.now();
    if (currentTime >= unlockTimeMs) {
      setIsUnlocked(true);
      setTimeRemaining(0);
    } else {
      setTimeRemaining(unlockTimeMs - currentTime);
    }

    // Poll every 1 second for smooth countdown
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime >= unlockTimeMs) {
        setIsUnlocked(true);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(Math.max(0, unlockTimeMs - currentTime));
      }
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, [unlockTimeMs]);

  return { isUnlocked, timeRemaining };
}
