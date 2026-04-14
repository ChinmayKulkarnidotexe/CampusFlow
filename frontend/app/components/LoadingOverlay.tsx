'use client';

import { useEffect } from 'react';

export default function LoadingOverlay() {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-text">Loading CampusFlow...</div>
      <div className="mt-8 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-[#ef6751] animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
