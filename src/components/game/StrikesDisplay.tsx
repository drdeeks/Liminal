import React from 'react';

interface StrikesDisplayProps {
  strikes: number;
}

const MAX_STRIKES = 3;

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes }) => {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: MAX_STRIKES }).map((_, i) => (
        <span key={i} className={`text-4xl font-bold transition-opacity duration-300 ${i < strikes ? 'text-red-500 opacity-100' : 'opacity-0'}`}>
          X
        </span>
      ))}
    </div>
  );
};
