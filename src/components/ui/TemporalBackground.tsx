import React, { useEffect, useState, useMemo, useRef } from 'react';

interface TemporalBackgroundProps {
  phase: number;
  intensity: number;
}

const COSMIC_IMAGES = [
  '/temporal/1.jpeg',
  '/temporal/2.jpg',
  '/temporal/3.jpg',
];

export const TemporalBackground: React.FC<TemporalBackgroundProps> = ({ phase, intensity }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const time = useRef(0);
  const frameId = useRef<number | null>(null);

  const normalizedIntensity = useMemo(() => Math.min(intensity / 100, 1), [intensity]);

  const animate = () => {
    time.current += 0.025;
    // We can update some less performance-critical things here if needed
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

  useEffect(() => {
    if (intensity === 0) return;
    const imageInterval = setInterval(() => {
      setImageIndex(i => (i + 1) % COSMIC_IMAGES.length);
    }, 12000 - Math.min(intensity, 100) * 80);
    return () => clearInterval(imageInterval);
  }, [intensity]);

  const imageOpacity = 0.12 + normalizedIntensity * 0.28;
  const imageBlur = 4 + normalizedIntensity * 20;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-2000"
        style={{
          backgroundImage: `url(${COSMIC_IMAGES[imageIndex]})`,
          opacity: imageOpacity,
          filter: `blur(${imageBlur}px) saturate(${1 + phase * 2})`,
          mixBlendMode: phase > 3 ? 'screen' : 'overlay',
        }}
      />
    </div>
  );
};