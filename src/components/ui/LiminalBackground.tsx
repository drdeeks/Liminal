import React, { useEffect, useRef, useMemo } from 'react';

interface LiminalBackgroundProps {
  difficulty: number;
}

export const LiminalBackground: React.FC<LiminalBackgroundProps> = ({ difficulty }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>();

  const chaos = useMemo(() => Math.min(difficulty / 15, 1), [difficulty]);

  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    let lastUpdate = 0;
    const updateInterval = 50; // Update every 50ms for smooth but efficient animation

    const animate = (time: number) => {
      if (time - lastUpdate < updateInterval) {
        frameId.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdate = time;

      const speed = 1 + chaos * 3;
      const t = time / 1000 * speed;

      const hue1 = 200 + Math.sin(t * 0.3) * (30 + chaos * 60);
      const hue2 = (hue1 + 120 + Math.sin(t * 0.5) * (60 + chaos * 120)) % 360;
      const angle = 45 + Math.sin(t * 0.2) * (30 + chaos * 60);
      const sat = 20 + chaos * 70;
      const light = 10 + chaos * 15;

      element.style.background = `linear-gradient(${angle}deg,
        hsl(${hue1}, ${sat}%, ${light}%),
        hsl(${hue1 + 20}, ${sat - 5}%, ${light + 5}%) 50%,
        hsl(${hue2}, ${sat + 10}%, ${light + chaos * 10}%))`;

      frameId.current = requestAnimationFrame(animate);
    };

    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [chaos]);

  return <div ref={ref} className="fixed inset-0" />;
};