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
      
      const target = e.target as HTMLElement;
      
      // Don't prevent default on buttons, links, or interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input')
      ) {
        return;
      }
      
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
      className="fixed inset-0"
    >
      {children}
    </div>
  );
};
