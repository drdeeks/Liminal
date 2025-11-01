
import { useState, useEffect } from 'react';

type SwipeDirection = 'up' | 'down' | 'left' | 'right' | null;

interface SwipeOptions {
  threshold?: number; // min distance in pixels to be considered a swipe
}

export const useSwipe = (element: HTMLElement | null, options?: SwipeOptions) => {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const threshold = options?.threshold ?? 75;

  useEffect(() => {
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
      } else { // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          setSwipeDirection(deltaY > 0 ? 'down' : 'up');
        } else {
          setSwipeDirection(null);
        }
      }
    };

    const preventDefault = (e: TouchEvent) => {
      e.preventDefault();
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', preventDefault, { passive: false });


    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', preventDefault);
      setSwipeDirection(null);
    };
  }, [element, threshold]);

  return swipeDirection;
};
