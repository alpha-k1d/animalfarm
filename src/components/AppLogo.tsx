// src/components/AppLogo.tsx - Official Emblem & Brand Logo for Animal Farm Ghana
import React, { useState } from 'react';
import newOfficialLogo from '../assets/images/ghana_farm_logo_1790346552479.jpg';
import fallbackLogo from '../assets/images/animal_farm_ghana_logo_1789915185546.jpg';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withBorder?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  size = 'md',
  withBorder = true
}) => {
  const [imgSrc, setImgSrc] = useState(newOfficialLogo);

  const sizeMap: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden shadow-md shrink-0 bg-emerald-950 flex items-center justify-center transition-transform ${
        withBorder ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-emerald-950 shadow-amber-500/20' : ''
      } ${sizeMap[size] || sizeMap.md} ${className}`}
      title="Animal Farm Ghana - Agricultural Crops & Livestock Cooperative"
    >
      {/* Official Animal Farm Ghana Circular Seal Emblem */}
      <img
        src={imgSrc}
        alt="Animal Farm Ghana Official Emblem"
        onError={() => setImgSrc(fallbackLogo)}
        className="w-full h-full object-cover object-center select-none"
        loading="eager"
        decoding="async"
      />

      {/* Subtle radial gloss overlay for a polished official seal finish */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-950/20 via-transparent to-amber-300/15 pointer-events-none" />
    </div>
  );
};



