import React from 'react';

interface SigilProps {
  level: number;
  experiments: number;
  size?: number;
  onClick?: () => void;
}

export const Sigil: React.FC<SigilProps> = ({ level, experiments, size = 40, onClick }) => {
  // Generate deterministic shapes based on stats
  const rotation = (level * 45) % 360;
  const opacity = 0.6 + (level * 0.08);

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer hover:scale-110 transition-transform active:scale-95' : ''}`}
      style={{ transform: `rotate(${rotation}deg)`, filter: 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.3))' }}
    >
      <defs>
        <linearGradient id="sigilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#39FF14" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon */}
      <polygon 
        points="50 5 95 25 95 75 50 95 5 75 5 25" 
        fill="none" 
        stroke="url(#sigilGrad)" 
        strokeWidth="4" 
        style={{ opacity }}
      />
      {/* Inner Geometry based on experiments */}
      <circle cx="50" cy="50" r={Math.min(experiments * 2, 30)} fill="none" stroke="#39FF14" strokeWidth="2" strokeDasharray="4 4" />
      <path d={`M 50 20 L 80 80 L 20 80 Z`} fill="#39FF14" style={{ opacity: 0.2 }} />
    </svg>
  );
};
