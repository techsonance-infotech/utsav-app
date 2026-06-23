"use client";

import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="text-center py-4 bg-orange-50 border border-orange-200/50 rounded-2xl">
        <span className="font-bold text-orange-700 text-sm">🪔 The celebration has begun!</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      <div className="space-y-1">
        <div className="bg-orange-50/50 border border-orange-100/50 py-3 rounded-xl font-bold text-2xl text-orange-600">
          {String(timeLeft.days).padStart(2, "0")}
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days</div>
      </div>
      <div className="space-y-1">
        <div className="bg-orange-50/50 border border-orange-100/50 py-3 rounded-xl font-bold text-2xl text-orange-600">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hours</div>
      </div>
      <div className="space-y-1">
        <div className="bg-orange-50/50 border border-orange-100/50 py-3 rounded-xl font-bold text-2xl text-orange-600">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mins</div>
      </div>
      <div className="space-y-1">
        <div className="bg-orange-50/50 border border-orange-100/50 py-3 rounded-xl font-bold text-2xl text-orange-600 animate-pulse">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secs</div>
      </div>
    </div>
  );
}
