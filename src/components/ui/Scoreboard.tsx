import React from 'react';

interface ScoreboardProps {
  score: number;
  multiplier: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ score, multiplier }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-2xl font-bold bg-black/20 p-3 rounded-lg border-2 border-white/20 backdrop-blur-sm">
      <div className="text-shadow-pop">
        <span className="text-white/70 text-lg font-semibold">SCORE</span>
        <p data-testid="score">{score}</p>
      </div>
      <div className="text-shadow-pop text-right">
        <span className="text-white/70 text-lg font-semibold">MULTIPLIER</span>
        <p>{multiplier}x</p>
      </div>
    </div>
  );
};