import React, { useState, useEffect } from "react";

interface FestivalCountdownProps {
  title: string;
  targetDate: string; // ISO format or valid date string
  subtitle?: string;
}

export function FestivalCountdown({ title, targetDate, subtitle }: FestivalCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-850 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
      <div className="text-center md:text-left space-y-1 relative z-10">
        <h3 className="text-lg font-bold text-neutral-100 font-serif">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      </div>

      <div className="flex gap-4 relative z-10">
        {timeBlocks.map((block, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-950 border border-neutral-805 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-extrabold text-orange-400 font-mono">
                {String(block.value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mt-2">
              {block.label}
            </span>
          </div>
        ))}
      </div>

      {/* Decorative background glow */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
