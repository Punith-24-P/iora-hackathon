'use client';

import React, { useState, useEffect } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    // 5 November 2026 09:00:00 IST
    const targetDate = new Date('2026-11-05T09:00:00+05:30').getTime();

    const calculateTime = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-6">
      {[
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HOURS', value: timeLeft.hours },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds },
      ].map((item, idx) => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center px-4 py-3 sm:px-6 sm:py-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.08)] min-w-[76px] sm:min-w-[96px]"
        >
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-sky-500">
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-cyan-300/80 tracking-widest mt-1 font-mono">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
