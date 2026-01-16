import React from 'react';

interface StrikesDisplayProps {
  strikes: number;
}

const MAX_STRIKES = 3;

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes }) => {
  const strikesUsed = MAX_STRIKES - strikes;
  
  if (strikesUsed === 0) {
    return null;
  }

  return (
    <div className="flex space-x-3 animate-fade-in">
      {Array.from({ length: strikesUsed }).map((_, i) => (
        <span key={i} className="text-5xl font-bold text-red-500 drop-shadow-lg animate-pulse">
          ✗
        </span>
      ))}
    </div>
  );
};
