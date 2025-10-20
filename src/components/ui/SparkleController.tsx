import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Sparkle } from './Sparkle';

interface SparkleControllerProps {}

export interface SparkleControllerHandle {
  addSparkle: (x: number, y: number) => void;
}

interface SparkleInstance {
  id: number;
  x: number;
  y: number;
}

export const SparkleController = forwardRef<SparkleControllerHandle, SparkleControllerProps>((props, ref) => {
  const [sparkles, setSparkles] = useState<SparkleInstance[]>([]);
  let sparkleId = 0;

  const addSparkle = useCallback((x: number, y: number) => {
    const newSparkles: SparkleInstance[] = [];
    for (let i = 0; i < 10; i++) {
      newSparkles.push({
        id: sparkleId++,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
  }, []);

  useImperativeHandle(ref, () => ({
    addSparkle,
  }));

  const handleAnimationEnd = (id: number) => {
    setSparkles(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          onAnimationEnd={() => handleAnimationEnd(sparkle.id)}
        />
      ))}
    </div>
  );
});
