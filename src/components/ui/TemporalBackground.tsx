import React, { useEffect, useState } from 'react';

interface TemporalBackgroundProps {
  phase: number;
  intensity: number;
}

const COSMIC_IMAGES = [
  'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg',
  'https://images.pexels.com/photos/2162/sky-space-dark-galaxy.jpg',
  'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg',
  'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg',
];

export const TemporalBackground: React.FC<TemporalBackgroundProps> = ({ phase, intensity }) => {
  const [time, setTime] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (intensity === 0) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.025);
    }, 50);
    return () => clearInterval(interval);
  }, [intensity]);

  useEffect(() => {
    if (intensity === 0) return;
    const imageInterval = setInterval(() => {
      setImageIndex(i => (i + 1) % COSMIC_IMAGES.length);
    }, 12000 - Math.min(intensity, 100) * 80);
    return () => clearInterval(imageInterval);
  }, [intensity]);

  const normalizedIntensity = Math.min(intensity / 100, 1);
  const distortionScale = 3 + normalizedIntensity * 12;
  const turbulenceFreq = 0.004 + normalizedIntensity * 0.01;
  const octaves = 2 + Math.floor(normalizedIntensity * 2);
  const pulseSpeed = 1 + normalizedIntensity * 2;
  const glitchIntensity = normalizedIntensity * 30;
  const fractalDensity = Math.min(normalizedIntensity * 6, 10);

  const baseHue = (time * 15 * pulseSpeed) % 360;
  const accentHue = (baseHue + 180 + Math.sin(time * pulseSpeed) * 120) % 360;
  const tertiaryHue = (baseHue + 270 + Math.cos(time * pulseSpeed * 0.7) * 90) % 360;

  const saturation = 40 + normalizedIntensity * 35;
  const brightness = 20 - normalizedIntensity * 8;

  const imageOpacity = 0.12 + normalizedIntensity * 0.28;
  const imageBlur = 4 + normalizedIntensity * 20;
  const imageDistort = normalizedIntensity * 40;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-2000"
        style={{
          background: `
            radial-gradient(circle at ${50 + Math.sin(time * 0.3) * 40}% ${50 + Math.cos(time * 0.4) * 40}%,
              hsl(${baseHue}, ${saturation}%, ${brightness + 15}%) 0%,
              hsl(${accentHue}, ${saturation - 10}%, ${brightness + 5}%) 40%,
              hsl(${tertiaryHue}, ${saturation}%, ${brightness}%) 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-2000"
        style={{
          backgroundImage: `url(${COSMIC_IMAGES[imageIndex]})`,
          opacity: imageOpacity,
          filter: `blur(${imageBlur}px) saturate(${1 + phase * 2}) hue-rotate(${time * pulseSpeed * 10}deg)`,
          transform: `scale(${1.2 + Math.sin(time * pulseSpeed * 0.5) * 0.3}) rotate(${time * pulseSpeed * 2}deg)`,
          mixBlendMode: phase > 3 ? 'screen' : 'overlay',
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 + normalizedIntensity * 0.15 }}>
        <defs>
          <filter id="temporal-fracture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={turbulenceFreq}
              numOctaves={octaves}
              seed={Math.floor(time * pulseSpeed * 10)}
            />
            <feDisplacementMap in="SourceGraphic" scale={distortionScale} />
          </filter>

          <filter id="chromatic-aberration">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feOffset in="red" dx={glitchIntensity * Math.sin(time * pulseSpeed)} dy="0" result="redOffset" />

            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            <feOffset in="blue" dx={-glitchIntensity * Math.sin(time * pulseSpeed)} dy="0" result="blueOffset" />

            <feBlend mode="screen" in="redOffset" in2="green" result="redGreen" />
            <feBlend mode="screen" in="redGreen" in2="blueOffset" />
          </filter>

          <filter id="reality-tear">
            <feTurbulence
              type="turbulence"
              baseFrequency={0.02 + phase * 0.02}
              numOctaves={5}
              seed={Math.floor(time * pulseSpeed * 5)}
            />
            <feDisplacementMap in="SourceGraphic" scale={imageDistort} />
            <feGaussianBlur stdDeviation={phase * 2} />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill={`hsl(${accentHue}, 80%, 50%)`} opacity={normalizedIntensity * 0.08} filter="url(#temporal-fracture)" />
      </svg>

      {intensity > 15 && (
        <div className="absolute inset-0">
          {Array.from({ length: Math.floor(fractalDensity) }).map((_, i) => (
            <div
              key={`fractal-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${(Math.sin(time * pulseSpeed * 0.3 + i * 2) * 45 + 50)}%`,
                top: `${(Math.cos(time * pulseSpeed * 0.4 + i * 1.5) * 45 + 50)}%`,
                width: `${100 + Math.random() * 300}px`,
                height: `${100 + Math.random() * 300}px`,
                background: `radial-gradient(circle, hsl(${(baseHue + i * 40) % 360}, 90%, 60%) 0%, transparent 70%)`,
                opacity: 0.15 + Math.sin(time * pulseSpeed * 2 + i) * 0.15,
                filter: `blur(${35 + normalizedIntensity * 15}px)`,
                transform: `scale(${1 + Math.sin(time * pulseSpeed + i) * 0.5})`,
                mixBlendMode: 'screen',
              }}
            />
          ))}
        </div>
      )}

      {intensity > 30 && (
        <div className="absolute inset-0 opacity-40">
          <svg width="100%" height="100%">
            {Array.from({ length: Math.min(Math.floor(normalizedIntensity * 30), 25) }).map((_, i) => {
              const x1 = Math.sin(time * pulseSpeed + i * 0.5) * 50 + 50;
              const y1 = Math.cos(time * pulseSpeed * 0.7 + i * 0.3) * 50 + 50;
              const angle = time * pulseSpeed * 3 + i;
              const length = 4 + normalizedIntensity * 8;
              const x2 = x1 + Math.cos(angle) * length;
              const y2 = y1 + Math.sin(angle) * length;

              return (
                <line
                  key={`lightning-${i}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={`hsl(${(accentHue + i * 30) % 360}, 100%, 70%)`}
                  strokeWidth={1 + normalizedIntensity * 0.4}
                  opacity={0.4 + Math.sin(time * pulseSpeed * 5 + i) * 0.4}
                  filter="url(#chromatic-aberration)"
                />
              );
            })}
          </svg>
        </div>
      )}

      {intensity > 50 && (
        <div className="absolute inset-0">
          {Array.from({ length: Math.min(Math.floor(normalizedIntensity * 6), 8) }).map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute"
              style={{
                left: `${(Math.sin(time * pulseSpeed * 0.5 + i * 1.2) * 50 + 50)}%`,
                top: `${(Math.cos(time * pulseSpeed * 0.6 + i * 0.9) * 50 + 50)}%`,
                width: `${80 + Math.random() * 200}px`,
                height: `${80 + Math.random() * 200}px`,
                background: `radial-gradient(circle, hsl(${(tertiaryHue + i * 50) % 360}, 100%, 70%) 0%, hsl(${(accentHue + i * 30) % 360}, 90%, 60%) 50%, transparent 80%)`,
                opacity: 0.25 + Math.sin(time * pulseSpeed * 4 + i) * 0.25,
                filter: `blur(${18 + normalizedIntensity * 12}px)`,
                transform: `scale(${1 + Math.sin(time * pulseSpeed * 3 + i * 2) * 0.6}) rotate(${time * pulseSpeed * 100 + i * 45}deg)`,
                mixBlendMode: 'screen',
                animation: `spin ${5 / pulseSpeed}s linear infinite`,
              }}
            />
          ))}
        </div>
      )}

      {intensity > 70 && (
        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'difference' }}>
          {Array.from({ length: Math.min(Math.floor(normalizedIntensity * 12), 15) }).map((_, i) => (
            <div
              key={`glitch-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${50 + Math.random() * 200}px`,
                height: `${2 + Math.random() * 10}px`,
                background: `hsl(${(baseHue + i * 60) % 360}, 100%, 80%)`,
                opacity: Math.sin(time * pulseSpeed * 20 + i) > 0.7 ? 0.8 : 0,
                transform: `translateX(${Math.sin(time * pulseSpeed * 10 + i) * 100}px)`,
              }}
            />
          ))}
        </div>
      )}

      {intensity > 85 && (
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              ${time * pulseSpeed * 50}deg,
              transparent,
              transparent 10px,
              hsl(${accentHue}, 100%, 70%) 10px,
              hsl(${accentHue}, 100%, 70%) 11px
            )`,
            opacity: 0.12 + Math.sin(time * pulseSpeed * 3) * 0.12,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(time * 0.5) * 40}% ${50 + Math.cos(time * 0.3) * 40}%,
            transparent 0%,
            rgba(0, 0, 0, ${normalizedIntensity * 0.12}) 100%)`,
          filter: 'url(#reality-tear)',
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};