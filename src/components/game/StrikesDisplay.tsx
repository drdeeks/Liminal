import React from 'react';

interface StrikesDisplayProps {
  strikes: number;
}

const STRIKE_CHAR = 'X';

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes }) => {
  if (strikes === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${strikes} strikes`}>
      {Array.from({ length: strikes }).map((_, index) => (
        <span key={index} className="text-rose-500 text-5xl font-black text-shadow-pop animate-fade-in-scale">
          {STRIKE_CHAR}
        </span>
      ))}
    </div>
  );
};