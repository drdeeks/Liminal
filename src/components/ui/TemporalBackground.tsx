import React, { useEffect, useState, useMemo, useRef } from 'react';

interface TemporalBackgroundProps {
  phase: number;
  intensity: number;
}

const IMAGES = ['/temporal/1.jpeg', '/temporal/2.jpg', '/temporal/3.jpg'];

export const TemporalBackground: React.FC<TemporalBackgroundProps> = ({ phase, intensity }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const chaos = useMemo(() => Math.min(intensity / 100, 1), [intensity]);
  const opacity = 0.15 + chaos * 0.35;
  const blur = 3 + chaos * 25;
  const saturate = 1 + phase * 0.5;

  useEffect(() => {
    if (intensity === 0) return;
    
    const interval = Math.max(3000, 12000 - intensity * 80);
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % IMAGES.length);
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intensity]);

  if (intensity === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
        style={{
          backgroundImage: `url(${IMAGES[index]})`,
          opacity,
          filter: `blur(${blur}px) saturate(${saturate}) brightness(${0.8 + chaos * 0.4})`,
          mixBlendMode: phase > 3 ? 'screen' : 'overlay',
          transform: `scale(${1 + chaos * 0.1})`,
        }}
      />
    </div>
  );
};