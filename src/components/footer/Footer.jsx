'use client';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });

  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME;

  return (
    <footer className="font-semibold bg-white border border-gray-200 shadow-lg mx-3 mb-3 rounded-lg shrink-0">
      {/* <footer className="fixed font-semibold bottom-0 left-0 right-0 z-30 bg-white border border-gray-200 shadow-lg mx-3 mb-3 rounded-lg"> */}

      <div className="hidden md:relative xl:flex md:items-center px-4 py-2 h-8">
        <p className="text-xs flex-1 truncate">
          {appName} | Monthly Subscription | Expiring in x days
        </p>
        <p className="text-xs absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Copyright © {now.getFullYear()} - {companyName}. All rights reserved.
        </p>
        <p className="text-xs flex-1 text-right tabular-nums whitespace-nowrap">
          {timeStr} - {dateStr} - {dayStr}
        </p>
      </div>

      <div className="flex xl:hidden flex-col items-center justify-center px-3 py-2 gap-0.5">
        <p className="text-[10px] tabular-nums whitespace-nowrap">
          {timeStr} - {dateStr} - {dayStr}
        </p>
        <p className="text-[10px] whitespace-nowrap">
          Copyright © {now.getFullYear()} - {companyName}. All rights reserved.
        </p>
        <p className="text-[10px] truncate w-full text-center">
          {appName} | Monthly Subscription | Expiring in x days
        </p>
      </div>

    </footer>
  );
}