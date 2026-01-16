import React, { useRef, useEffect } from 'react';

interface SwipeMaskProps {
  children: React.ReactNode;
}

export const SwipeMask: React.FC<SwipeMaskProps> = ({ children }) => {
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = maskRef.current;
    if (!element) return;

    const preventPullToRefresh = (e: TouchEvent) => {
      // Prevent pull-to-refresh and app minimization on swipes
      if (e.touches.length > 1) return; // Allow multi-touch
      
      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      
      // Only prevent if not scrollable content
      if (target.scrollHeight <= target.clientHeight) {
        e.preventDefault();
      }
    };

    element.addEventListener('touchstart', preventPullToRefresh, { passive: false });
    element.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      element.removeEventListener('touchstart', preventPullToRefresh);
      element.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  return (
    <div 
      ref={maskRef} 
      className="fixed inset-0 touch-none"
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
};
