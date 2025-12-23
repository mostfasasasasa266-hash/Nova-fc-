
import React from 'react';

interface NovaIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

const NovaIcon: React.FC<NovaIconProps> = ({ className = "", size = 64, glow = true }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Outer Glow Effect */}
      {glow && (
        <div className="absolute inset-0 bg-[#bef264]/20 blur-xl rounded-full animate-pulse"></div>
      )}
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_10px_rgba(190,242,100,0.5)]"
      >
        {/* Abstract N Shards */}
        <path 
          d="M30 25V75L45 60V25L30 25Z" 
          fill="url(#paint0_linear)" 
          className="animate-[shimmer_3s_infinite]"
        />
        <path 
          d="M70 75V25L55 40V75L70 75Z" 
          fill="url(#paint1_linear)" 
          className="animate-[shimmer_3s_infinite]"
        />
        
        {/* The Neural Connectors (The Spark) */}
        <path 
          d="M45 45L55 55M45 35L55 45M45 55L55 65" 
          stroke="#bef264" 
          strokeWidth="3" 
          strokeLinecap="round" 
          className="animate-pulse"
        />
        
        {/* Core Tech Node */}
        <circle cx="50" cy="50" r="4" fill="#bef264">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>

        <defs>
          <linearGradient id="paint0_linear" x1="37.5" y1="25" x2="37.5" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bef264" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="62.5" y1="25" x2="62.5" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#bef264" />
          </linearGradient>
        </defs>
      </svg>
      
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; filter: brightness(1.2); }
        }
      `}</style>
    </div>
  );
};

export default NovaIcon;
