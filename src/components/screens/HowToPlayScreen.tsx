import React from 'react';

interface HowToPlayScreenProps {
  onStart: () => void;
  onCancel: () => void;
  onViewLeaderboard: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onStart, onCancel, onViewLeaderboard }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-gray-900 border-2 border-white/20 text-white p-8 rounded-2xl max-w-lg text-center shadow-lg">
        <h2 className="text-4xl font-black mb-4 text-glitter">How to Play</h2>
        <div className="text-lg space-y-4 mb-8">
          <p>Swipe in the direction of the arrow shown on the card.</p>
          <p className="text-rose-400">If the card is a <span className="font-bold">Joker</span>, you must swipe in the <span className="font-bold">opposite</span> direction.</p>
          <p>You get <span className="font-bold text-red-500">three strikes</span>. After the third strike, the game is over.</p>
        </div>
        <div className="bg-yellow-900/50 border-2 border-yellow-500/50 text-yellow-300 p-4 rounded-lg mb-8">
          <h3 className="font-bold text-xl mb-2">Leaderboard Scores</h3>
          <p>Scores are <span className="font-bold">not</span> submitted automatically. You must manually submit your score from the Game Over screen to update the leaderboard.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onStart}
            className="bg-green-600/50 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-green-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm"
          >
            Start Game
          </button>
          <button
            onClick={onViewLeaderboard}
            className="bg-blue-600/50 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-blue-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm"
          >
            Leaderboard
          </button>
          <button
            onClick={onCancel}
            className="bg-red-600/50 text-white font-bold py-3 px-8 rounded-lg text-2xl shadow-lg hover:bg-red-600/70 transform hover:scale-105 transition-transform border-2 border-white/20 backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
