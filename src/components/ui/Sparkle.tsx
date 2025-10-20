import React, { useEffect, useRef } from 'react';

interface SparkleProps {
  x: number;
  y: number;
  onAnimationEnd: () => void;
}

export const Sparkle: React.FC<SparkleProps> = ({ x, y, onAnimationEnd }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAnimationEnd = () => {
      onAnimationEnd();
    };
    ref.current?.addEventListener('animationend', handleAnimationEnd);
    return () => ref.current?.removeEventListener('animationend', handleAnimationEnd);
  }, [onAnimationEnd]);

  return (
    <div
      ref={ref}
      className="sparkle"
      style={{
        left: x,
        top: y,
      }}
    />
  );
};
