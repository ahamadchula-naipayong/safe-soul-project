import React from 'react';

export function SacredGeometryPattern({ className = "opacity-10" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="400" r="320" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="400" cy="400" r="240" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
        <circle cx="400" cy="400" r="160" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />
        <circle cx="400" cy="400" r="80" stroke="#F59E0B" strokeWidth="1" />

        {/* 8-pointed star geometry */}
        <polygon
          points="400,80 470,260 650,260 510,380 570,560 400,450 230,560 290,380 150,260 330,260"
          stroke="#F59E0B"
          strokeWidth="1"
          opacity="0.4"
        />
        <polygon
          points="400,120 450,280 620,280 480,390 540,550 400,440 260,550 320,390 180,280 350,280"
          stroke="#F59E0B"
          strokeWidth="0.8"
          opacity="0.3"
          transform="rotate(45 400 400)"
        />

        {/* Diagonal axis rays */}
        <line x1="80" y1="80" x2="720" y2="720" stroke="#F59E0B" strokeWidth="0.5" opacity="0.25" />
        <line x1="720" y1="80" x2="80" y2="720" stroke="#F59E0B" strokeWidth="0.5" opacity="0.25" />
        <line x1="400" y1="40" x2="400" y2="760" stroke="#F59E0B" strokeWidth="0.5" opacity="0.25" />
        <line x1="40" y1="400" x2="760" y2="400" stroke="#F59E0B" strokeWidth="0.5" opacity="0.25" />
      </svg>
    </div>
  );
}

export function GoldGlowOrb({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full bg-gradient-to-tr from-amber-500/20 via-gold-warm/15 to-transparent blur-3xl ${className}`}
    />
  );
}
