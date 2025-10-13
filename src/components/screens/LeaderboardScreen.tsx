import React from 'react';

interface LeaderboardScreenProps {
  totalScore: number;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ totalScore, onBack }) => {
  return (
    <div className="w-full max-w-md mx-auto p-4 text-white animate-fade-in">
      <h1 className="text-5xl font-black text-center mb-6 text-shadow-pop">Leaderboard</h1>
      <div className="bg-black/20 rounded-lg p-8 h-[60vh] flex flex-col items-center justify-center border-2 border-white/20 backdrop-blur-sm">
        <p className="text-2xl text-white/70 mb-2 text-shadow-pop">Total Score</p>
        <p className="text-8xl font-bold text-shadow-pop">{totalScore.toLocaleString()}</p>
      </div>
      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="bg-black/20 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-black/40 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm text-shadow-pop"
        >
          Back to Start
        </button>
      </div>
    </div>
  );
};