
import React, { useRef, useEffect } from 'react';
import { useSwipe } from '../../hooks/useSwipe';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

interface SwipeMaskProps {
  onSwipe: (direction: SwipeDirection) => void;
  children: React.ReactNode;
}

export const SwipeMask: React.FC<SwipeMaskProps> = ({ onSwipe, children }) => {
  const swipeRef = useRef<HTMLDivElement>(null);
  const swipeDirection = useSwipe(swipeRef.current);

  useEffect(() => {
    if (swipeDirection) {
      onSwipe(swipeDirection);
    }
  }, [swipeDirection, onSwipe]);

  return (
    <div ref={swipeRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, touchAction: 'none' }}>
      {children}
    </div>
  );
};
