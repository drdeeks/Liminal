import React from 'react';

interface StrikesDisplayProps {
  strikes: number;
}

const STRIKE_CHAR = 'X';

export const StrikesDisplay: React.FC<StrikesDisplayProps> = ({ strikes }) => {
  return (
    <div className="flex items-center justify-center gap-2 h-12" aria-label={`${strikes} strikes`}>
      {strikes > 0 && Array.from({ length: strikes }).map((_, index) => (
        <span key={index} className="text-rose-500 text-5xl font-black text-shadow-pop animate-fade-in-scale">
          {STRIKE_CHAR}
        </span>
      ))}
    </div>
  );
};