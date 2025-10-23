import React, { useEffect, useState } from 'react';

interface LiminalBackgroundProps {
  difficulty: number;
  intensity: number;
}

export const LiminalBackground: React.FC<LiminalBackgroundProps> = ({ difficulty, intensity }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const chaosLevel = Math.min(difficulty / 10, 1);
  const pulseSpeed = 1 + chaosLevel * 4;
  const crackIntensity = chaosLevel * 100;
  const colorShift = time * pulseSpeed;

  const baseHue = 200 + Math.sin(colorShift * 0.3) * 60;
  const accentHue = (baseHue + 180 + Math.sin(colorShift * 0.5) * 90) % 360;

  const gradientAngle = 45 + Math.sin(colorShift * 0.2) * 45;

  const saturation = 20 + chaosLevel * 60;
  const lightness = 15 + Math.sin(colorShift) * 5;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(${gradientAngle}deg,
            hsl(${baseHue}, ${saturation}%, ${lightness}%) 0%,
            hsl(${baseHue + 30}, ${saturation - 10}%, ${lightness + 5}%) 50%,
            hsl(${accentHue}, ${saturation}%, ${lightness}%) 100%)`,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-30" style={{ mixBlendMode: 'overlay' }}>
        <defs>
          <filter id="fracture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.01 + chaosLevel * 0.05}
              numOctaves={3 + Math.floor(chaosLevel * 5)}
              seed={Math.floor(time * pulseSpeed)}
            />
            <feDisplacementMap in="SourceGraphic" scale={crackIntensity} />
          </filter>

          <filter id="glow">
            <feGaussianBlur stdDeviation={3 + chaosLevel * 7} result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill={`hsl(${accentHue}, 70%, 50%)`} opacity={chaosLevel * 0.3} filter="url(#fracture)" />
      </svg>

      {chaosLevel > 0.3 && (
        <div className="absolute inset-0">
          {Array.from({ length: Math.floor(chaosLevel * 20) }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                background: `radial-gradient(circle, hsl(${(accentHue + i * 30) % 360}, 80%, 60%) 0%, transparent 70%)`,
                opacity: 0.1 + chaosLevel * 0.2,
                animation: `pulse ${2 / pulseSpeed}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                filter: 'blur(40px)',
                transform: `scale(${1 + Math.sin(time * pulseSpeed + i) * 0.5})`,
              }}
            />
          ))}
        </div>
      )}

      {chaosLevel > 0.5 && (
        <div className="absolute inset-0 opacity-40" style={{ mixBlendMode: 'screen' }}>
          <svg width="100%" height="100%">
            {Array.from({ length: Math.floor(chaosLevel * 30) }).map((_, i) => {
              const x1 = Math.random() * 100;
              const y1 = Math.random() * 100;
              const angle = Math.random() * Math.PI * 2;
              const length = Math.random() * 20 + 10;
              const x2 = x1 + Math.cos(angle) * length;
              const y2 = y1 + Math.sin(angle) * length;

              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={`hsl(${(accentHue + i * 20) % 360}, 100%, 70%)`}
                  strokeWidth={1 + chaosLevel * 2}
                  opacity={0.3 + Math.sin(time * pulseSpeed * 2 + i) * 0.3}
                  style={{
                    filter: 'url(#glow)',
                  }}
                />
              );
            })}
          </svg>
        </div>
      )}

      {chaosLevel > 0.7 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: Math.floor(chaosLevel * 15) }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(Math.sin(time * pulseSpeed + i) * 50 + 50)}%`,
                top: `${(Math.cos(time * pulseSpeed * 0.7 + i) * 50 + 50)}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                background: `radial-gradient(circle, hsl(${(accentHue + i * 40) % 360}, 100%, 70%) 0%, transparent 70%)`,
                opacity: 0.2 + Math.sin(time * pulseSpeed * 3 + i) * 0.2,
                filter: `blur(${30 + chaosLevel * 20}px)`,
                transform: `scale(${1 + Math.sin(time * pulseSpeed * 2 + i) * 0.5})`,
                animation: `spin ${10 / pulseSpeed}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(time * 0.5) * 30}% ${50 + Math.cos(time * 0.3) * 30}%,
            transparent 0%,
            rgba(0, 0, 0, ${chaosLevel * 0.3}) 100%)`,
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};