import React, { useEffect, useState } from 'react';

interface OverlayNoiseProps {
  intensity: number;
}

export const OverlayNoise: React.FC<OverlayNoiseProps> = ({ intensity }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (intensity === 0) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [intensity]);

  const normalizedIntensity = Math.min(intensity / 100, 1);
  const noiseOpacity = normalizedIntensity * 0.12;
  const scanlineSpeed = 1 + normalizedIntensity * 1.5;
  const vignetteIntensity = normalizedIntensity * 0.35;
  const pixelationAmount = intensity > 85 ? Math.floor(normalizedIntensity * 4) : 0;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0) 1px,
              rgba(0, 0, 0, 0) 2px,
              rgba(0, 0, 0, 0.15) 3px
            )
          `,
          opacity: noiseOpacity,
          animation: `scanline ${3 / scanlineSpeed}s linear infinite`,
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(circle, transparent 50%, rgba(0, 0, 0, ${vignetteIntensity}) 100%)`,
        }}
      />

      {intensity > 50 && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            opacity: Math.min((intensity - 50) * 0.003, 0.15),
            background: 'rgba(0, 0, 0, 0.1)',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 1px,
                rgba(255, 255, 255, 0.03) 1px,
                rgba(255, 255, 255, 0.03) 2px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(255, 255, 255, 0.03) 1px,
                rgba(255, 255, 255, 0.03) 2px
              )
            `,
            backgroundSize: '2px 2px',
          }}
        />
      )}

      {intensity > 85 && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            opacity: 0.3,
            filter: `blur(${pixelationAmount}px)`,
            backdropFilter: `blur(${pixelationAmount}px)`,
          }}
        />
      )}

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </>
  );
};