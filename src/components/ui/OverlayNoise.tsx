import React, { useEffect, useRef, useMemo } from 'react';

interface OverlayNoiseProps {
  intensity: number;
}

export const OverlayNoise: React.FC<OverlayNoiseProps> = ({ intensity }) => {
  const scanRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>();

  const chaos = useMemo(() => Math.min(intensity / 100, 1), [intensity]);

  useEffect(() => {
    if (intensity === 0 || !scanRef.current) return;

    let y = 0;
    let lastUpdate = 0;
    const updateInterval = 16; // ~60fps

    const animate = (time: number) => {
      if (time - lastUpdate < updateInterval) {
        frameId.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdate = time;

      y = (y + 2) % window.innerHeight;
      if (scanRef.current) {
        scanRef.current.style.transform = `translateY(${y}px)`;
      }

      frameId.current = requestAnimationFrame(animate);
    };

    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [intensity]);

  if (intensity === 0) return null;

  const noiseOpacity = chaos * 0.15;
  const vignetteOpacity = chaos * 0.45;
  const gridOpacity = Math.max(0, (chaos - 0.5) * 0.3);
  const distortionBlur = chaos > 0.85 ? Math.floor(chaos * 5) : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Scanlines */}
      <div
        ref={scanRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.2) 3px)',
          opacity: noiseOpacity,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
        }}
      />

      {/* Grid overlay */}
      {chaos > 0.5 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: gridOpacity,
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px),
              repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)
            `,
            backgroundSize: '3px 3px',
          }}
        />
      )}

      {/* Distortion */}
      {chaos > 0.85 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4,
            backdropFilter: `blur(${distortionBlur}px) contrast(${1 + chaos * 0.3})`,
          }}
        />
      )}
    </div>
  );
};