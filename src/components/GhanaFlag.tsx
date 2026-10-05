// src/components/GhanaFlag.tsx - Crisp Vector SVG National Flag of Ghana (Real Graphic, Not an Emoji)
import React from 'react';

interface GhanaFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GhanaFlag: React.FC<GhanaFlagProps> = ({ className, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-3' : size === 'md' ? 'w-6 h-4' : 'w-8 h-5.5';

  return (
    <svg 
      className={`inline-block rounded-xs overflow-hidden shadow-xs shrink-0 select-none align-middle ${sizeClass} ${className || ''}`}
      viewBox="0 0 640 480" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flag of Ghana"
    >
      {/* Red Stripe */}
      <rect width="640" height="160" fill="#CE1126" />
      {/* Yellow Stripe */}
      <rect y="160" width="640" height="160" fill="#FCD116" />
      {/* Green Stripe */}
      <rect y="320" width="640" height="160" fill="#006B3F" />
      {/* Black 5-pointed Star of African Freedom */}
      <polygon 
        points="320,175 342,243 414,243 356,285 378,353 320,311 262,353 284,285 226,243 298,243" 
        fill="#000000" 
      />
    </svg>
  );
};
