import React from 'react';

interface StrikesDisplayProps {
  strikes: number;
}

const MAX_STRIKES = 3;

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes }) => {
  if (strikes === 0) {
    return null;
  }

  return (
    <div className="flex space-x-3 animate-fade-in">
      {Array.from({ length: strikes }).map((_, i) => (
        <span key={i} className="text-5xl font-bold text-red-500 drop-shadow-lg animate-pulse">
          ✗
        </span>
      ))}
    </div>
  );
};
