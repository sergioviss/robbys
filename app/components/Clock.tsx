"use client";

import { useState, useEffect } from 'react';

const TIMEZONE = 'America/Hermosillo';

export default function Clock() {
  const [timeString, setTimeString] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('es-MX', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setTimeString(formatted);
    };

    // Set initial time on client mount
    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!timeString) {
    return <span>--:--:--</span>;
  }

  return (
    <span>{timeString}</span>
  );
}