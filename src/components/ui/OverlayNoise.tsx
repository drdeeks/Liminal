import React, { useEffect, useRef, useState } from 'react';

interface OverlayNoiseProps {
  intensity: number;
}

export const OverlayNoise: React.FC<OverlayNoiseProps> = ({ intensity }) => {
  const frameId = useRef<number | null>(null);
  const [scanlineY, setScanlineY] = useState(0);

  const animate = () => {
    setScanlineY(y => (y + 1) % window.innerHeight);
    frameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (intensity > 0) {
      frameId.current = requestAnimationFrame(animate);
    } else {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [intensity]);

  const normalizedIntensity = Math.min(intensity / 100, 1);
  const noiseOpacity = normalizedIntensity * 0.12;
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
          transform: `translateY(${scanlineY}px)`,
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
    </>
  );
};