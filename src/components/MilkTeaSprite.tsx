import React, { useState, useEffect } from 'react';
import { EmotionType, SpriteSize } from '../types';

interface MilkTeaSpriteProps {
  emotion?: EmotionType;
  size?: SpriteSize;
  animate?: boolean;
}

const sizeClasses = {
  large: 'w-32 h-44',
  medium: 'w-24 h-34',
  small: 'w-16 h-22',
};

const steamSizeClasses = {
  large: 'top-0 left-1/2 -translate-x-1/2',
  medium: 'top-0 left-1/2 -translate-x-1/2',
  small: 'top-1 left-1/2 -translate-x-1/2',
};

const MilkTeaSprite: React.FC<MilkTeaSpriteProps> = ({ 
  emotion = 'happy', 
  size = 'medium', 
  animate = true 
}) => {
  const [eyesClosed, setEyesClosed] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, [animate]);

  const renderFace = () => {
    switch (emotion) {
      case 'confused':
        return (
          <>
            <ellipse cx="30" cy="28" rx="4" ry="6" fill="#5C4033" />
            <ellipse cx="50" cy="28" rx="4" ry="6" fill="#5C4033" />
            <path d="M38 40 Q40 44 42 40" stroke="#5C4033" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1="22" y1="24" x2="18" y2="20" stroke="#5C4033" strokeWidth="2" />
            <line x1="58" y1="24" x2="62" y2="20" stroke="#5C4033" strokeWidth="2" />
          </>
        );
      case 'surprised':
        return (
          <>
            <ellipse cx="30" cy="28" rx="6" ry="7" fill="#5C4033" />
            <ellipse cx="50" cy="28" rx="6" ry="7" fill="#5C4033" />
            <ellipse cx="30" cy="26" rx="2" ry="3" fill="#fff" />
            <ellipse cx="50" cy="26" rx="2" ry="3" fill="#fff" />
            <ellipse cx="40" cy="42" rx="6" ry="5" fill="#5C4033" />
          </>
        );
      case 'sleeping':
        return (
          <>
            <line x1="26" y1="28" x2="34" y2="28" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" />
            <line x1="46" y1="28" x2="54" y2="28" stroke="#5C4033" strokeWidth="3" strokeLinecap="round" />
            <path d="M38 38 Q40 40 42 38" stroke="#5C4033" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="18" cy="38" rx="4" ry="3" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="62" cy="38" rx="4" ry="3" fill="#FFB6C1" opacity="0.6" />
          </>
        );
      default:
        return (
          <>
            {eyesClosed ? (
              <>
                <line x1="26" y1="28" x2="34" y2="28" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />
                <line x1="46" y1="28" x2="54" y2="28" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="30" cy="28" rx="4" ry="5" fill="#5C4033" />
                <ellipse cx="50" cy="28" rx="4" ry="5" fill="#5C4033" />
                <ellipse cx="29" cy="26" rx="1.5" ry="2" fill="#fff" />
                <ellipse cx="49" cy="26" rx="1.5" ry="2" fill="#fff" />
              </>
            )}
            <path d="M32 40 Q40 48 48 40" stroke="#5C4033" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="22" cy="36" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
            <ellipse cx="58" cy="36" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
          </>
        );
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${animate ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }}>
      <svg viewBox="0 0 80 100" className="w-full h-full">
        <g className={animate ? 'animate-[shake_3s_ease-in-out_infinite]' : ''}>
          <rect x="10" y="35" width="60" height="55" rx="8" fill="#D4A574" />
          <rect x="10" y="35" width="60" height="20" rx="8" fill="#E8B57A" opacity="0.5" />
          <rect x="18" y="28" width="44" height="12" rx="4" fill="#FFF8F0" />
          <rect x="28" y="8" width="24" height="25" rx="3" fill="#8FBC8F" />
          <rect x="32" y="0" width="16" height="12" rx="2" fill="#8FBC8F" />
          <rect x="12" y="45" width="56" height="8" fill="#F2CB9F" opacity="0.6" />
          <ellipse cx="25" cy="60" rx="8" ry="10" fill="#F9E0C4" opacity="0.7" />
          <ellipse cx="55" cy="65" rx="6" ry="8" fill="#F9E0C4" opacity="0.7" />
          <g transform="translate(10, 15)">
            {renderFace()}
          </g>
        </g>
        {animate && emotion !== 'sleeping' && (
          <g className={steamSizeClasses[size]}>
            <ellipse cx="30" cy="-5" rx="4" ry="6" fill="#D4A574" opacity="0.4" className="animate-[pulseSoft_1.5s_ease-in-out_infinite]" />
            <ellipse cx="40" cy="-8" rx="3" ry="5" fill="#D4A574" opacity="0.3" className="animate-[pulseSoft_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
            <ellipse cx="50" cy="-5" rx="4" ry="6" fill="#D4A574" opacity="0.4" className="animate-[pulseSoft_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default MilkTeaSprite;
