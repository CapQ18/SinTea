import React from 'react';

interface IPCharacterProps {
  size?: 'small' | 'medium' | 'large';
  state?: 'default' | 'happy' | 'confused' | 'surprised' | 'sleepy' | 'angry' | 'loading';
  className?: string;
}

const sizeMap = {
  small: 40,
  medium: 80,
  large: 120,
};

const IPCharacter: React.FC<IPCharacterProps> = ({ 
  size = 'medium', 
  state = 'default', 
  className = '' 
}) => {
  const sizeValue = sizeMap[size];
  
  const getEyeY = () => {
    switch(state) {
      case 'sleepy': return sizeValue * 0.38;
      case 'surprised': return sizeValue * 0.35;
      default: return sizeValue * 0.4;
    }
  };

  const getEyeSize = () => {
    switch(state) {
      case 'surprised': return sizeValue * 0.12;
      case 'sleepy': return sizeValue * 0.02;
      default: return sizeValue * 0.08;
    }
  };

  const getMouthPath = () => {
    const centerX = sizeValue * 0.5;
    const mouthY = sizeValue * 0.55;
    const mouthWidth = sizeValue * 0.2;
    const mouthHeight = sizeValue * 0.08;
    
    switch(state) {
      case 'happy':
        return `M ${centerX - mouthWidth * 1.2} ${mouthY} Q ${centerX} ${mouthY + mouthHeight * 1.5} ${centerX + mouthWidth * 1.2} ${mouthY}`;
      case 'angry':
        return `M ${centerX - mouthWidth} ${mouthY + mouthHeight} Q ${centerX} ${mouthY} ${centerX + mouthWidth} ${mouthY + mouthHeight}`;
      case 'surprised':
        return `M ${centerX - mouthWidth * 0.5} ${mouthY - mouthHeight} A ${mouthWidth * 0.5} ${mouthHeight} 0 0 0 ${centerX + mouthWidth * 0.5} ${mouthY - mouthHeight} L ${centerX + mouthWidth * 0.5} ${mouthY + mouthHeight} A ${mouthWidth * 0.5} ${mouthHeight} 0 0 0 ${centerX - mouthWidth * 0.5} ${mouthY + mouthHeight} Z`;
      case 'confused':
        return `M ${centerX - mouthWidth * 0.5} ${mouthY} L ${centerX + mouthWidth * 0.5} ${mouthY}`;
      default:
        return `M ${centerX - mouthWidth} ${mouthY} Q ${centerX} ${mouthY + mouthHeight} ${centerX + mouthWidth} ${mouthY}`;
    }
  };

  const getTransform = () => {
    switch(state) {
      case 'confused':
        return `rotate(-15deg)`;
      case 'happy':
        return `translateY(0)`;
      default:
        return 'rotate(0deg)';
    }
  };

  const getAnimation = () => {
    switch(state) {
      case 'happy':
        return 'animate-jump';
      case 'loading':
        return 'animate-spin';
      default:
        return 'animate-breathe';
    }
  };

  const getEyebrowPath = () => {
    const centerX = sizeValue * 0.5;
    const browY = sizeValue * 0.32;
    const browWidth = sizeValue * 0.12;
    const browHeight = sizeValue * 0.03;
    
    if (state === 'angry') {
      return [
        `M ${centerX - browWidth} ${browY + browHeight} Q ${centerX - browWidth * 0.5} ${browY} ${centerX} ${browY + browHeight}`,
        `M ${centerX} ${browY + browHeight} Q ${centerX + browWidth * 0.5} ${browY} ${centerX + browWidth} ${browY + browHeight}`
      ];
    }
    return null;
  };

  const eyebrows = getEyebrowPath();

  return (
    <div 
      className={`relative ${getAnimation()} ${className}`}
      style={{ 
        width: sizeValue, 
        height: sizeValue,
        transform: getTransform(),
        transformOrigin: 'center center',
      }}
    >
      {(state === 'loading' || state === 'angry') && (
        <>
          <div 
            className="absolute animate-steam"
            style={{ 
              width: sizeValue * 0.1, 
              height: sizeValue * 0.1,
              backgroundColor: 'rgba(245, 208, 169, 0.5)',
              borderRadius: '50%',
              left: sizeValue * 0.35,
              top: sizeValue * 0.05,
            }}
          />
          <div 
            className="absolute animate-steam"
            style={{ 
              width: sizeValue * 0.08, 
              height: sizeValue * 0.08,
              backgroundColor: 'rgba(245, 208, 169, 0.4)',
              borderRadius: '50%',
              left: sizeValue * 0.5,
              top: sizeValue * 0.02,
              animationDelay: '0.3s',
            }}
          />
          <div 
            className="absolute animate-steam"
            style={{ 
              width: sizeValue * 0.06, 
              height: sizeValue * 0.06,
              backgroundColor: 'rgba(245, 208, 169, 0.3)',
              borderRadius: '50%',
              left: sizeValue * 0.6,
              top: sizeValue * 0.08,
              animationDelay: '0.6s',
            }}
          />
        </>
      )}

      <svg 
        viewBox={`0 0 ${sizeValue} ${sizeValue}`} 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5D0A9" />
            <stop offset="100%" stopColor="#E8B87D" />
          </linearGradient>
          <linearGradient id="lidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF9F0" />
            <stop offset="100%" stopColor="#F5EDE0" />
          </linearGradient>
        </defs>

        <ellipse
          cx={sizeValue * 0.5}
          cy={sizeValue * 0.22}
          rx={sizeValue * 0.42}
          ry={sizeValue * 0.12}
          fill="url(#lidGradient)"
        />

        <rect
          x={sizeValue * 0.08}
          y={sizeValue * 0.2}
          width={sizeValue * 0.84}
          height={sizeValue * 0.55}
          rx={sizeValue * 0.08}
          fill="url(#cupGradient)"
        />

        <rect
          x={sizeValue * 0.08}
          y={sizeValue * 0.2}
          width={sizeValue * 0.84}
          height={sizeValue * 0.08}
          rx={sizeValue * 0.08}
          fill="#FFF9F0"
          opacity="0.3"
        />

        <polygon
          points={`
            ${sizeValue * 0.65},${sizeValue * 0.05}
            ${sizeValue * 0.72},${sizeValue * 0.05}
            ${sizeValue * 0.58},${sizeValue * 0.55}
            ${sizeValue * 0.52},${sizeValue * 0.55}
          `}
          fill="#90C695"
        />

        {eyebrows && eyebrows.map((path, i) => (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="#5C4033"
            strokeWidth={sizeValue * 0.03}
            strokeLinecap="round"
          />
        ))}

        <circle
          cx={sizeValue * 0.38}
          cy={getEyeY()}
          r={getEyeSize()}
          fill="#5C4033"
          className={state !== 'sleepy' ? 'animate-blink' : ''}
        />
        <circle
          cx={sizeValue * 0.62}
          cy={getEyeY()}
          r={getEyeSize()}
          fill="#5C4033"
          className={state !== 'sleepy' ? 'animate-blink' : ''}
        />

        {state === 'sleepy' && (
          <>
            <path
              d={`M ${sizeValue * 0.3} ${sizeValue * 0.38} Q ${sizeValue * 0.38} ${sizeValue * 0.42} ${sizeValue * 0.46} ${sizeValue * 0.36}`}
              fill="none"
              stroke="#5C4033"
              strokeWidth={sizeValue * 0.03}
              strokeLinecap="round"
            />
            <path
              d={`M ${sizeValue * 0.54} ${sizeValue * 0.38} Q ${sizeValue * 0.62} ${sizeValue * 0.42} ${sizeValue * 0.7} ${sizeValue * 0.36}`}
              fill="none"
              stroke="#5C4033"
              strokeWidth={sizeValue * 0.03}
              strokeLinecap="round"
            />
          </>
        )}

        <path
          d={getMouthPath()}
          fill="none"
          stroke="#5C4033"
          strokeWidth={sizeValue * 0.04}
          strokeLinecap="round"
        />

        <circle
          cx={sizeValue * 0.22}
          cy={sizeValue * 0.6}
          r={sizeValue * 0.03}
          fill="#FFFFFF"
          opacity="0.4"
        />
        <circle
          cx={sizeValue * 0.78}
          cy={sizeValue * 0.5}
          r={sizeValue * 0.02}
          fill="#FFFFFF"
          opacity="0.3"
        />
      </svg>

      {state === 'confused' && (
        <div 
          className="absolute"
          style={{ 
            fontSize: sizeValue * 0.3, 
            right: -sizeValue * 0.1, 
            top: sizeValue * 0.1,
            animation: 'float 1s ease-in-out infinite',
          }}
        >
          ?
        </div>
      )}

      {state === 'surprised' && (
        <div 
          className="absolute"
          style={{ 
            fontSize: sizeValue * 0.3, 
            right: -sizeValue * 0.1, 
            top: sizeValue * 0.05,
            animation: 'float 0.8s ease-in-out infinite',
          }}
        >
          !
        </div>
      )}

      {state === 'sleepy' && (
        <>
          <div 
            className="absolute"
            style={{ 
              fontSize: sizeValue * 0.15, 
              right: -sizeValue * 0.05, 
              top: sizeValue * 0.05,
              animation: 'float 1.5s ease-in-out infinite',
              opacity: 0.6,
            }}
          >
            Z
          </div>
          <div 
            className="absolute"
            style={{ 
              fontSize: sizeValue * 0.12, 
              right: sizeValue * 0.05, 
              top: -sizeValue * 0.05,
              animation: 'float 1.5s ease-in-out infinite 0.2s',
              opacity: 0.5,
            }}
          >
            z
          </div>
          <div 
            className="absolute"
            style={{ 
              fontSize: sizeValue * 0.1, 
              right: sizeValue * 0.15, 
              top: -sizeValue * 0.08,
              animation: 'float 1.5s ease-in-out infinite 0.4s',
              opacity: 0.4,
            }}
          >
            z
          </div>
        </>
      )}
    </div>
  );
};

export default IPCharacter;
