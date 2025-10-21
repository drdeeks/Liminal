import React, { useState, useEffect } from 'react';

interface GameCountdownProps {
  onComplete: () => void;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      const timer = setTimeout(() => onComplete(), 1000);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  const getDisplay = () => {
    if (count > 0) {
      return count;
    }
    return 'Start!';
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-9xl font-black text-white animate-pulse">
        {getDisplay()}
      </div>
    </div>
  );
};
