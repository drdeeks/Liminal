import React, { useEffect, useRef, useMemo } from 'react';

interface LiminalBackgroundProps {
  difficulty: number;
}

export const LiminalBackground: React.FC<LiminalBackgroundProps> = ({ difficulty }) => {
  const ref = useRef<HTMLDivElement>(null);

  const chaosLevel = useMemo(() => Math.min(difficulty / 10, 1), [difficulty]);

  useEffect(() => {
    let frameId: number;
    const animate = (time: number) => {
      if (ref.current) {
        const pulseSpeed = 1 + chaosLevel * 4;
        const colorShift = time / 1000 * pulseSpeed;

        const baseHue = 200 + Math.sin(colorShift * 0.3) * 60;
        const accentHue = (baseHue + 180 + Math.sin(colorShift * 0.5) * 90) % 360;
        const gradientAngle = 45 + Math.sin(colorShift * 0.2) * 45;
        const saturation = 20 + chaosLevel * 60;
        const lightness = 15 + Math.sin(colorShift) * 5;

        ref.current.style.background = `linear-gradient(${gradientAngle}deg,
          hsl(${baseHue}, ${saturation}%, ${lightness}%) 0%,
          hsl(${baseHue + 30}, ${saturation - 10}%, ${lightness + 5}%) 50%,
          hsl(${accentHue}, ${saturation}%, ${lightness}%) 100%)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [chaosLevel]);

  return <div ref={ref} className="fixed inset-0 overflow-hidden" />;
};